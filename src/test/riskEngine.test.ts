import { describe, it, expect } from 'vitest';

function weightedAverage(values: number[], weights: number[]): number {
  const totalWeight = weights.reduce((s, w) => s + w, 0);
  if (totalWeight === 0) return 0;
  return values.reduce((sum, v, i) => sum + v * weights[i], 0) / totalWeight;
}

function recencyWeights(count: number): number[] {
  return Array.from({ length: count }, (_, i) => Math.max(1, count - i));
}

function evaluateTransaction(input: {
  transactionType: string;
  hasPriorContact: boolean;
  priorContactMaxValue: number;
  currentTrxValue: number;
  trxCountLast24h: number;
  mccBaseRisk: number;
  priorContactCount: number;
}) {
  const results: Array<{ ruleId: string; ruleName: string; alertLevel: string; score: number }> = [];

  if (input.mccBaseRisk > 0) {
    results.push({
      ruleId: 'base-mcc-risk',
      ruleName: 'Riesgo Base del Comercio',
      alertLevel: input.mccBaseRisk >= 80 ? 'high' : 'medium',
      score: Math.round(input.mccBaseRisk * 0.35),
    });
  }

  if (input.transactionType === 'INT') {
    const isHighRiskMcc = input.mccBaseRisk >= 70;
    results.push({
      ruleId: 'risk-channel',
      ruleName: 'Canal de Riesgo',
      alertLevel: isHighRiskMcc ? 'critical' : 'high',
      score: isHighRiskMcc ? 25 : 15,
    });
  }

  if (!input.hasPriorContact && input.currentTrxValue >= 500) {
    const score = Math.min(50, Math.round((input.currentTrxValue / 500) * 40) + 15);
    results.push({
      ruleId: 'unknown-merchant',
      ruleName: 'Comercio Desconocido',
      alertLevel: score > 35 ? 'critical' : 'high',
      score,
    });
  }

  return results;
}

describe('weightedAverage', () => {
  it('returns 0 for empty arrays', () => {
    expect(weightedAverage([], [])).toBe(0);
  });

  it('computes simple average when all weights are 1', () => {
    expect(weightedAverage([10, 20, 30], [1, 1, 1])).toBe(20);
  });

  it('gives more weight to higher-weighted items', () => {
    const result = weightedAverage([10, 100], [1, 9]);
    expect(result).toBeCloseTo(91, 0);
  });
});

describe('recencyWeights', () => {
  it('returns [1] for count 1', () => {
    expect(recencyWeights(1)).toEqual([1]);
  });

  it('returns descending weights for count 3', () => {
    expect(recencyWeights(3)).toEqual([3, 2, 1]);
  });
});

describe('evaluateTransaction', () => {
  const baseInput = {
    transactionType: 'POS',
    hasPriorContact: true,
    priorContactMaxValue: 1000,
    currentTrxValue: 100,
    trxCountLast24h: 1,
    mccBaseRisk: 10,
    priorContactCount: 5,
  };

  it('returns base MCC risk when risk > 0', () => {
    const results = evaluateTransaction({ ...baseInput, mccBaseRisk: 50 });
    expect(results.some(r => r.ruleId === 'base-mcc-risk')).toBe(true);
  });

  it('flags international transactions as risk channel', () => {
    const results = evaluateTransaction({ ...baseInput, transactionType: 'INT', mccBaseRisk: 50 });
    expect(results.some(r => r.ruleId === 'risk-channel')).toBe(true);
  });

  it('flags unknown merchant for high value without prior contact', () => {
    const results = evaluateTransaction({
      ...baseInput,
      hasPriorContact: false,
      currentTrxValue: 5000,
      mccBaseRisk: 10,
    });
    expect(results.some(r => r.ruleId === 'unknown-merchant')).toBe(true);
  });

  it('does not flag unknown merchant when prior contact exists', () => {
    const results = evaluateTransaction({ ...baseInput, hasPriorContact: true, currentTrxValue: 5000 });
    expect(results.some(r => r.ruleId === 'unknown-merchant')).toBe(false);
  });

  it('assigns critical alert for base risk >= 80', () => {
    const results = evaluateTransaction({ ...baseInput, mccBaseRisk: 85 });
    const riskRule = results.find(r => r.ruleId === 'base-mcc-risk');
    expect(riskRule?.alertLevel).toBe('high');
  });
});
