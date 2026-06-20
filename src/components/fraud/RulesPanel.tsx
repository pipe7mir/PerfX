import { useState, useMemo } from 'react';
import { RotateCcw, Plus, Trash2, GitBranch, ArrowRight, X, AlertTriangle, ShieldAlert, Activity, Check } from 'lucide-react';
import { useRules } from '../../context/RulesContext';
import Card from '../ui/GlassCard';
import PerfxInput from '../ui/NeonInput';
import PerfxButton from '../ui/NeonButton';
import ToggleSwitch from '../ui/ToggleSwitch';
import { motion, AnimatePresence } from 'framer-motion';

const ruleLabels: Record<string, { label: string }> = {
  'amount-deviation': { label: 'Multiplicador umbral (x)' },
  'unknown-merchant': { label: 'Monto mínimo ($)' },
  'high-frequency': { label: 'Límite de TRX' },
  'risk-channel': { label: 'Multiplicador riesgo (x)' },
};

// TIPOS DEL AST
interface VisualRule {
  id: string;
  field: string;
  operator: string;
  value: string;
}

const FIELD_OPTIONS = [
  { value: 'amount', label: 'Monto Transacción' },
  { value: 'mcc', label: 'Código MCC' },
  { value: 'channel', label: 'Canal (POS/INT)' },
  { value: 'hour', label: 'Hora de Operación' },
  { value: 'prior_contact', label: 'Contacto Previo' },
];

const getOperatorsForField = (field: string) => {
  switch (field) {
    case 'amount': return ['>', '<', '>=', '<=', '=='];
    case 'mcc': return ['==', 'INCLUYE', 'EXCLUYE'];
    case 'channel': return ['==', '!='];
    case 'hour': return ['BETWEEN', '<', '>'];
    case 'prior_contact': return ['==', '!='];
    default: return ['==', '!=', '>', '<'];
  }
};

// COMPONENTE: VISUAL RULE BUILDER
function VisualRuleBuilder({ onCancel, onSave }: { onCancel: () => void, onSave: (ruleAST: any) => void }) {
  const [ruleName, setRuleName] = useState('');
  const [scoreWeight, setScoreWeight] = useState(50);
  const [logicalOp, setLogicalOp] = useState<'AND' | 'OR'>('AND');
  const [conditions, setConditions] = useState<VisualRule[]>([]);

  const addCondition = () => {
    setConditions([...conditions, { id: Math.random().toString(), field: 'amount', operator: '>', value: '' }]);
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  const updateCondition = (id: string, key: keyof VisualRule, value: string) => {
    setConditions(conditions.map(c => {
      if (c.id === id) {
        const updated = { ...c, [key]: value };
        // Reset operator if field changes
        if (key === 'field') updated.operator = getOperatorsForField(value)[0];
        return updated;
      }
      return c;
    }));
  };

  const generateAST = () => ({
    rule_name: ruleName.toUpperCase().replace(/\s+/g, '_'),
    active: true,
    score_weight: scoreWeight,
    conditions: {
      logical_operator: logicalOp,
      rules: conditions.map(({ field, operator, value }) => {
        let parsedValue: any = value;
        if (operator === 'BETWEEN' && value.includes(',')) parsedValue = value.split(',').map(v => v.trim());
        else if (!isNaN(Number(value)) && value.trim() !== '') parsedValue = Number(value);
        return { field, operator, value: parsedValue };
      })
    }
  });

  const isValid = ruleName.trim() !== '' && conditions.length > 0 && conditions.every(c => c.value !== '');

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-50/50 backdrop-blur-xl border border-blue-200/50 p-6 rounded-3xl shadow-xl shadow-blue-900/5 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-blue-500" /> Constructor Visual de Reglas
        </h3>
        <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-4 h-4 text-slate-500" /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nombre de la Regla</label>
          <input 
            type="text" 
            placeholder="Ej: ALTO_MONTO_MADRUGADA"
            value={ruleName}
            onChange={e => setRuleName(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Impacto en Score ({scoreWeight})</label>
          <div className="flex items-center gap-4 h-[42px] bg-white border border-slate-200 rounded-xl px-4">
            <input 
              type="range" min="1" max="100" 
              value={scoreWeight} 
              onChange={e => setScoreWeight(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className={`text-xs font-black px-2 py-1 rounded-md ${scoreWeight >= 50 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
              {scoreWeight}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600 uppercase">Operador Lógico Base:</span>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button onClick={() => setLogicalOp('AND')} className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${logicalOp === 'AND' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Y (AND)</button>
              <button onClick={() => setLogicalOp('OR')} className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${logicalOp === 'OR' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>O (OR)</button>
            </div>
          </div>
          <button onClick={addCondition} className="flex items-center gap-1.5 text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Condición
          </button>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {conditions.length === 0 && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-slate-400 font-medium text-center py-6 border-2 border-dashed border-slate-100 rounded-xl">
                Añade condiciones para evaluar esta regla
              </motion.p>
            )}
            {conditions.map((c, idx) => (
              <motion.div 
                key={c.id} 
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-wrap md:flex-nowrap items-center gap-2 bg-slate-50 border border-slate-100 p-2 rounded-xl group relative"
              >
                {idx > 0 && (
                  <div className="absolute -left-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 hidden md:block">
                    {logicalOp}
                  </div>
                )}
                <select value={c.field} onChange={e => updateCondition(c.id, 'field', e.target.value)} className="bg-white border border-slate-200 text-sm font-semibold text-slate-700 py-2 px-3 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:outline-none flex-1 md:flex-none md:w-48">
                  {FIELD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                
                <select value={c.operator} onChange={e => updateCondition(c.id, 'operator', e.target.value)} className="bg-blue-50 border border-blue-100 text-sm font-bold text-blue-700 py-2 px-3 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:outline-none shrink-0 w-28 text-center">
                  {getOperatorsForField(c.field).map(op => <option key={op} value={op}>{op}</option>)}
                </select>
                
                <input 
                  type="text" 
                  placeholder="Valor a evaluar..."
                  value={c.value}
                  onChange={e => updateCondition(c.id, 'value', e.target.value)}
                  className="bg-white border border-slate-200 text-sm font-semibold text-slate-700 py-2 px-3 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:outline-none flex-1 min-w-[150px]"
                />
                
                <button onClick={() => removeCondition(c.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-6 bg-slate-900 rounded-2xl p-4 overflow-x-auto shadow-inner relative group">
        <span className="absolute top-3 right-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Previsualización AST</span>
        <pre className="text-xs text-blue-300 font-mono">
          {JSON.stringify(generateAST(), null, 2)}
        </pre>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <PerfxButton variant="primary" size="lg" onClick={() => isValid && onSave(generateAST())} disabled={!isValid}>
          <Check className="w-4 h-4 mr-2" /> Guardar JSON en Contexto
        </PerfxButton>
      </div>
    </motion.div>
  );
}


// COMPONENTE PRINCIPAL
export default function RulesPanel() {
  const { rules, updateRule, toggleRule, resetRules, addRule, deleteRule } = useRules();
  const [showBuilder, setShowBuilder] = useState(false);

  // Hook estético: Generar una semilla aleatoria persistente por regla para el mockup de métricas
  const ruleMetrics = useMemo(() => {
    const metrics: Record<string, number> = {};
    rules.forEach(r => metrics[r.id] = Math.floor(Math.random() * 25));
    return metrics;
  }, [rules.length]);

  const handleSaveRuleAST = async (ast: any) => {
    await addRule({
      id: `custom-${Date.now()}`,
      name: ast.rule_name,
      description: 'Regla visual dinámica generada vía AST',
      condition: JSON.stringify(ast, null, 2), // Pasamos el AST stringificado al Contexto existente
      threshold: 0,
      weight: ast.score_weight,
      enabled: ast.active,
    });
    setShowBuilder(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <p className="text-sm text-slate-500 font-medium max-w-lg">
          Gestiona los pesos de inferencia y construye reglas condicionales complejas con el nuevo constructor AST.
        </p>
        <div className="flex gap-2">
          <button onClick={() => setShowBuilder(!showBuilder)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-sm shadow-blue-600/20">
            <Plus className="w-4 h-4" />
            Nueva Regla
          </button>
          <button onClick={resetRules} className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-sm">
            <RotateCcw className="w-4 h-4" />
            Restaurar
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showBuilder && (
          <VisualRuleBuilder onCancel={() => setShowBuilder(false)} onSave={handleSaveRuleAST} />
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {rules.map(rule => {
          const config = ruleLabels[rule.id] ?? { label: 'Umbral' };
          const activations = ruleMetrics[rule.id] || 0;
          const isHighRisk = rule.weight >= 50;

          return (
            <Card key={rule.id} hover className="border border-slate-100 shadow-sm rounded-3xl overflow-hidden relative group">
              {/* Badge Visual en Esquina */}
              <div className="absolute top-4 right-4 flex items-center gap-3">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  isHighRisk ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {isHighRisk ? <ShieldAlert className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                  {isHighRisk ? 'Riesgo Alto' : 'Riesgo Moderado'}
                </div>
              </div>

              <div className="space-y-5 p-2">
                <div className="flex justify-between items-start max-w-[80%]">
                  <div>
                    <ToggleSwitch
                      label={rule.name}
                      description={rule.description}
                      checked={rule.enabled}
                      onChange={() => toggleRule(rule.id)}
                    />
                    <div className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-lg w-fit">
                      <span className="text-lg">🔥</span>
                      <span className="text-[11px] font-bold text-orange-800">Activada {activations} veces hoy</span>
                    </div>
                  </div>
                </div>

                {rule.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                    
                    {rule.condition ? (
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">JSON AST Condición</label>
                        <div className="relative">
                          <textarea
                            className="w-full h-32 bg-slate-900 text-blue-300 font-mono text-xs p-4 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                            value={rule.condition || ''}
                            onChange={e => updateRule(rule.id, { condition: e.target.value })}
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{config.label}</label>
                        <input
                          type="number" min="0" step="0.1"
                          value={String(rule.threshold)}
                          onChange={e => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val >= 0) updateRule(rule.id, { threshold: val });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                      </div>
                    )}
                    
                    <div className={rule.condition ? 'md:col-span-2' : ''}>
                      <div className="flex justify-between items-end mb-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Peso (Score Impact)</label>
                        <span className={`text-xs font-black px-2 py-0.5 rounded-md ${isHighRisk ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                          {rule.weight}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 h-[42px] bg-white border border-slate-200 rounded-xl px-4">
                        <input 
                          type="range" min="0" max="100" 
                          value={rule.weight} 
                          onChange={e => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val >= 0) updateRule(rule.id, { weight: val });
                          }}
                          className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer transition-colors ${
                            isHighRisk ? 'bg-red-200 accent-red-600' : 'bg-slate-200 accent-blue-500'
                          }`}
                        />
                      </div>
                    </div>

                  </div>
                )}
                
                {rule.id.startsWith('custom-') && (
                  <div className="flex justify-end pt-2 border-t border-slate-100 mt-4">
                    <button onClick={() => deleteRule(rule.id)} className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Eliminar Regla
                    </button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
