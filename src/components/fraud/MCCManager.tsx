import { useState } from 'react';
import { Plus, Trash2, Search } from 'lucide-react';
import { useMCC } from '../../context/MCCContext';
import PerfxInput from '../ui/NeonInput';
import PerfxButton from '../ui/NeonButton';
import Modal from '../ui/Modal';

export default function MCCManager() {
  const { mccs, addMCC, removeMCC, searchMCC } = useMCC();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newRisk, setNewRisk] = useState<number>(10);

  const filtered = searchQuery ? searchMCC(searchQuery) : mccs;

  const handleAdd = () => {
    if (!newCode.trim() || !newDescription.trim()) return;
    addMCC(newCode.trim(), newDescription.trim(), newRisk);
    setNewCode('');
    setNewDescription('');
    setNewRisk(10);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Search bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-300" />
          <input
            type="text"
            placeholder="Buscar MCC por código o concepto..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-perfx pl-10"
          />
        </div>
        <PerfxButton onClick={() => setShowAddModal(true)} variant="primary" className="shrink-0">
          <Plus className="w-4 h-4" />
          Nuevo MCC
        </PerfxButton>
      </div>

      {/* MCC List */}
      <div className="grid gap-2">
        {filtered.map(mcc => (
          <div
            key={mcc.code}
            className="flex items-center gap-4 p-3.5 rounded-2xl bg-white dark:bg-navy-800/40 border border-white/60 shadow-soft-sm hover:shadow-soft-md hover:bg-white dark:hover:bg-navy-700 dark:bg-navy-800/60 hover:scale-[1.01] transition-all duration-300 backdrop-blur-md"
          >
            <span className="font-mono text-sm font-semibold text-navy-500 w-16">{mcc.code}</span>
            <span className="flex-1 text-sm text-navy-700 dark:text-white">{mcc.description}</span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold border border-navy-200 dark:border-white/10">
              {mcc.base_risk_score}
            </span>
            <button
              onClick={() => removeMCC(mcc.code)}
              className="p-1.5 rounded-lg text-navy-300 hover:text-coral-500 hover:bg-coral-50 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-navy-400 text-center py-10">No se encontraron MCCs</p>
        )}
      </div>

      {/* Centered Add Modal — fixes scroll/focus issue */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Nuevo MCC">
        <div className="space-y-4">
          <PerfxInput
            label="Código MCC"
            placeholder="Ej: 1234"
            value={newCode}
            onChange={e => setNewCode(e.target.value)}
          />
          <PerfxInput
            label="Concepto / Categoría"
            placeholder="Ej: Servicio XYZ"
            value={newDescription}
            onChange={e => setNewDescription(e.target.value)}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-navy-600 tracking-wide">Nivel de Riesgo (0-100)</label>
            <input 
              type="range" 
              min="0" max="100" 
              value={newRisk} 
              onChange={e => setNewRisk(Number(e.target.value))} 
              className="w-full" 
            />
            <div className="text-right text-xs font-bold text-navy-500">{newRisk}</div>
          </div>
          <PerfxButton onClick={handleAdd} fullWidth>Guardar MCC</PerfxButton>
        </div>
      </Modal>
    </div>
  );
}
