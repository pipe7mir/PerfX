import { type InputHTMLAttributes, forwardRef } from 'react';

interface PerfxInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const PerfxInput = forwardRef<HTMLInputElement, PerfxInputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1.5">
        <label htmlFor={inputId} className="block text-sm font-medium text-navy-600 tracking-wide">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`input-perfx ${error ? 'border-coral-400 focus:shadow-[0_0_0_3px_rgba(255,107,107,0.12)]' : ''} ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-coral-500 mt-1">{error}</p>}
      </div>
    );
  }
);

PerfxInput.displayName = 'PerfxInput';
export default PerfxInput;
