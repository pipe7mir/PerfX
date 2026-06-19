import { useState, useEffect } from 'react';
import Card from '../components/ui/GlassCard';
import Modal from '../components/ui/Modal';
import { api } from '../services/api';
import { FileText, AlertTriangle, CheckCircle, XCircle, Eye } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';

export default function AuditPage() {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState<any | null>(null);

  const loadEvaluations = async () => {
    try {
      const data = await api.evaluations.list();
      setEvaluations(data);
    } catch (error) {
      console.error('Error loading evaluations:', error);
    }
  };

  useEffect(() => {
    loadEvaluations();
  }, []);

  const getVerdictStyle = (verdict: string) => {
    switch (verdict) {
      case 'REJECTED': return 'semantic-pill-rejected';
      case 'FLAGGED': return 'semantic-pill-flagged';
      case 'APPROVED': return 'semantic-pill-approved';
      default: return 'bg-navy-100/50 text-navy-700 border border-navy-200/50 rounded-full px-3 py-1 font-semibold text-xs flex items-center gap-1.5 backdrop-blur-md shadow-sm';
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'REJECTED': return <XCircle className="w-4 h-4" />;
      case 'FLAGGED': return <AlertTriangle className="w-4 h-4" />;
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader 
        title="Auditoría Forense" 
        subtitle="Historial inmutable de estudios y decisiones de fraude."
        icon={FileText}
      />

      <Card className="mt-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2 min-w-[800px]">
            <thead>
              <tr>
                <th className="py-2 px-4 text-xs font-semibold text-navy-400 uppercase tracking-wider">Fecha</th>
                <th className="py-2 px-4 text-xs font-semibold text-navy-400 uppercase tracking-wider">ID Tx</th>
                <th className="py-2 px-4 text-xs font-semibold text-navy-400 uppercase tracking-wider">Monto</th>
                <th className="py-2 px-4 text-xs font-semibold text-navy-400 uppercase tracking-wider">Analista (Revisor)</th>
                <th className="py-2 px-4 text-xs font-semibold text-navy-400 uppercase tracking-wider text-center">Score Riesgo</th>
                <th className="py-2 px-4 text-xs font-semibold text-navy-400 uppercase tracking-wider">Veredicto Motor</th>
                <th className="py-2 px-4 text-xs font-semibold text-navy-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((ev) => (
                <tr key={ev.id} className="bg-white/50 hover:bg-white/70 transition-colors duration-200 group">
                  <td className="py-4 px-4 text-sm text-navy-500 rounded-l-2xl group-hover:text-navy-700">{new Date(ev.created_at).toLocaleString()}</td>
                  <td className="py-4 px-4 text-sm font-mono text-navy-900">{ev.transaction_id.slice(0, 8)}...</td>
                  <td className="py-4 px-4 text-sm font-semibold text-navy-900">
                    {ev.amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
                  </td>
                  <td className="py-4 px-4 text-sm text-navy-600">
                    {ev.usuarios?.email || ev.analyst_id || <span className="italic opacity-50">Automático</span>}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded-full text-xs font-mono font-bold shadow-sm backdrop-blur-md border border-white/60 ${ev.calculated_risk_score > 70 ? 'bg-red-100/80 text-red-600' : ev.calculated_risk_score > 30 ? 'bg-orange-100/80 text-orange-600' : 'bg-emerald-100/80 text-emerald-600'}`}>
                      {ev.calculated_risk_score}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className={`w-fit ${getVerdictStyle(ev.verdict)}`}>
                      {getVerdictIcon(ev.verdict)}
                      {ev.verdict}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => setSelectedEvaluation(ev)}
                      className="p-2 text-navy-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver Detalles"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {evaluations.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-navy-400 text-sm">No hay evaluaciones registradas en el motor todavía.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={!!selectedEvaluation} onClose={() => setSelectedEvaluation(null)} title="Detalles de Evaluación Forense">
        {selectedEvaluation && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Monto de TRX</p>
                <p className="text-sm font-semibold text-slate-800">{selectedEvaluation.amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Score Total</p>
                <p className="text-sm font-semibold text-slate-800">{selectedEvaluation.calculated_risk_score} Puntos</p>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Veredicto</p>
              <div className={`w-fit ${getVerdictStyle(selectedEvaluation.verdict)}`}>
                {getVerdictIcon(selectedEvaluation.verdict)}
                {selectedEvaluation.verdict}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Reglas Aplicadas / Análisis</p>
              <div className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                {selectedEvaluation.applied_rules 
                  ? (Array.isArray(selectedEvaluation.applied_rules) ? selectedEvaluation.applied_rules.map((r: any, i: number) => (
                      <div key={i} className="mb-2 last:mb-0">
                        <span className="font-semibold">{r.ruleName || 'Regla'}:</span> {r.reason || JSON.stringify(r)} <span className="text-blue-600 font-mono text-xs">(+{r.score})</span>
                      </div>
                    )) : (typeof selectedEvaluation.applied_rules === 'string' ? selectedEvaluation.applied_rules : JSON.stringify(selectedEvaluation.applied_rules, null, 2)))
                  : 'Ninguna regla registrada.'}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
