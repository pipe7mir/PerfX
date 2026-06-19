import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface GaugeChartProps {
  score: number;
}

export default function GaugeChart({ score }: GaugeChartProps) {
  const clampedScore = Math.min(100, Math.max(0, score));
  const data = [
    { name: 'risk', value: clampedScore },
    { name: 'remaining', value: 100 - clampedScore },
  ];

  const getColor = (s: number) => {
    if (s >= 70) return '#FF6B6B';
    if (s >= 40) return '#F59E0B';
    if (s >= 20) return '#4A6FA5';
    return '#10B981';
  };

  const color = getColor(clampedScore);

  return (
    <div className="relative flex flex-col items-center">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%" cy="100%"
            startAngle={180} endAngle={0}
            innerRadius={65} outerRadius={90}
            dataKey="value" stroke="none"
          >
            <Cell fill={color} />
            <Cell fill="#E2E8F0" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute bottom-2 flex flex-col items-center">
        <span className="text-3xl font-bold tracking-tight" style={{ color }}>
          {clampedScore}
        </span>
        <span className="text-[9px] text-navy-300 tracking-widest uppercase font-medium">/100</span>
      </div>
      <div className="flex justify-between w-full px-4 mt-[-4px]">
        <span className="text-[9px] text-emerald-500 font-semibold">Bajo</span>
        <span className="text-[9px] text-coral-500 font-semibold">Crítico</span>
      </div>
    </div>
  );
}
