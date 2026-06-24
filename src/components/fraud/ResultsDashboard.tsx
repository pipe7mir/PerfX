import { AlertTriangle, CheckCircle, Info, Database } from 'lucide-react';
import type { EvaluationResult } from '../../types';
import Card from '../ui/GlassCard';
import Badge from '../ui/Badge';
import GaugeChart from './GaugeChart';
import RadarComparisonChart from './RadarComparisonChart';

interface ResultsDashboardProps {
  result: EvaluationResult;
}

const verdictConfig = {
  CONTACTAR_CLIENTE: {
    label: 'CONTACTAR CLIENTE',
    icon: AlertTriangle,
    variant: 'critical' as const,
    bg: 'bg-coral-100 border-coral-200',
    text: 'text-coral-500',
  },
  DESCARTAR: {
    label: 'DESCARTAR / REVISAR',
    icon: Info,
    variant: 'high' as const,
    bg: 'bg-amber-100 border-amber-200',
    text: 'text-amber-600',
  },
  APROBAR_TRX: {
    label: 'APROBAR TRANSACCIÓN',
    icon: CheckCircle,
    variant: 'low' as const,
    bg: 'bg-emerald-100 border-emerald-200',
    text: 'text-emerald-600',
  },
};

const alertBadgeMap = { critical: 'critical' as const, high: 'high' as const, medium: 'medium' as const, low: 'low' as const };

const getHumanExplanation = (result: EvaluationResult) => {
  if (result.triggeredRules.length === 0) {
    return "La transacción se alinea con los patrones habituales del cliente y no presenta desviaciones de seguridad. Se procede con su aprobación automática sin requerir acciones adicionales.";
  }

  const riskScore = Math.round(result.riskScore);
  const reasonsList = result.triggeredRules.map(r => `• ${r.reason}`).join('\n');

  if (result.verdict === 'CONTACTAR_CLIENTE') {
    return `Se recomienda contactar al cliente de manera preventiva para validar la legitimidad de esta operación. El sistema detectó un nivel de riesgo elevado de ${riskScore}/100 puntos, impulsado principalmente por los siguientes factores:\n${reasonsList}\nSugerimos retener la transacción hasta que se reciba confirmación directa del usuario.`;
  }
  
  if (result.verdict === 'DESCARTAR') {
    return `Sugerimos descartar preventivamente o someter a revisión manual minuciosa esta transacción. Presenta un nivel de riesgo considerable (${riskScore}/100 puntos), evidenciado por indicadores anómalos como:\n${reasonsList}`;
  }

  return `La transacción ha sido aprobada con un riesgo de ${riskScore}/100 puntos. Aunque el motor detectó algunas alertas menores descritas a continuación, el comportamiento global se mantiene dentro de los límites de tolerancia históricos:\n${reasonsList}`;
};

export default function ResultsDashboard({ result }: ResultsDashboardProps) {
  const verdict = verdictConfig[result.verdict];
  const VerdictIcon = verdict.icon;

  return (
    <div className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-5">
          <div className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-md border shadow-sm ${verdict.bg}`}>
            <VerdictIcon className={`w-5 h-5 ${verdict.text}`} />
            <div>
              <span className={`text-sm font-bold tracking-wider ${verdict.text}`}>{verdict.label}</span>
              <p className={`text-[9px] mt-0.5 opacity-70 ${verdict.text}`}>Veredicto Técnico</p>
            </div>
          </div>
          <div className="shrink-0 flex items-center justify-center">
            <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-lg border-2 bg-white/50 backdrop-blur-xl
              ${result.riskScore > 70 ? 'border-red-400 text-red-600' : result.riskScore > 30 ? 'border-amber-400 text-amber-600' : 'border-emerald-400 text-emerald-600'}`}>
              <span className="text-xl font-mono font-bold leading-none">{Math.round(result.riskScore)}</span>
            </div>
          </div>
        </div>

        {/* Textual Explanation Block */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-navy-800/80 border border-slate-100 dark:border-white/10 shadow-inner">
          <p className="text-sm text-slate-700 dark:text-white leading-relaxed font-medium whitespace-pre-wrap">
            <strong className="text-slate-900 dark:text-white block mb-1">Análisis Humano:</strong>
            {getHumanExplanation(result)}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
          <GaugeChart score={result.riskScore} />
          <RadarComparisonChart
            historicalMax={result.historicalMax}
            historicalAvg={result.historicalAvg}
            currentValue={result.currentValue}
            currentFrequency={result.currentFrequency}
            historicalFrequency={result.historicalFrequency}
          />
        </div>
      </Card>

      {result.merchantMemory && (
        <Card flat>
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-navy-400" />
            <span className="text-xs font-semibold text-navy-500 tracking-wider uppercase">Memoria de Comercio</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Transacciones', value: result.merchantMemory.totalTransactions },
              { label: 'Promedio', value: result.merchantMemory.averageAmount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }) },
              { label: 'Máximo', value: result.merchantMemory.maxAmount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }) },
              { label: 'Frecuencia prom.', value: `${result.merchantMemory.frequencyAvg.toFixed(1)}/día` },
            ].map(stat => (
              <div key={stat.label} className="p-3 rounded-2xl bg-white dark:bg-navy-800/40 border border-white/60 backdrop-blur-md shadow-inner">
                <p className="text-[10px] text-navy-500 font-medium uppercase tracking-wider">{stat.label}</p>
                <p className="text-sm font-bold text-navy-800 dark:text-white mt-0.5">{stat.value}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {result.triggeredRules.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-navy-700 dark:text-white mb-4">Reglas Disparadas</h3>
          <div className="space-y-2.5">
            {result.triggeredRules.map(rule => (
              <div key={rule.ruleId} className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-navy-800/50 border border-white/60 backdrop-blur-sm shadow-soft-sm hover:scale-[1.01] transition-all duration-300">
                <Badge variant={alertBadgeMap[rule.alertLevel]}>{rule.alertLevel.toUpperCase()}</Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-navy-800 dark:text-white">{rule.ruleName}</p>
                  <p className="text-xs text-navy-500 mt-0.5 leading-relaxed">{rule.reason}</p>
                </div>
                <span className="text-xs font-mono font-bold text-navy-400 bg-white dark:bg-navy-800/80 px-2 py-0.5 rounded-md border border-white">+{rule.score}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {result.triggeredRules.length === 0 && (
        <Card flat>
          <div className="flex items-center gap-3 text-emerald-600">
            <CheckCircle className="w-5 h-5" />
            <p className="text-sm font-medium">No se dispararon reglas. Transacción sin riesgo aparente.</p>
          </div>
        </Card>
      )}
    </div>
  );
}
