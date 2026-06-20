import type { EvaluationInput, EvaluationResult, RuleConfig, User, Mcc } from '../types';
import { uploadToCloudinary } from '../lib/cloudinary';

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL ?? 'http://localhost:5000';

let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem('perfx_access_token', access);
  localStorage.setItem('perfx_refresh_token', refresh);
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('perfx_access_token');
  localStorage.removeItem('perfx_refresh_token');
}

export function loadTokens() {
  accessToken = localStorage.getItem('perfx_access_token');
  refreshToken = localStorage.getItem('perfx_refresh_token');
}

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshToken) return false;
  try {
    const response = await fetch(`${GATEWAY_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) return false;
    const data = await response.json();
    setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${GATEWAY_URL}${path}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response = await fetch(url, {
    headers,
    ...options,
  });

  if (response.status === 401 && refreshToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${accessToken}`;
      response = await fetch(url, { headers, ...options });
    } else {
      clearTokens();
      window.location.href = '/login';
      throw new Error('Sesión expirada');
    }
  }

  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      const text = await response.text().catch(() => '');
      if (text) errorMessage = text;
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

export const api = {
  async evaluate(input: EvaluationInput): Promise<EvaluationResult & { transactionId?: string; processingTimeMs?: number }> {
    return request('/api/v1/evaluaciones/evaluar', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async getState(): Promise<{
    rules: RuleConfig[];
    fastApiOnline: boolean;
    engine: { name: string; version: string; mode: string };
    timestamp: string;
  }> {
    return request('/api/v1/state');
  },

  async health(): Promise<{ status: string; service: string }> {
    return request('/health');
  },

  auth: {
    async login(email: string, password: string): Promise<any> {
      const response = await fetch(`${GATEWAY_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'Credenciales inválidas');
      }
      const data = await response.json();
      // Si requiere MFA, devolvemos el reto sin setear tokens
      if (data.nextStep === 'MFA_REQUIRED') {
        return data;
      }
      setTokens(data.accessToken, data.refreshToken);
      return data;
    },
    async verifyLoginMfa(mfaToken: string, totpCode: string): Promise<any> {
      const response = await fetch(`${GATEWAY_URL}/api/v1/auth/login/verify-mfa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mfaToken, totpCode }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'Código inválido');
      }
      const data = await response.json();
      setTokens(data.accessToken, data.refreshToken);
      return data;
    },
    async register(name: string, email: string, password: string): Promise<void> {
      const response = await fetch(`${GATEWAY_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'Error al crear la cuenta');
      }
    },
    async generate2FA(): Promise<{ secret: string; qrCode: string }> {
      return request('/api/v1/auth/2fa/generate', { method: 'POST' });
    },
    async enable2FA(token: string, secret: string): Promise<void> {
      await request('/api/v1/auth/2fa/enable', {
        method: 'POST',
        body: JSON.stringify({ token, secret }),
      });
    },
    async disable2FA(): Promise<void> {
      await request('/api/v1/auth/2fa/disable', { method: 'POST' });
    }
  },

  rules: {
    async list(): Promise<RuleConfig[]> {
      return request('/api/v1/rules');
    },
    async create(rule: Partial<RuleConfig>): Promise<RuleConfig> {
      return request('/api/v1/rules', {
        method: 'POST',
        body: JSON.stringify(rule),
      });
    },
    async update(id: string, updates: Partial<RuleConfig>): Promise<RuleConfig> {
      return request(`/api/v1/rules/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
    async delete(id: string): Promise<{ success: boolean }> {
      return request(`/api/v1/rules/${id}`, {
        method: 'DELETE',
      });
    }
  },

  memory: {
    async get(mccCode: string): Promise<{ averageAmount: number; cumulativeFrequency: number } | null> {
      return request(`/api/v1/memory/${mccCode}`);
    },
    async store(mccCode: string, transactionAmount: number, riskScore: number): Promise<void> {
      await request('/api/v1/memory', {
        method: 'POST',
        body: JSON.stringify({ mccCode, transactionAmount, riskScore }),
      });
    }
  },

  mcc: {
    async list(): Promise<Mcc[]> {
      return request('/api/v1/mcc');
    },
    async insert(mcc: Mcc): Promise<void> {
      await request('/api/v1/mcc', {
        method: 'POST',
        body: JSON.stringify(mcc),
      });
    },
    async findByCode(code: string): Promise<Mcc | null> {
      return request<Mcc | null>(`/api/v1/mcc/${code}`).catch(() => null);
    }
  },

  users: {
    async list(): Promise<User[]> {
      return request('/api/v1/users');
    },
    async insert(user: Partial<User>): Promise<void> {
      await request('/api/v1/users', {
        method: 'POST',
        body: JSON.stringify(user),
      });
    },
    async update(id: string, updates: Partial<User>): Promise<void> {
      await request(`/api/v1/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
    async delete(id: string): Promise<void> {
      await request(`/api/v1/users/${id}`, {
        method: 'DELETE',
      });
    },
    async findByEmail(email: string): Promise<User | null> {
      // Find locally from list to avoid a new specific endpoint, or just assume backend has a way.
      // But we can just use the list for now, or assume findByEmail is mostly handled by login.
      // Actually let's just fetch all and filter since it's an admin dashboard.
      const users = await request<User[]>('/api/v1/users');
      return users.find(u => u.email === email) || null;
    }
  },

  evaluations: {
    async list(): Promise<any[]> {
      return request('/api/v1/evaluations');
    },
    async store(record: any): Promise<void> {
      // Evaluations are automatically stored by the evaluate endpoint, but if the client needs to manually store one:
      await request('/api/v1/evaluaciones', {
        method: 'POST',
        body: JSON.stringify(record),
      });
    }
  },

  storage: {
    async uploadAvatar(file: File): Promise<string> {
      return uploadToCloudinary(file);
    },
    async uploadCover(file: File): Promise<string> {
      return uploadToCloudinary(file);
    }
  }
};
