import { useState } from 'react';
import { RotateCcw, Plus, Trash2 } from 'lucide-react';
import { useRules } from '../../context/RulesContext';
import Card from '../ui/GlassCard';
import PerfxInput from '../ui/NeonInput';
import PerfxButton from '../ui/NeonButton';
import ToggleSwitch from '../ui/ToggleSwitch';

const ruleLabels: Record<string, { label: string }> = {
  'amount-deviation': { label: 'Multiplicador umbral (x)' },
  'unknown-merchant': { label: 'Monto mínimo ($)' },
  'high-frequency': { label: 'Límite de TRX' },
  'risk-channel': { label: 'Multiplicador riesgo (x)' },
};

export default function RulesPanel() {
  const { rules, updateRule, toggleRule, resetRules, addRule, deleteRule } = useRules();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRule, setNewRule] = useState({ name: '', description: '', condition: '', threshold: 0, weight: 10 });

  const handleAddRule = async () => {
    if (!newRule.name || !newRule.condition) return;
    await addRule({
      id: `custom-${Date.now()}`,
      name: newRule.name,
      description: newRule.description,
      condition: newRule.condition,
      threshold: newRule.threshold,
      weight: newRule.weight,
      enabled: true,
    });
    setNewRule({ name: '', description: '', condition: '', threshold: 0, weight: 10 });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-navy-400">Activa o desactiva reglas y ajusta sus umbrales</p>
        <div className="flex gap-2">
          <PerfxButton onClick={() => setShowAddForm(!showAddForm)} variant="ghost" size="sm">
            <Plus className="w-3.5 h-3.5" />
            Nueva Regla
          </PerfxButton>
          <PerfxButton onClick={resetRules} variant="ghost" size="sm">
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar
          </PerfxButton>
        </div>
      </div>

      {showAddForm && (
        <Card className="border-blue-500/30">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-navy-800">Crear Regla Dinámica</h4>
            <div className="grid grid-cols-2 gap-4">
              <PerfxInput label="Nombre de la Regla" value={newRule.name} onChange={e => setNewRule({ ...newRule, name: e.target.value })} />
              <PerfxInput label="Descripción" value={newRule.description} onChange={e => setNewRule({ ...newRule, description: e.target.value })} />
              <div className="col-span-2">
                <PerfxInput label="Condición (ej: input.currentTrxValue > 1000)" value={newRule.condition} onChange={e => setNewRule({ ...newRule, condition: e.target.value })} />
                <p className="text-[10px] text-slate-500 mt-1 pl-1">Variables disponibles: input.currentTrxValue, input.mccCode, input.trxCountLast24h, input.transactionType</p>
              </div>
              <PerfxInput label="Umbral (Opcional)" type="number" min="0" value={String(newRule.threshold)} onChange={e => setNewRule({ ...newRule, threshold: parseFloat(e.target.value) || 0 })} />
              <PerfxInput label="Peso (Score 0-100)" type="number" min="0" max="100" value={String(newRule.weight)} onChange={e => setNewRule({ ...newRule, weight: parseFloat(e.target.value) || 10 })} />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <PerfxButton variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>Cancelar</PerfxButton>
              <PerfxButton variant="primary" size="sm" onClick={handleAddRule}>Guardar Regla</PerfxButton>
            </div>
          </div>
        </Card>
      )}

      {rules.map(rule => {
        const config = ruleLabels[rule.id] ?? { label: 'Umbral' };
        return (
          <Card key={rule.id} hover>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <ToggleSwitch
                  label={rule.name}
                  description={rule.description}
                  checked={rule.enabled}
                  onChange={() => toggleRule(rule.id)}
                />
                {rule.id.startsWith('custom-') && (
                  <button onClick={() => deleteRule(rule.id)} className="text-coral-500 hover:text-coral-600 transition-colors p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {rule.enabled && (
                <div className="grid grid-cols-2 gap-4 pl-10">
                  {rule.condition ? (
                    <div className="col-span-2">
                      <PerfxInput
                        label="Condición Lógica"
                        value={rule.condition || ''}
                        onChange={e => updateRule(rule.id, { condition: e.target.value })}
                      />
                    </div>
                  ) : (
                    <PerfxInput
                      label={config.label}
                      type="number" min="0" step="0.1"
                      value={String(rule.threshold)}
                      onChange={e => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val >= 0) updateRule(rule.id, { threshold: val });
                      }}
                    />
                  )}
                  <PerfxInput
                    label="Peso (score)"
                    type="number" min="0" max="100"
                    value={String(rule.weight)}
                    onChange={e => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val >= 0) updateRule(rule.id, { weight: val });
                    }}
                  />
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
