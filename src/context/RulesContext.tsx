import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { api } from '../services/api';
import type { RuleConfig, EvaluationInput, RuleResult, MCC } from '../types';
import { defaultRules } from '../data/defaultRules';
import { offlineDB } from '../lib/offline';

interface RulesState {
  rules: RuleConfig[];
  updateRule: (id: string, updates: Partial<RuleConfig>) => void;
  toggleRule: (id: string) => void;
  evaluate: (input: EvaluationInput, mcc: MCC | undefined) => RuleResult[];
  resetRules: () => void;
  setRules: (rules: RuleConfig[]) => void;
  addRule: (rule: Partial<RuleConfig>) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
}

const RulesContext = createContext<RulesState | null>(null);

export function RulesProvider({ children }: { children: ReactNode }) {
  const [rulesState, setRulesState] = useState<RuleConfig[]>(defaultRules);

  useEffect(() => {
    (async () => {
      const cached = await offlineDB.getRules();
      if (cached.length > 0) {
        setRulesState(cached);
      } else {
        await offlineDB.saveRules(defaultRules);
      }

      try {
        const remote = await api.rules.list();
        if (remote.length > 0) {
          setRulesState(remote);
          await offlineDB.saveRules(remote);
        }
      } catch { /* offline */ }
    })();
  }, []);

  const persist = useCallback(async (updated: RuleConfig[]) => {
    await offlineDB.saveRules(updated);
    try {
      for (const rule of updated) {
        await api.rules.update(rule.id, rule);
      }
    } catch { /* offline */ }
  }, []);

  const updateRule = useCallback((id: string, updates: Partial<RuleConfig>) => {
    setRulesState(prev => {
      const updated = prev.map(r => (r.id === id ? { ...r, ...updates } : r));
      persist(updated);
      return updated;
    });
  }, [persist]);

  const toggleRule = useCallback((id: string) => {
    setRulesState(prev => {
      const updated = prev.map(r => (r.id === id ? { ...r, enabled: !r.enabled } : r));
      persist(updated);
      return updated;
    });
  }, [persist]);

  const resetRules = useCallback(() => {
    setRulesState(defaultRules);
    persist(defaultRules);
  }, [persist]);

  const setRules = useCallback((updated: RuleConfig[]) => {
    setRulesState(updated);
    persist(updated);
  }, [persist]);

  const addRule = useCallback(async (rule: Partial<RuleConfig>) => {
    try {
      const newRule = await api.rules.create(rule);
      setRulesState(prev => {
        const updated = [...prev, newRule];
        offlineDB.saveRules(updated);
        return updated;
      });
    } catch (err) {
      console.error('Error adding rule:', err);
    }
  }, []);

  const deleteRule = useCallback(async (id: string) => {
    try {
      await api.rules.delete(id);
      setRulesState(prev => {
        const updated = prev.filter(r => r.id !== id);
        offlineDB.saveRules(updated);
        return updated;
      });
    } catch (err) {
      console.error('Error deleting rule:', err);
    }
  }, []);

  const evaluate = useCallback((input: EvaluationInput, mcc: MCC | undefined): RuleResult[] => {
    const results: RuleResult[] = [];

    if (mcc && mcc.base_risk_score > 0) {
      const baseScore = Math.round(mcc.base_risk_score * 0.35);
      results.push({
        ruleId: 'base-mcc-risk', ruleName: 'Riesgo Base del Comercio',
        alertLevel: mcc.base_risk_score >= 80 ? 'high' : 'medium',
        reason: `MCC ${mcc.code} (${mcc.description}) riesgo intrínseco de ${mcc.base_risk_score}.`,
        score: baseScore,
      });
    }

    for (const rule of rulesState) {
      if (!rule.enabled) continue;
      switch (rule.id) {
        case 'amount-deviation':
          if (input.hasPriorContact && input.currentTrxValues[0] > input.priorContactMaxValue * rule.threshold) {
            const ratio = input.currentTrxValues[0] / (input.priorContactMaxValue || 1);
            results.push({
              ruleId: rule.id, ruleName: rule.name, alertLevel: 'high',
              reason: `TRX actual ($${input.currentTrxValues[0].toLocaleString()}) supera ${rule.threshold}x el máximo histórico.`,
              score: Math.min(40, Math.round((ratio / 2) * rule.weight)),
            });
          }
          break;
        case 'unknown-merchant':
          if (!input.hasPriorContact) {
            const sev = Math.min(1, input.currentTrxValues[0] / rule.threshold);
            const score = Math.min(50, Math.round(sev * 40) + 15);
            results.push({
              ruleId: rule.id, ruleName: rule.name,
              alertLevel: score > 35 ? 'critical' : 'high',
              reason: `Sin contacto previo. Monto elevado ($${input.currentTrxValues[0].toLocaleString()}).`,
              score,
            });
          }
          break;
        case 'high-frequency':
          if (input.trxCountLast24h > rule.threshold) {
            const excess = input.trxCountLast24h - rule.threshold;
            results.push({
              ruleId: rule.id, ruleName: rule.name,
              alertLevel: excess > 5 ? 'critical' : 'high',
              reason: `${input.trxCountLast24h} TRX en 24h (umbral: ${rule.threshold}).`,
              score: Math.min(30, excess * 5 + 10),
            });
          }
          break;
        case 'amount-threshold':
          if (input.currentTrxValues[0] > rule.threshold) {
            results.push({
              ruleId: rule.id, ruleName: rule.name,
              alertLevel: 'high',
              reason: `Monto (${input.currentTrxValues[0]}) supera el umbral de ${rule.threshold}`,
              score: rule.weight,
            });
          }
          break;
        case 'risk-channel':
          if (input.transactionType === 'INT') {
            const extra = mcc && mcc.base_risk_score >= 70 ? 25 : 15;
            results.push({
              ruleId: rule.id, ruleName: rule.name,
              alertLevel: extra >= 25 ? 'critical' : 'high',
              reason: 'Transacción internacional — riesgo remoto elevado.',
              score: extra,
            });
          }
          break;
        default:
          break;
      }
    }
    return results;
  }, [rulesState]);

  return (
    <RulesContext.Provider value={{ rules: rulesState, updateRule, toggleRule, evaluate, resetRules, setRules, addRule, deleteRule }}>
      {children}
    </RulesContext.Provider>
  );
}

export function useRules() {
  const ctx = useContext(RulesContext);
  if (!ctx) throw new Error('useRules must be used within RulesProvider');
  return ctx;
}
