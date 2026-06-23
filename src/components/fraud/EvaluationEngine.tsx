import { useState, useEffect, useRef } from 'react';
import { Zap, ShieldCheck, Search, Building2, CreditCard, Activity, CheckCircle, AlertTriangle, XCircle, Plus, Database, MessageSquareText, TrendingUp, PieChart as PieChartIcon, User, Briefcase, Info } from 'lucide-react';
import gsap from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { api } from '../../services/api';
import type { EvaluationInput, EvaluationResult, MCC } from '../../types';
import { useMCC } from '../../context/MCCContext';

const APPROVED_VARIANTS = [
  (hasContact: boolean, contactText: string) =>
    `La operación tiene buen pronóstico. No se detectaron señales de riesgo que justifiquen una revisión manual.${hasContact ? contactText : ''} Se puede procesar sin fricciones.`,
  (hasContact: boolean, contactText: string) =>
    `Todo en orden. Los patrones de la transacción coinciden con el comportamiento esperado del comercio.${hasContact ? contactText : ''} El pago queda aprobado automáticamente.`,
  (hasContact: boolean, contactText: string) =>
    `Sin indicios de fraude. El perfil del cliente y el historial del comercio no presentan anomalías.${hasContact ? contactText : ''} Riesgo bajo, transacción fluida.`,
];
const REVIEW_VARIANTS = [
  (mainReasons: string, score: number, contactText: string) =>
    `Algo no cuadra del todo (Score: ${score}). Los factores que llaman la atención son: ${mainReasons}.${contactText} Vale la pena hacer una llamada de verificación antes de liberar los fondos.`,
  (mainReasons: string, score: number, contactText: string) =>
    `Riesgo moderado-alto detectado (Score: ${score}). Puntos de atención: ${mainReasons}.${contactText} Recomendamos contactar al cliente para confirmar la operación.`,
  (mainReasons: string, score: number, contactText: string) =>
    `Señales mixtas en esta transacción (Score: ${score}). Lo que más preocupa: ${mainReasons}.${contactText} Una confirmación con el titular ayudaría a disipar dudas.`,
];
const REJECT_VARIANTS = [
  (contactText: string) =>
    `Riesgo crítico. La combinación de factores activados indica un intento de fraude con alta probabilidad.${contactText} Se debe rechazar sin contacto con el emisor.`,
  (contactText: string) =>
    `Múltiples alertas de fraude coinciden en esta operación. El sistema recomienda bloqueo automático.${contactText} No intentar contacto con el cliente para evitar alertar a posibles atacantes.`,
  (contactText: string) =>
    `Operación de alto riesgo. Los indicadores superan todos los umbrales de seguridad establecidos.${contactText} Rechazar inmediatamente y registrar para análisis forense posterior.`,
];

const getHumanExplanation = (result: EvaluationResult) => {
  const hasContact = result.historicalFrequency > 0;
  const maxFmt = result.historicalMax > 0
    ? ` (máx. histórico: $${result.historicalMax.toLocaleString('es-CO')})`
    : '';
  const contactText = hasContact 
    ? ` El historial de contacto previo positivo${maxFmt} respalda la operación.`
    : ' La falta de contacto previo incrementa la incertidumbre.';

  if (result.verdict === 'APROBAR_TRX') {
    const variant = APPROVED_VARIANTS[Math.floor(Math.random() * APPROVED_VARIANTS.length)];
    return variant(hasContact, contactText);
  } else if (result.verdict === 'CONTACTAR_CLIENTE') {
    const mainReasons = result.triggeredRules.filter(r => r.score > 0).map(r => r.ruleName.toLowerCase()).join(' y ');
    const variant = REVIEW_VARIANTS[Math.floor(Math.random() * REVIEW_VARIANTS.length)];
    return variant(mainReasons || 'factores anómalos', result.riskScore, contactText);
  } else {
    const variant = REJECT_VARIANTS[Math.floor(Math.random() * REJECT_VARIANTS.length)];
    return variant(contactText);
  }
};

export default function EvaluationEngine() {
  const { mccs, lookupFullCatalog, suggestFullCatalog, addMCC } = useMCC();

  // Estados de Negocio y UX
  const [clientType, setClientType] = useState<'NATURAL' | 'JURIDICA'>('NATURAL');
  const [transactionType, setTransactionType] = useState<'POS' | 'INT'>('POS');
  const [hasContact, setHasContact] = useState(false);
  const [priorContactCount, setPriorContactCount] = useState<string>('1');
  const [priorContactMaxValue, setPriorContactMaxValue] = useState<string>('0');

  const [merchantName, setMerchantName] = useState('');
  const [mccSearch, setMccSearch] = useState('');
  const [selectedMccId, setSelectedMccId] = useState('');
  
  const [currentTrxValue, setCurrentTrxValue] = useState<string>('');
  const [currency, setCurrency] = useState<'COP' | 'USD' | 'EUR'>('COP');
  const [trxCount24h, setTrxCount24h] = useState<string>('1');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResult & { transactionId?: string; processingTimeMs?: number } | null>(null);
  const [error, setError] = useState('');
  const [addedMessage, setAddedMessage] = useState('');

  const resultRef = useRef<HTMLDivElement>(null);

  // Lógica de Validación Cruzada (Progressive Disclosure)
  const isStrictMode = !hasContact;
  const suggestedLimit = clientType === 'NATURAL' ? 500000 : 5000000;
  
  // Asumimos que si no es COP, convertimos rudimentariamente para la advertencia visual
  const getApproxValueCOP = () => {
    const val = parseFloat(currentTrxValue) || 0;
    if (currency === 'USD') return val * 4000;
    if (currency === 'EUR') return val * 4400;
    return val;
  };
  const amountExceedsLimit = isStrictMode && getApproxValueCOP() > suggestedLimit;

  useEffect(() => {
    if (result && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);

      gsap.fromTo(
        resultRef.current,
        { opacity: 0, y: 40, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(1.2)" }
      );
    }
  }, [result]);

  const filteredMccs = mccs.filter(m => 
    m.code.includes(mccSearch) || m.description.toLowerCase().includes(mccSearch.toLowerCase())
  ).slice(0, 5);

  const fullSuggestion = mccSearch && !selectedMccId && filteredMccs.length === 0
    ? lookupFullCatalog(mccSearch)
    : undefined;
  const fullSuggestions = mccSearch && !selectedMccId && filteredMccs.length === 0 && !fullSuggestion
    ? suggestFullCatalog(mccSearch)
    : [];

  const handleAddToCatalog = () => {
    if (!fullSuggestion) return;
    const code = mccSearch;
    const desc = fullSuggestion;
    addMCC(code, desc, 30);
    setSelectedMccId(code);
    setMccSearch(`${code} - ${desc}`);
    setAddedMessage(`MCC ${code} agregado al catálogo local`);
    setTimeout(() => setAddedMessage(''), 3000);
  };

  const getRiskColor = (mcc: MCC) => {
    if (mcc.base_risk_score >= 70) return 'text-red-600 bg-red-50 border-red-200';
    if (mcc.base_risk_score >= 30) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  };
  
  const getRiskLabel = (mcc: MCC) => {
    if (mcc.base_risk_score >= 70) return 'HIGH';
    if (mcc.base_risk_score >= 30) return 'MEDIUM';
    return 'LOW';
  };

  const handleEvaluate = async () => {
    setError('');
    if (!selectedMccId) {
      setError('Debes seleccionar un MCC válido');
      return;
    }

    setLoading(true);
    try {
      const baseValue = parseFloat(currentTrxValue) || 0;
      let finalValueCOP = baseValue;
      if (currency === 'USD') finalValueCOP = baseValue * 4000;
      if (currency === 'EUR') finalValueCOP = baseValue * 4400;

      const maxHistValue = parseFloat(priorContactMaxValue) || 0;
      let finalMaxHistCOP = maxHistValue;
      if (currency === 'USD') finalMaxHistCOP = maxHistValue * 4000;
      if (currency === 'EUR') finalMaxHistCOP = maxHistValue * 4400;

      const payload: EvaluationInput = {
        transactionType,
        hasPriorContact: hasContact,
        priorContactCount: hasContact ? (parseInt(priorContactCount, 10) || 1) : 0,
        priorContactMaxValue: hasContact ? finalMaxHistCOP : 0,
        mccCode: selectedMccId,
        currentTrxValue: finalValueCOP,
        trxCountLast24h: parseInt(trxCount24h, 10) || 1,
      };
      const res = await api.evaluate(payload);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el motor de evaluación');
    }
    setLoading(false);
  };

  // UI Components
  const SegmentedControl = ({ options, active, onChange }: any) => (
    <div className="flex bg-slate-100/80 p-1.5 rounded-2xl">
      {options.map((opt: any) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 text-sm font-bold rounded-xl transition-all duration-300 ${
            active === opt.value 
              ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {opt.icon && <opt.icon className="w-4 h-4" />}
          {opt.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: Contexto de la Operación */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-slate-100/50">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Contexto
            </h3>

            <div className="space-y-6">
              {/* Tipo de Cliente */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Perfil del Cliente</label>
                <SegmentedControl 
                  active={clientType} 
                  onChange={setClientType}
                  options={[
                    { label: 'Persona Natural', value: 'NATURAL', icon: User },
                    { label: 'Persona Jurídica', value: 'JURIDICA', icon: Briefcase }
                  ]}
                />
              </div>

              {/* Canal Transaccional */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Canal Transaccional</label>
                <SegmentedControl 
                  active={transactionType} 
                  onChange={setTransactionType}
                  options={[
                    { label: 'Físico (POS)', value: 'POS' },
                    { label: 'Internet (INT)', value: 'INT' }
                  ]}
                />
              </div>

              {/* Contacto Previo (Strict Mode Trigger) */}
              <div className="pt-2">
                <div className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100 transition-colors hover:bg-slate-100/50">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-2xl ${hasContact ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">¿Contacto previo?</h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">Mitiga el riesgo de suplantación</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setHasContact(!hasContact)}
                    className={`w-12 h-6 rounded-full transition-colors relative shadow-inner ${hasContact ? 'bg-blue-600' : 'bg-slate-300'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm absolute top-1 transition-transform duration-300 ${hasContact ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>

                <AnimatePresence>
                  {isStrictMode ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex gap-3 items-start">
                        <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-orange-800">Modo Estricto Activado</p>
                          <p className="text-xs text-orange-700/80 mt-1 font-medium leading-relaxed">
                            Evaluando posible suplantación en primera operación. Límite sugerido: ${suggestedLimit.toLocaleString('es-CO')} COP.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-4 bg-blue-50/50 p-5 rounded-3xl border border-blue-100">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-2">Freq. Histórica</label>
                          <input
                            type="number"
                            min="1"
                            value={priorContactCount}
                            onChange={(e) => setPriorContactCount(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 px-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-2">Valor Máx ({currency})</label>
                          <input
                            type="number"
                            min="0"
                            value={priorContactMaxValue}
                            onChange={(e) => setPriorContactMaxValue(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 px-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Datos de la Transacción Actual */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100/50">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Transacción
            </h3>
            
            <div className="space-y-6">
              
              {/* Buscador MCC Inteligente */}
              <div className="relative z-20">
                <label className="block text-sm font-semibold text-slate-700 mb-3">Clasificación del Comercio (MCC)</label>
                
                <AnimatePresence mode="wait">
                  {!selectedMccId ? (
                    <motion.div
                      key="search"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="relative"
                    >
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Buscar por código o palabra clave..."
                        value={mccSearch}
                        onChange={(e) => setMccSearch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                      />
                      
                      {/* Dropdown Resultados */}
                      {mccSearch && (
                        <div className="absolute w-full mt-2 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden z-50">
                          {filteredMccs.length > 0 ? (
                            filteredMccs.map(mcc => (
                              <button
                                key={mcc.code}
                                onClick={() => {
                                  setSelectedMccId(mcc.code);
                                  setMccSearch(`${mcc.code} - ${mcc.description}`);
                                }}
                                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 text-left"
                              >
                                <div>
                                  <p className="text-sm font-bold text-slate-800">{mcc.code}</p>
                                  <p className="text-xs text-slate-500 font-medium">{mcc.description}</p>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${getRiskColor(mcc)}`}>
                                  {getRiskLabel(mcc)}
                                </span>
                              </button>
                            ))
                          ) : fullSuggestion ? (
                            <div className="p-4">
                              <p className="text-xs text-slate-400 font-medium mb-2">Código encontrado en catálogo global</p>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-bold text-slate-800">{mccSearch}</p>
                                  <p className="text-xs text-slate-500 font-medium">{fullSuggestion}</p>
                                </div>
                                <button
                                  onClick={handleAddToCatalog}
                                  className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl transition-colors"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Agregar
                                </button>
                              </div>
                            </div>
                          ) : fullSuggestions.length > 0 ? (
                            <div>
                              <p className="px-4 pt-3 pb-1 text-xs text-slate-400 font-medium">Sugerencias del catálogo global</p>
                              {fullSuggestions.map(s => (
                                <button
                                  key={s.code}
                                  onClick={() => {
                                    setMccSearch(s.code);
                                    const found = lookupFullCatalog(s.code);
                                    if (found) {
                                      setSelectedMccId(s.code);
                                      setMccSearch(`${s.code} - ${found}`);
                                    }
                                  }}
                                  className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 text-left pl-8"
                                >
                                  <div>
                                    <p className="text-sm font-bold text-slate-800">{s.code}</p>
                                    <p className="text-xs text-slate-500 font-medium">{s.description}</p>
                                  </div>
                                  <span className="text-[10px] font-bold px-2 py-1 rounded-md border text-slate-400 bg-slate-50 border-slate-200">
                                    REF
                                  </span>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 text-sm text-slate-500 text-center font-medium">Sin resultados</div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="chip"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col gap-3"
                    >
                      <div className="bg-slate-800 text-white rounded-2xl p-4 shadow-md flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5 text-blue-300" />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-0.5">MCC Seleccionado</p>
                            <p className="text-sm font-bold truncate pr-4">{mccSearch}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => { setSelectedMccId(''); setMccSearch(''); }}
                          className="text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl transition-colors shrink-0"
                        >
                          Cambiar
                        </button>
                      </div>
                      
                      {/* Micro-tarjeta de divulgación progresiva */}
                      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-3 flex items-start gap-3">
                        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-800 font-medium leading-relaxed">
                          Este código define el perfil de riesgo base de la industria. El análisis incluirá comercios similares para evaluar anomalías de frecuencia y montos.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Nombre y Valor en Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Nombre del Comercio */}
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <label className="block text-sm font-semibold text-slate-700">Comercio</label>
                    <span className="text-xs text-slate-400 font-medium">(Opcional)</span>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Ej: Amazon, Uber..."
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Frecuencia TRX */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Frecuencia (Últimas 24h)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Transacciones en 24h"
                    value={trxCount24h}
                    onChange={(e) => setTrxCount24h(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Valor TRX con Validación Cruzada */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Monto de Transacción
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold ${amountExceedsLimit ? 'text-red-400' : 'text-slate-400'}`}>$</span>
                    <input
                      type="number"
                      min="0"
                      placeholder={`Límite sugerido: $${suggestedLimit.toLocaleString()} COP`}
                      value={currentTrxValue}
                      onChange={(e) => setCurrentTrxValue(e.target.value)}
                      className={`w-full border rounded-2xl py-3.5 pl-8 pr-4 text-sm font-semibold focus:outline-none focus:ring-2 transition-all placeholder:font-medium
                        ${amountExceedsLimit 
                          ? 'bg-red-50 border-red-300 text-red-900 focus:ring-red-500/20 placeholder:text-red-300' 
                          : 'bg-slate-50 border-slate-200 text-slate-800 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400'
                        }`}
                    />
                  </div>
                  <select 
                    value={currency} 
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="COP">COP</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                
                <AnimatePresence>
                  {amountExceedsLimit && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-2 flex items-center gap-1.5 text-xs font-bold text-red-500"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      El monto supera el umbral seguro para una primera operación.
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        </div>
      </div>

      {addedMessage && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-sm font-bold text-center border border-emerald-200 flex items-center justify-center gap-2 animate-in slide-in-from-top-2 fade-in duration-300">
          <CheckCircle className="w-5 h-5" />
          {addedMessage}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold text-center border border-red-100 flex items-center justify-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Botón de Acción Principal */}
      <div className="flex justify-center pt-2">
        <button
          onClick={handleEvaluate}
          disabled={loading}
          className="relative group overflow-hidden rounded-[2rem] p-[3px]"
        >
          <span className={`absolute inset-0 rounded-[2rem] blur-sm transition-all duration-500 ${
            amountExceedsLimit 
              ? 'bg-gradient-to-r from-red-500 to-orange-500 opacity-80 group-hover:opacity-100' 
              : 'bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 opacity-70 group-hover:opacity-100'
          }`} />
          <span className={`absolute inset-0 rounded-[2rem] ${
            amountExceedsLimit 
              ? 'bg-gradient-to-r from-red-500 to-orange-500' 
              : 'bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600'
          }`} />
          
          <div className={`relative px-10 py-4 rounded-[calc(2rem-3px)] flex items-center gap-3 transition-all duration-300 group-hover:bg-opacity-0 ${
            amountExceedsLimit ? 'bg-gradient-to-r from-red-600 to-orange-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600'
          }`}>
            {loading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Zap className="w-6 h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
            )}
            <span className="text-white font-black text-lg tracking-wide drop-shadow-md">
              EVALUAR RIESGO
            </span>
          </div>
        </button>
      </div>

      {/* Resultado Animado (Se mantiene el diseño ganador) */}
      {result && (
        <div ref={resultRef} className="mt-8">
          <div className={`relative overflow-hidden rounded-3xl p-1 shadow-xl ${
            result.verdict === 'APROBAR_TRX' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/10' :
            result.verdict === 'CONTACTAR_CLIENTE' ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/10' :
            'bg-gradient-to-br from-red-500 to-red-700 shadow-red-500/10'
          }`}>
            <div className="bg-white/95 backdrop-blur-xl rounded-[calc(1.5rem-4px)] p-8 md:p-12 flex flex-col gap-8 relative overflow-hidden">
              
              <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-10 blur-3xl ${
                result.verdict === 'APROBAR_TRX' ? 'bg-emerald-500' :
                result.verdict === 'CONTACTAR_CLIENTE' ? 'bg-amber-500' :
                'bg-red-500'
              }`} />

              <div className="flex flex-col md:flex-row items-center justify-between gap-8 z-10 w-full">
                <div className="flex-1 text-center md:text-left">
                  <h4 className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">Decisión del Motor</h4>
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                    {result.verdict === 'APROBAR_TRX' && <CheckCircle className="w-8 h-8 text-emerald-500" />}
                    {result.verdict === 'CONTACTAR_CLIENTE' && <AlertTriangle className="w-8 h-8 text-amber-500" />}
                    {result.verdict === 'DESCARTAR' && <XCircle className="w-8 h-8 text-red-500" />}
                    <h2 className={`text-3xl md:text-4xl font-black tracking-tight ${
                      result.verdict === 'APROBAR_TRX' ? 'text-emerald-600' :
                      result.verdict === 'CONTACTAR_CLIENTE' ? 'text-amber-600' :
                      'text-red-600'
                    }`}>
                      {result.verdict === 'APROBAR_TRX' ? 'APROBAR' : result.verdict === 'CONTACTAR_CLIENTE' ? 'REVISAR' : 'RECHAZAR'}
                    </h2>
                  </div>
                  {result.transactionId && (
                    <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg w-fit border border-slate-200 mx-auto md:mx-0">
                      <Database className="w-3.5 h-3.5 text-blue-500" />
                      Evaluación guardada en la base de datos
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center justify-center min-w-[200px]">
                  <div className="relative">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="56" className="stroke-slate-100" strokeWidth="12" fill="none" />
                      <circle 
                        cx="64" cy="64" r="56" 
                        className={`transition-all duration-1000 ease-out ${
                          result.verdict === 'APROBAR_TRX' ? 'stroke-emerald-500' :
                          result.verdict === 'CONTACTAR_CLIENTE' ? 'stroke-amber-500' :
                          'stroke-red-500'
                        }`} 
                        strokeWidth="12" 
                        fill="none" 
                        strokeLinecap="round"
                        strokeDasharray="351.858"
                        strokeDashoffset={351.858 - (351.858 * result.riskScore) / 100}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-3xl font-black text-slate-800">{result.riskScore}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Score</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contexto Histórico — Contacto Previo & Máximo */}
              <div className="z-10 mt-2 pt-5 border-t border-slate-100/60">
                <div className="flex flex-wrap gap-3">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold border ${
                    result.historicalFrequency > 0
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}>
                    <ShieldCheck className="w-4 h-4" />
                    {result.historicalFrequency > 0
                      ? `Contacto previo ✔ — ${result.historicalFrequency} vez${result.historicalFrequency !== 1 ? 'es' : ''}`
                      : 'Sin contacto previo'}
                  </div>

                  {result.historicalMax > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold border bg-blue-50 border-blue-200 text-blue-700">
                      <TrendingUp className="w-4 h-4" />
                      Máx. histórico: ${result.historicalMax.toLocaleString('es-CO')}
                    </div>
                  )}

                  {result.historicalMax > 0 && (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold border ${
                      result.currentValue <= result.historicalMax
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                      <CreditCard className="w-4 h-4" />
                      TRX ${result.currentValue.toLocaleString('es-CO')}
                      {result.currentValue <= result.historicalMax
                        ? ' ≤ Máx ✔'
                        : ` ▲ ${((result.currentValue / result.historicalMax - 1) * 100).toFixed(0)}% sobre máx`}
                    </div>
                  )}
                </div>
              </div>

              {/* Explicación Humanizada */}
              <div className="z-10 mt-2 pt-6 border-t border-slate-100/60 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className={`p-5 rounded-2xl border shadow-sm ${
                  result.verdict === 'APROBAR_TRX' ? 'bg-emerald-50/50 border-emerald-100' :
                  result.verdict === 'CONTACTAR_CLIENTE' ? 'bg-amber-50/50 border-amber-100' :
                  'bg-red-50/50 border-red-100'
                }`}>
                  <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <MessageSquareText className={`w-4 h-4 ${
                      result.verdict === 'APROBAR_TRX' ? 'text-emerald-500' :
                      result.verdict === 'CONTACTAR_CLIENTE' ? 'text-amber-500' :
                      'text-red-500'
                    }`} />
                    Análisis de Inteligencia
                  </h4>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    {getHumanExplanation(result)}
                  </p>
                </div>
              </div>

              {/* Razones del Dictamen & Gráficas */}
              {result.triggeredRules && result.triggeredRules.length > 0 && (
                <div className="z-10 mt-5 grid lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                  
                  {/* Lista de Factores */}
                  <div className="bg-white dark:bg-[#11175c] rounded-2xl border border-slate-100 dark:border-[#0B104A] p-4 shadow-sm flex flex-col">
                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-slate-400" />
                      Factores Activados
                    </h4>
                    <div className="flex-1 overflow-y-auto pr-1">
                      <ul className="space-y-2">
                        {result.triggeredRules.map((rule, idx) => (
                          <li key={idx} className="flex items-center justify-between bg-slate-50/80 dark:bg-[#0B104A]/50 p-2.5 rounded-lg border border-slate-100 dark:border-[#0B104A] shadow-sm hover:bg-white dark:hover:bg-[#0B104A] transition-colors group">
                            <div className="flex items-center gap-2.5 truncate">
                              <div className={`shrink-0 p-1 rounded-md ${
                                rule.alertLevel === 'critical' ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' :
                                rule.alertLevel === 'high' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400' :
                                rule.score < 0 ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                                'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                              }`}>
                                {rule.score < 0 ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                              </div>
                              <span className="font-bold text-xs text-slate-700 dark:text-slate-300 truncate">{rule.ruleName}</span>
                            </div>
                            <span className={`text-xs font-black tabular-nums shrink-0 ml-2 ${rule.score < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                              {rule.score > 0 ? '+' : ''}{rule.score}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Gráfico de Impacto */}
                  <div className="bg-white dark:bg-[#11175c] rounded-2xl border border-slate-100 dark:border-[#0B104A] p-4 shadow-sm flex flex-col">
                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                      Impacto Relativo
                    </h4>
                    <div className="flex-1 min-h-[160px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={result.triggeredRules} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                          <XAxis type="number" hide />
                          <YAxis dataKey="ruleName" type="category" width={110} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                          <Tooltip 
                            cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#fff', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.2)', fontSize: '12px', fontWeight: 'bold', padding: '10px' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value: any) => [value > 0 ? `+${value} pts` : `${value} pts`, 'Impacto']}
                          />
                          <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={16} animationDuration={1500}>
                            {result.triggeredRules.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={
                                entry.alertLevel === 'critical' ? '#ef4444' :
                                entry.alertLevel === 'high' ? '#f59e0b' : 
                                entry.score < 0 ? '#10b981' : '#3b82f6'
                              } />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Gráfico Comparativo: Transacción vs Umbrales */}
                  <div className="bg-white dark:bg-[#11175c] rounded-2xl border border-slate-100 dark:border-[#0B104A] p-4 shadow-sm flex flex-col">
                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <PieChartIcon className="w-3.5 h-3.5 text-indigo-500" />
                      Análisis Multicriterio
                    </h4>
                    <div className="flex-1 min-h-[160px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={(() => {
                          const mccScore = result.triggeredRules.find(r => r.ruleId === 'base-mcc-risk');
                          return [
                            { dimension: 'Valor TRX', actual: Math.min(100, (result.currentValue / Math.max(result.historicalMax, 1)) * 50), max: 50 },
                            { dimension: 'Frecuencia', actual: Math.min(100, result.currentFrequency * 15), max: 100 },
                            { dimension: 'Riesgo MCC', actual: mccScore ? mccScore.score : 0, max: 35 },
                            { dimension: 'Contacto Previo', actual: result.historicalFrequency > 0 ? 0 : 80, max: 80 },
                            { dimension: 'Canal', actual: 0, max: 25 },
                          ];
                        })()} cx="50%" cy="50%" outerRadius="72%" animationDuration={1500}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8, fill: '#cbd5e1' }} tickCount={4} />
                          <Radar name="Transacción Actual" dataKey="actual" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                          <Radar name="Umbral Máximo" dataKey="max" stroke="#cbd5e1" fill="#cbd5e1" fillOpacity={0.05} strokeWidth={1.5} strokeDasharray="4 3" />
                          <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#fff', fontSize: '12px', fontWeight: 'bold', padding: '10px' }}
                            itemStyle={{ color: '#94a3b8' }}
                            labelStyle={{ color: '#fff', fontWeight: 800, marginBottom: 4 }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
