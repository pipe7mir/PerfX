import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import {
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  ShieldCheck,
  Target,
  Zap,
  Activity,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function MccInsightsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchInsights = async () => {
    setIsRefreshing(true);
    try {
      const result = await api.mcc.getInsights();
      setData(result);
    } catch (error) {
      console.error('Error fetching MCC Insights:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
          Cargando Red Neuronal...
        </p>
      </div>
    );
  }

  if (!data) return null;

  const COLORS = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-navy-800 p-6 rounded-3xl border border-navy-200 dark:border-white/10 shadow-sm relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <BrainCircuit className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-navy-900 dark:text-white tracking-tight">Aprendizaje de Sistema IA</h1>
            <p className="text-sm font-medium text-navy-500 dark:text-navy-300 mt-1 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" /> Monitoreo y ajuste automático de MCCs
            </p>
          </div>
        </div>

        <button 
          onClick={fetchInsights}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-5 py-2.5 bg-navy-50 hover:bg-navy-100 dark:bg-navy-900 dark:hover:bg-navy-900/80 text-navy-700 dark:text-white rounded-xl font-bold text-sm transition-all shadow-sm border border-navy-200 dark:border-white/5 disabled:opacity-50 relative z-10"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
          Sincronizar Red
        </button>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { 
            title: "Reglas Adaptadas", 
            value: data.learning_stats.rules_adapted, 
            icon: Cpu, 
            color: "from-blue-500 to-cyan-400",
            shadow: "shadow-blue-500/20",
            subtitle: "Últimos 30 días"
          },
          { 
            title: "Falsos Positivos Evitados", 
            value: data.learning_stats.false_positives_prevented, 
            icon: ShieldCheck, 
            color: "from-emerald-500 to-teal-400",
            shadow: "shadow-emerald-500/20",
            subtitle: "Ahorro operativo"
          },
          { 
            title: "Mejora Precisión", 
            value: data.learning_stats.accuracy_improvement, 
            icon: Target, 
            color: "from-purple-500 to-pink-500",
            shadow: "shadow-purple-500/20",
            subtitle: "Respecto al mes anterior"
          },
          { 
            title: "Patrones Activos", 
            value: data.learning_stats.active_patterns, 
            icon: Zap, 
            color: "from-orange-500 to-amber-400",
            shadow: "shadow-orange-500/20",
            subtitle: "En vigilancia estricta"
          }
        ].map((kpi, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx} 
            className="bg-white dark:bg-navy-800 p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-navy-200 dark:border-white/10 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
          >
             <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${kpi.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}></div>
             <div className="flex flex-col-reverse sm:flex-row justify-between items-start sm:items-center relative z-10 gap-2 sm:gap-3">
               <div className="flex-1 min-w-0 w-full mt-1 sm:mt-0">
                 <p className="text-[8px] sm:text-xs font-bold text-navy-400 uppercase tracking-wider truncate">{kpi.title}</p>
                 <h3 className="text-xl sm:text-3xl font-black text-navy-900 dark:text-white mt-0.5 sm:mt-1">{kpi.value}</h3>
                 <p className="text-[8px] sm:text-[10px] font-medium text-navy-500 mt-0.5 sm:mt-2 truncate">{kpi.subtitle}</p>
               </div>
               <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center text-white shadow-lg shrink-0 ${kpi.shadow} self-end sm:self-auto`}>
                 <kpi.icon className="w-3 h-3 sm:w-5 sm:h-5" />
               </div>
             </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MCC Radar List */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-[#0a0f2e] rounded-3xl border border-white/10 shadow-xl overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
          <div className="p-6 border-b border-white/5 flex justify-between items-center relative z-10">
            <div>
              <h2 className="text-lg font-bold text-white">Ranking Riesgo MCC</h2>
              <p className="text-xs text-slate-400">Comercios con mayor propensión al fraude</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.top_fraud_mccs}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Riesgo" dataKey="fraud_rate" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} dot={{ fill: '#ec4899', r: 3 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3">
              {data.top_fraud_mccs.map((mcc: any, idx: number) => (
                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white dark:bg-navy-800/5 border border-white/5 hover:bg-white dark:hover:bg-navy-700 dark:bg-navy-800/10 transition-colors gap-1 sm:gap-0">
                  <div className="flex items-center gap-2 sm:gap-3 w-full">
                    <div className="w-7 h-7 sm:w-10 sm:h-10 shrink-0 rounded-lg sm:rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-[9px] sm:text-xs border border-blue-500/20">
                      {mcc.mcc}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[9px] sm:text-sm font-bold text-slate-800 dark:text-white truncate">{mcc.name}</h3>
                      <p className="text-[8px] sm:text-[10px] text-slate-400">Riesgo: {mcc.fraud_rate}%</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg self-end sm:self-auto ${mcc.trend.startsWith('+') ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {mcc.trend.startsWith('+') ? <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                    {mcc.trend}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* AI Confidence & Channels */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-navy-800 rounded-3xl border border-navy-200 dark:border-white/10 p-6 shadow-sm"
          >
            <h2 className="text-sm font-bold text-navy-900 dark:text-white mb-1">Evolución de Confianza</h2>
            <p className="text-[10px] text-navy-500 mb-4">Efectividad del modelo predictivo</p>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.confidence_trend}>
                  <defs>
                    <linearGradient id="colorConf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="confidence" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorConf)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-navy-800 rounded-3xl border border-navy-200 dark:border-white/10 p-6 shadow-sm"
          >
            <h2 className="text-sm font-bold text-navy-900 dark:text-white mb-1">Canales Vulnerados</h2>
            <p className="text-[10px] text-navy-500 mb-4">Vectores de ataque más utilizados</p>
            <div className="h-[140px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.most_used_channels}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="channel"
                  >
                    {data.most_used_channels.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {data.most_used_channels.map((c: any, idx: number) => (
                <div key={idx} className="text-center bg-navy-50 dark:bg-navy-900/50 rounded-xl py-2">
                  <p className="text-[10px] text-navy-500 font-bold uppercase truncate px-1">{c.channel}</p>
                  <p className="text-lg font-black text-navy-900 dark:text-white" style={{ color: COLORS[idx % COLORS.length] }}>{c.count}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
