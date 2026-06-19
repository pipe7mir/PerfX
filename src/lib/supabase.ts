import { createClient } from '@supabase/supabase-js';
import type { Mcc, FraudRule, Evaluation, User } from '../types';
import { uploadToCloudinary } from './cloudinary';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

export const db = {
  mcc: {
    async list(): Promise<Mcc[]> {
      const { data, error } = await supabase.from('mcc_catalog').select('*').order('code');
      if (error) throw error;
      return (data ?? []) as Mcc[];
    },
    async insert(mcc: Mcc): Promise<void> {
      const { error } = await supabase.from('mcc_catalog').upsert(mcc as never);
      if (error) throw error;
    },
    async findByCode(code: string): Promise<Mcc | null> {
      const { data, error } = await supabase.from('mcc_catalog').select('*').eq('code', code).single();
      if (error && error.code !== 'PGRST116') throw error;
      return data as Mcc | null;
    }
  },
  rules: {
    async list(): Promise<FraudRule[]> {
      const { data, error } = await supabase.from('reglas_fraude').select('*');
      if (error) throw error;
      return (data ?? []) as FraudRule[];
    },
    async update(rule: FraudRule): Promise<void> {
      const { error } = await supabase.from('reglas_fraude').upsert(rule as never);
      if (error) throw error;
    },
  },
  evaluations: {
    async list(): Promise<any[]> {
      // Usamos inner join con usuarios para obtener el email del analista
      const { data, error } = await supabase
        .from('historial_evaluaciones')
        .select(`
          *,
          usuarios(email)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    async store(record: Evaluation): Promise<void> {
      const { error } = await supabase.from('historial_evaluaciones').insert(record as never);
      if (error) throw error;
    }
  },
  users: {
    async list(): Promise<User[]> {
      const { data, error } = await supabase.from('usuarios').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as User[] ?? [];
    },
    async insert(user: Partial<User>): Promise<void> {
      const { error } = await supabase.from('usuarios').insert(user as never);
      if (error) throw new Error(`${error.message} ${error.details || ''}`);
    },
    async update(id: string, updates: Partial<User>): Promise<void> {
      const { error } = await supabase.from('usuarios').update(updates as never).eq('id', id);
      if (error) throw new Error(`${error.message} ${error.details || ''}`);
    },
    async findByEmail(email: string): Promise<User | null> {
      const { data, error } = await supabase.from('usuarios').select('*').eq('email', email).maybeSingle();
      if (error) throw error;
      return data as User | null;
    },
    async delete(id: string): Promise<void> {
      const { error } = await supabase.from('usuarios').delete().eq('id', id);
      if (error) throw new Error(`${error.message} ${error.details || ''}`);
    }
  },
  storage: {
    async uploadAvatar(file: File): Promise<string> {
      return await uploadToCloudinary(file);
    },
    async uploadCover(file: File): Promise<string> {
      return await uploadToCloudinary(file);
    }
  }
};
