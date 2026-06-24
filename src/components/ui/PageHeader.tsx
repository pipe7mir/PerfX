import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: string;
  action?: ReactNode;
}

export default function PageHeader({ title, subtitle, icon: Icon, badge, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="p-3 bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-2xl text-blue-600 dark:text-blue-400 shadow-sm">
            <Icon className="w-5 h-5" strokeWidth={2.5} />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">{title}</h2>
            {badge && (
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-500/30 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
