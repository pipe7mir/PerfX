import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'critical' | 'high' | 'medium' | 'low' | 'info';
  className?: string;
}

const variantStyles: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 border border-red-200',
  high: 'bg-coral-100 text-coral-500 border border-coral-200',
  medium: 'bg-amber-100 text-amber-600 border border-amber-200',
  low: 'bg-emerald-100 text-emerald-600 border border-emerald-200',
  info: 'bg-navy-100 text-navy-600 border border-navy-200',
};

export default function Badge({ children, variant = 'info', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
