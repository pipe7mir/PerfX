import ToggleSwitch from '../ui/ToggleSwitch';
import PerfxInput from '../ui/NeonInput';
import type { TransactionType } from '../../types';

interface HistoricalProfileProps {
  transactionType: TransactionType;
  onTransactionTypeChange: (type: TransactionType) => void;
  hasPriorContact: boolean;
  onPriorContactChange: (value: boolean) => void;
  priorContactCount: string;
  onPriorContactCountChange: (value: string) => void;
  priorContactMaxValue: string;
  onPriorContactMaxValueChange: (value: string) => void;
}

export default function HistoricalProfile({
  transactionType, onTransactionTypeChange,
  hasPriorContact, onPriorContactChange,
  priorContactCount, onPriorContactCountChange,
  priorContactMaxValue, onPriorContactMaxValueChange,
}: HistoricalProfileProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-navy-700 tracking-wide">Tipo de Transacción</span>
        <div className="flex bg-slate-100/80 border border-slate-200/80 backdrop-blur-md rounded-2xl p-1 shadow-inner">
          {(['POS', 'INT'] as const).map(t => (
            <button
              key={t}
              onClick={() => onTransactionTypeChange(t)}
              className={`px-5 py-1.5 rounded-xl text-xs font-bold tracking-wider transition-all duration-300 ${
                transactionType === t
                  ? 'bg-white text-blue-600 shadow-[0_2px_8px_rgba(0,0,0,0.08)] scale-[1.02]'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <ToggleSwitch
        label="¿Tiene contacto previo con el comercio (MCC)?"
        checked={hasPriorContact}
        onChange={onPriorContactChange}
      />

      {hasPriorContact && (
        <div className="grid grid-cols-2 gap-4 pl-7 border-l-2 border-navy-200">
          <PerfxInput
            label="Cantidad de veces"
            type="number" placeholder="Ej: 5" min="0"
            value={priorContactCount}
            onChange={e => onPriorContactCountChange(e.target.value)}
          />
          <PerfxInput
            label="Valor máximo histórico (COP)"
            type="number" placeholder="Ej: 1000000" min="0" step="1000"
            value={priorContactMaxValue}
            onChange={e => onPriorContactMaxValueChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
