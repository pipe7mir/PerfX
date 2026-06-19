import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<{ resolve: (value: boolean) => void } | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolver({ resolve });
    });
  }, []);

  const handleConfirm = () => {
    if (resolver) resolver.resolve(true);
    close();
  };

  const handleCancel = () => {
    if (resolver) resolver.resolve(false);
    close();
  };

  const close = () => {
    setIsOpen(false);
    setTimeout(() => {
      setOptions(null);
      setResolver(null);
    }, 200); // Wait for transition
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      
      {/* Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={handleCancel}
          ></div>
          
          {/* Modal Dialog */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  options?.type === 'danger' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-500'
                }`}>
                  <AlertTriangle className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <button 
                  onClick={handleCancel}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-2">
                {options?.title || 'Confirmación'}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                {options?.message}
              </p>
            </div>
            
            <div className="bg-slate-50/50 p-4 border-t border-slate-100 flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                {options?.cancelText || 'Cancelar'}
              </button>
              <button
                onClick={handleConfirm}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-colors ${
                  options?.type === 'danger' 
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' 
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                }`}
              >
                {options?.confirmText || 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
