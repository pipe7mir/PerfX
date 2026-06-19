import { useState, useCallback } from 'react';
import { api } from '../services/api';
import type { MerchantMemory, MerchantMemoryRecord, TransactionType } from '../types';

function weightedAverage(values: number[], weights: number[]): number {
  const totalWeight = weights.reduce((s, w) => s + w, 0);
  if (totalWeight === 0) return 0;
  return values.reduce((sum, v, i) => sum + v * weights[i], 0) / totalWeight;
}

function recencyWeights(count: number): number[] {
  return Array.from({ length: count }, (_, i) => Math.max(1, count - i));
}

export function useMerchantMemory() {
  const [loading, setLoading] = useState(false);

  const computeMemory = useCallback(async (mccCode: string): Promise<MerchantMemory | null> => {
    setLoading(true);
    try {
      const remote = await api.memory.get(mccCode);
      if (remote && remote.averageAmount > 0) {
        setLoading(false);
        return {
          mccCode,
          averageAmount: remote.averageAmount,
          maxAmount: remote.averageAmount,
          totalTransactions: remote.cumulativeFrequency,
          frequencyAvg: 0,
          lastTransactionDate: '',
          riskScore: 0,
        };
      }
    } catch { /* fall through to localStorage */ }

    try {
      const stored = localStorage.getItem(`perfx_memory_${mccCode}`);
      if (!stored) {
        setLoading(false);
        return null;
      }
      const records: MerchantMemoryRecord[] = JSON.parse(stored);
      if (records.length === 0) {
        setLoading(false);
        return null;
      }

      const amounts = records.map(r => r.transaction_amount);
      const weights = recencyWeights(amounts.length);
      const avg = weightedAverage(amounts, weights);
      const maxAmt = Math.max(...amounts);

      const freqsMap = new Map<string, number>();
      records.forEach(r => {
        const day = r.created_at.slice(0, 10);
        freqsMap.set(day, (freqsMap.get(day) ?? 0) + 1);
      });
      const freqAvg = Array.from(freqsMap.values()).reduce((a, b) => a + b, 0) / Math.max(freqsMap.size, 1);

      const riskScores = records.map(r => r.risk_score);
      const avgRisk = weightedAverage(riskScores, weights);

      setLoading(false);
      return {
        mccCode,
        averageAmount: Math.round(avg * 100) / 100,
        maxAmount: maxAmt,
        totalTransactions: records.length,
        frequencyAvg: Math.round(freqAvg * 10) / 10,
        lastTransactionDate: records[records.length - 1]?.created_at ?? '',
        riskScore: Math.round(avgRisk),
      };
    } catch {
      setLoading(false);
      return null;
    }
  }, []);

  const storeRecord = useCallback(async (
    mccCode: string,
    amount: number,
    type: TransactionType,
    riskScore: number
  ): Promise<void> => {
    const record: MerchantMemoryRecord = {
      mcc_code: mccCode,
      transaction_amount: amount,
      transaction_type: type,
      risk_score: riskScore,
      created_at: new Date().toISOString(),
    };

    const key = `perfx_memory_${mccCode}`;
    const existing = localStorage.getItem(key);
    const records: MerchantMemoryRecord[] = existing ? JSON.parse(existing) : [];
    records.push(record);
    if (records.length > 500) records.splice(0, records.length - 500);
    localStorage.setItem(key, JSON.stringify(records));

    api.memory.store(mccCode, amount, riskScore).catch(() => {});
  }, []);

  return { computeMemory, storeRecord, loading };
}
