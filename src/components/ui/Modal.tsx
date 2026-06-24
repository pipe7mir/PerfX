import { useEffect, type ReactNode, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      contentRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={contentRef}
        tabIndex={-1}
        className="relative bg-white dark:bg-navy-800/70 backdrop-blur-2xl border border-white/60 rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto p-6 shadow-soft-xl animate-[fadeIn_0.3s_ease-out,scaleIn_0.3s_ease-out]"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-navy-800 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-navy-50 dark:hover:bg-navy-700 text-navy-400 hover:text-navy-600 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
