import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface RadarComparisonChartProps {
  historicalMax: number;
  historicalAvg: number;
  currentValue: number;
  currentFrequency: number;
  historicalFrequency: number;
}

export default function RadarComparisonChart({
  historicalMax, historicalAvg, currentValue, currentFrequency, historicalFrequency,
}: RadarComparisonChartProps) {
  const maxVal = Math.max(currentValue, historicalMax, 1);
  const maxFreq = Math.max(currentFrequency, historicalFrequency, 1);

  const data = [
    {
      name: 'Monto',
      Histórico: +((historicalAvg / maxVal) * 100).toFixed(0),
      Actual: +((currentValue / maxVal) * 100).toFixed(0),
    },
    {
      name: 'Máx Hist.',
      Histórico: +((historicalMax / maxVal) * 100).toFixed(0),
      Actual: +((currentValue / maxVal) * 100).toFixed(0),
    },
    {
      name: 'Frecuencia',
      Histórico: +((historicalFrequency / maxFreq) * 100).toFixed(0),
      Actual: +((currentFrequency / maxFreq) * 100).toFixed(0),
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barGap={4} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={{ stroke: '#E2E8F0' }} />
        <YAxis domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={{ stroke: '#E2E8F0' }} />
        <Tooltip
          contentStyle={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 12,
            boxShadow: '0 4px 12px rgba(27,42,74,0.08)',
            fontSize: 12,
          }}
          formatter={(value) => [`${value}%`]}
        />
        <Legend
          wrapperStyle={{ fontSize: 11, color: '#64748B', paddingTop: 8 }}
          iconType="circle"
        />
        <Bar dataKey="Histórico" fill="#E2E8F0" radius={[4, 4, 0, 0]} maxBarSize={24} />
        <Bar dataKey="Actual" fill="#3D518C" radius={[4, 4, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}
