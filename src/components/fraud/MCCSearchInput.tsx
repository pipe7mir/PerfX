import { useState, useRef, useEffect } from 'react';
import { Search, Check, AlertCircle } from 'lucide-react';
import { useMCC } from '../../context/MCCContext';
import type { MCC } from '../../types';
import { useMerchantMemory } from '../../hooks/useMerchantMemory';

interface MCCSearchInputProps {
  value: string;
  onChange: (mcc: MCC) => void;
  onUnknownCode: (code: string) => void;
}

export default function MCCSearchInput({ value, onChange, onUnknownCode }: MCCSearchInputProps) {
  const { searchMCC, findMCC } = useMCC();
  const { computeMemory } = useMerchantMemory();
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<MCC[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<MCC | null>(null);
  const [predictiveAlert, setPredictiveAlert] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleQueryChange = (q: string) => {
    setQuery(q);
    setSelected(null);
    setPredictiveAlert(null);
    if (q.length >= 2) {
      setResults(searchMCC(q));
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  const handleSelect = async (mcc: MCC) => {
    setQuery(`${mcc.code} - ${mcc.description}`);
    setSelected(mcc);
    setIsOpen(false);
    onChange(mcc);

    const memory = await computeMemory(mcc.code);
    if (memory && memory.totalTransactions > 1) {
      setPredictiveAlert(
        `Comercio con ${memory.totalTransactions} registros · Promedio: $${memory.averageAmount.toLocaleString()}`
      );
    }
  };

  const handleBlur = () => {
    if (selected) return;
    const trimmed = query.trim();
    if (trimmed.length > 0 && !findMCC(trimmed)) {
      onUnknownCode(trimmed);
    }
  };

  const mcc = selected ?? (value ? findMCC(value) : undefined);

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-navy-600 tracking-wide mb-1.5">
        MCC (Código de Comercio)
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-300" />
        <input
          type="text"
          value={query}
          onChange={e => handleQueryChange(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onBlur={handleBlur}
          placeholder="Buscar por código o concepto..."
          className="input-perfx pl-10"
        />
      </div>

      {mcc && (
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
            mcc.base_risk_score >= 75 ? 'text-red-600 bg-red-100 border-red-200' :
            mcc.base_risk_score >= 50 ? 'text-orange-600 bg-orange-100 border-orange-200' :
            mcc.base_risk_score >= 25 ? 'text-yellow-600 bg-yellow-100 border-yellow-200' :
            'text-green-600 bg-green-100 border-green-200'
          }`}>
            {mcc.base_risk_score}
          </span>
          <span className="text-xs font-mono text-navy-500">{mcc.code}</span>
          <span className="text-xs text-navy-400">— {mcc.description}</span>
        </div>
      )}

      {predictiveAlert && (
        <div className="mt-2 flex items-start gap-2 p-2.5 rounded-xl bg-navy-50 border border-navy-100">
          <AlertCircle className="w-4 h-4 text-navy-400 mt-0.5 shrink-0" />
          <p className="text-xs text-navy-500 leading-relaxed">{predictiveAlert}</p>
        </div>
      )}

      {isOpen && results.length > 0 && (
        <div className="absolute z-20 mt-2 w-full bg-white/80 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-soft-xl max-h-48 overflow-y-auto">
          {results.map(mcc => (
            <button
              key={mcc.code}
              onMouseDown={() => handleSelect(mcc)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-white/50 transition-colors text-navy-700 border-b border-white/20 last:border-0"
            >
              <span className="font-mono text-navy-500">{mcc.code}</span>
              <span className="flex-1">{mcc.description}</span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                mcc.base_risk_score >= 75 ? 'text-red-600 bg-red-100' :
                mcc.base_risk_score >= 50 ? 'text-orange-600 bg-orange-100' :
                mcc.base_risk_score >= 25 ? 'text-yellow-600 bg-yellow-100' :
                'text-green-600 bg-green-100'
              }`}>
                {mcc.base_risk_score}
              </span>
              {selected?.code === mcc.code && <Check className="w-3.5 h-3.5 text-navy-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
