import PerfxInput from '../ui/NeonInput';
import MCCSearchInput from './MCCSearchInput';
import type { MCC } from '../../types';

interface CurrentTransactionProps {
  mccCode: string;
  onMCCChange: (mcc: MCC) => void;
  onUnknownMCC: (code: string) => void;
  currentTrxValue: string;
  onCurrentTrxValueChange: (value: string) => void;
  trxCountLast24h: string;
  onTrxCountLast24hChange: (value: string) => void;
}

export default function CurrentTransaction({
  mccCode, onMCCChange, onUnknownMCC,
  currentTrxValue, onCurrentTrxValueChange,
  trxCountLast24h, onTrxCountLast24hChange,
}: CurrentTransactionProps) {
  return (
    <div className="space-y-6">
      <MCCSearchInput value={mccCode} onChange={onMCCChange} onUnknownCode={onUnknownMCC} />
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Valor de la TRX actual (COP)</label>
        </div>
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          {[50000, 200000, 500000, 1000000].map(amount => (
            <button
              key={amount}
              onClick={() => onCurrentTrxValueChange(amount.toString())}
              className={`shrink-0 px-3 py-2 text-xs font-bold rounded-xl border transition-all duration-300 ${
                currentTrxValue === amount.toString()
                  ? 'bg-blue-600 border-blue-600 text-white shadow-[0_4px_15px_rgba(37,99,235,0.3)] scale-[1.02]'
                  : 'bg-white border-slate-300/80 text-slate-700 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:bg-slate-50 hover:border-blue-300'
              }`}
            >
              ${(amount).toLocaleString('es-CO')}
            </button>
          ))}
        </div>
        <PerfxInput
          label=""
          type="number" placeholder="Ej: 250000" min="0" step="1000"
          value={currentTrxValue}
          onChange={e => onCurrentTrxValueChange(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Cantidad de TRX en las últimas 24h</label>
        <div className="flex gap-2 mb-3">
          {['1', '3', '5', '10'].map(count => (
            <button
              key={count}
              onClick={() => onTrxCountLast24hChange(count)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all duration-300 ${
                trxCountLast24h === count
                  ? 'bg-slate-800 border-slate-800 text-white shadow-[0_4px_15px_rgba(0,0,0,0.2)] scale-[1.02]'
                  : 'bg-white border-slate-300/80 text-slate-700 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:bg-slate-50 hover:border-slate-400'
              }`}
            >
              {count}
            </button>
          ))}
        </div>
        <PerfxInput
          label=""
          type="number" placeholder="Ej: 5" min="0"
          value={trxCountLast24h}
          onChange={e => onTrxCountLast24hChange(e.target.value)}
        />
      </div>
    </div>
  );
}
