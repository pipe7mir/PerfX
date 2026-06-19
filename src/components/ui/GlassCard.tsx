import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  flat?: boolean;
}

export default function Card({ children, className = '', hover = false, flat = false }: CardProps) {
  const style = flat ? 'card-flat' : 'card';
  return (
    <div className={`${style} p-6 ${hover ? 'card-hover' : ''} ${className}`}>
      {children}
    </div>
  );
}
