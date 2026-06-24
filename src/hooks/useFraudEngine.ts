import { useCallback } from 'react';
import type { EvaluationInput, RuleResult, MCC, EvaluationResult } from '../types';
import { useRules } from '../context/RulesContext';
import { useMerchantMemory } from './useMerchantMemory';

export function useFraudEngine() {
  const { evaluate } = useRules();
  const { computeMemory, storeRecord, loading: memoryLoading } = useMerchantMemory();

  const runEvaluation = useCallback(async (
    input: EvaluationInput,
    mcc: MCC
  ): Promise<EvaluationResult> => {
    const triggeredRules: RuleResult[] = evaluate(input, mcc);
    const riskScore = 0; // Se calculará después

    const histAvg = input.hasPriorContact && input.priorContactCount > 0
      ? input.priorContactMaxValue / input.priorContactCount
      : input.priorContactMaxValue;

    await storeRecord(mcc.code, input.currentTrxValues[0], input.transactionType, riskScore);
    const memory = await computeMemory(mcc.code);

    const merchantMemory = memory && memory.totalTransactions > 1 ? memory : undefined;

    if (merchantMemory) {
      const deviation = input.currentTrxValues[0] / (merchantMemory.averageAmount || 1);
      if (deviation > 2.5 || deviation < 0.3) {
        triggeredRules.push({
          ruleId: 'merchant-deviation',
          ruleName: 'Desviación Predictiva (Memoria)',
          alertLevel: 'medium',
          reason: `La TRX actual ($${input.currentTrxValues[0].toLocaleString()}) se desvía significativamente del comportamiento histórico del comercio (promedio: $${merchantMemory.averageAmount.toLocaleString()})`,
          score: 15,
        });
      }
    }

    const finalRisk = triggeredRules.reduce((sum, r) => sum + r.score, 0);
    let finalScore = Math.min(100, finalRisk);

    // LÓGICA DE REGLA COMPUESTA SOLICITADA POR EL USUARIO
    const isAmountRuleTriggered = triggeredRules.some(r => r.ruleName.toLowerCase().includes('monto') || r.ruleName.toLowerCase().includes('límite') || r.ruleName.toLowerCase().includes('desviación') || r.ruleName.toLowerCase().includes('histórico'));
    const isHighAmount = input.currentTrxValues[0] >= 500; // Asumimos un umbral alto
    const hasManyTrx = input.trxCountLast24h >= 3;
    const isFirstTimeInMerchant = !merchantMemory || merchantMemory.totalTransactions <= 1;
    const isUnknownMcc = mcc.description.toLowerCase().includes('nuevo') || mcc.description.toLowerCase().includes('desconocid') || mcc.code === '0000';

    let forceContactClient = false;
    if (triggeredRules.length > 1 && (isAmountRuleTriggered || isHighAmount) && hasManyTrx && isFirstTimeInMerchant && isUnknownMcc) {
      forceContactClient = true;
    }

    if (forceContactClient) {
      triggeredRules.push({
        ruleId: 'super-regla-contacto',
        ruleName: 'Múltiples Riesgos (Monto, TRX, MCC Desconocido)',
        alertLevel: 'critical',
        reason: 'RECOMENDACIÓN DEL SISTEMA: Contactar al cliente de inmediato para preguntar de qué comercio se trata y confirmar la legitimidad de las múltiples transacciones.',
        score: 50,
      });
      // Recalcular el score para que empuje al rango crítico
      finalScore = Math.max(finalScore, 85); 
    }

    let finalVerdict: EvaluationResult['verdict'] = 'APROBAR_TRX';
    if (finalScore >= 70 || forceContactClient) finalVerdict = 'CONTACTAR_CLIENTE';
    else if (finalScore >= 40) finalVerdict = 'DESCARTAR';

    return {
      verdict: finalVerdict,
      riskScore: finalScore,
      triggeredRules,
      historicalAvg: histAvg,
      historicalMax: input.priorContactMaxValue,
      currentValue: input.currentTrxValues[0],
      currentFrequency: input.trxCountLast24h,
      historicalFrequency: input.hasPriorContact ? input.priorContactCount : 0,
      merchantMemory: merchantMemory ?? undefined,
    };
  }, [evaluate, computeMemory, storeRecord]);

  return { runEvaluation, memoryLoading };
}
