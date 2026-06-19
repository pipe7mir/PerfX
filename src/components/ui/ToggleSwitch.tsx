interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

export default function ToggleSwitch({ label, checked, onChange, description }: ToggleSwitchProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group select-none">
      <div className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-10 h-[22px] rounded-full bg-white/50 border border-white/60 shadow-inner backdrop-blur-sm transition-all duration-300
          peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-indigo-500 peer-checked:border-transparent
          after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-[18px] after:h-[18px]
          after:rounded-full after:bg-white after:shadow-soft-md after:transition-all after:duration-300
          peer-checked:after:translate-x-5 peer-checked:after:bg-white" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-navy-700 group-hover:text-navy-900 transition-colors">
          {label}
        </span>
        {description && <p className="text-xs text-navy-400 mt-0.5 leading-relaxed">{description}</p>}
      </div>
    </label>
  );
}
