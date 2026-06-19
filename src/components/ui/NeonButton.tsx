import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface PerfxButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'danger' | 'success' | 'ghost' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles = {
  primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 active:scale-[0.98]',
  danger: 'bg-coral-500 text-white hover:bg-coral-400 shadow-soft-sm active:bg-coral-600',
  success: 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-soft-sm active:bg-emerald-600',
  ghost: 'text-navy-500 hover:text-navy-800 hover:bg-navy-50',
  outline: 'border-2 border-navy-200 text-navy-700 hover:border-navy-500 hover:text-navy-800 hover:bg-navy-50',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-sm',
};

export default function PerfxButton({
  children, onClick, type = 'button', variant = 'primary',
  loading = false, disabled = false, className = '', fullWidth = false, size = 'md',
}: PerfxButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`relative rounded-xl font-semibold tracking-wide transition-all duration-200
        disabled:opacity-40 disabled:cursor-not-allowed ${fullWidth ? 'w-full' : ''}
        ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Evaluando...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
