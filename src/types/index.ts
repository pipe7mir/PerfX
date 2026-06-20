export type TransactionType = 'POS' | 'INT';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type AlertLevel = 'low' | 'medium' | 'high' | 'critical';

export type Verdict = 'CONTACTAR_CLIENTE' | 'DESCARTAR' | 'APROBAR_TRX';

export interface MCC {
  code: string;
  description: string;
  base_risk_score: number;
  is_active?: boolean;
}

export interface EvaluationInput {
  transactionType: TransactionType;
  hasPriorContact: boolean;
  priorContactCount: number;
  priorContactMaxValue: number;
  mccCode: string;
  currentTrxValue: number;
  trxCountLast24h: number;
}

export interface RuleConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  threshold: number;
  weight: number;
  condition?: string;
}

export interface RuleResult {
  ruleId: string;
  ruleName: string;
  alertLevel: AlertLevel;
  reason: string;
  score: number;
}

export interface EvaluationResult {
  verdict: Verdict;
  riskScore: number;
  triggeredRules: RuleResult[];
  historicalAvg: number;
  historicalMax: number;
  currentValue: number;
  currentFrequency: number;
  historicalFrequency: number;
  merchantMemory?: MerchantMemory;
}

export interface MerchantMemory {
  mccCode: string;
  averageAmount: number;
  maxAmount: number;
  totalTransactions: number;
  frequencyAvg: number;
  lastTransactionDate: string;
  riskScore: number;
}

export interface MerchantMemoryRecord {
  mcc_code: string;
  transaction_amount: number;
  transaction_type: TransactionType;
  risk_score: number;
  created_at: string;
}

// PERFX Database mappings
export type UserRole = 'admin' | 'supervisor' | 'analista' | 'guest';
export type Mcc = MCC;
export interface FraudRule {
  id?: string;
  name: string;
  description: string;
  condition: string;
  severity: string;
  action: string;
  is_active: boolean;
}
export interface Evaluation {
  transaction_id: string;
  analyst_id?: string;
  mcc_code: string;
  amount: number;
  currency: string;
  calculated_risk_score: number;
  verdict: string;
  applied_rules: any;
  notes?: string;
}

export interface User {
  id?: string;
  email: string;
  role: UserRole;
  password?: string;
  avatar_url?: string;
  cover_url?: string;
  is_active?: boolean;
  is_2fa_enabled?: boolean;
  created_at?: string;
  mustChangePassword?: boolean;
}


