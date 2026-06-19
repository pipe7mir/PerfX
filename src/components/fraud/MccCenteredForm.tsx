import React, { useState } from 'react';
import { Store, ShieldAlert, X } from 'lucide-react';
import type { Mcc } from '../../types';

interface MccCenteredFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (mccData: Partial<Mcc>) => Promise<void>;
}

export const MccCenteredForm: React.FC<MccCenteredFormProps> = ({ isOpen, onClose, onSubmit }) => {
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [riskScore, setRiskScore] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        code,
        description,
        base_risk_score: riskScore
      });
      // Limpiar formulario en éxito
      setCode('');
      setDescription('');
      setRiskScore(0);
      onClose();
    } catch (error) {
      console.error('Error guardando MCC:', error);
      // Aquí se conectaría la alerta con la Dynamic Island
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Backdrop overlay que bloquea el scroll de fondo
    <div className="fixed inset-0 z-40 bg-navy-900/40 dark:bg-abyssal-dark/80 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Modal Container */}
      <div 
        className="card w-full max-w-md relative animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-navy-400 hover:text-navy-900 dark:hover:text-cyan-neon transition-colors rounded-full"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>

        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-navy-50 dark:bg-navy-900/50 rounded-xl text-navy-600 dark:text-cyan-neon">
              <Store className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-navy-900 dark:text-white">
                Registrar MCC
              </h2>
              <p className="text-sm text-navy-500 dark:text-navy-400">
                Añade un nuevo código de categoría de comercio.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="mccCode" className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1.5">
                Código MCC (4 dígitos)
              </label>
              <input
                id="mccCode"
                type="text"
                maxLength={4}
                required
                pattern="\d{4}"
                placeholder="Ej. 5999"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="input-field font-mono text-lg tracking-widest uppercase"
              />
            </div>

            <div>
              <label htmlFor="mccDesc" className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1.5">
                Descripción / Concepto
              </label>
              <input
                id="mccDesc"
                type="text"
                required
                placeholder="Ej. Miscellaneous Retail"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="riskScore" className="block text-sm font-medium text-navy-700 dark:text-navy-300">
                  Score de Riesgo Base
                </label>
                <span className="text-sm font-bold text-navy-900 dark:text-cyan-neon">{riskScore} / 100</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-navy-400 dark:text-navy-500" strokeWidth={1.5} />
                <input
                  id="riskScore"
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={riskScore}
                  onChange={(e) => setRiskScore(Number(e.target.value))}
                  className="w-full h-2 bg-navy-200 rounded-lg appearance-none cursor-pointer dark:bg-navy-700 accent-navy-600 dark:accent-cyan-neon"
                />
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-navy-100 dark:border-navy-800">
              <button
                type="submit"
                disabled={isSubmitting || code.length !== 4}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar MCC'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
