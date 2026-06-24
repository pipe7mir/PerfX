import { useState } from 'react';
import Card from '../components/ui/GlassCard';
import { MccCenteredForm } from '../components/fraud/MccCenteredForm';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import type { Mcc } from '../types';
import { useMCC } from '../context/MCCContext';
import { Search, List, Plus } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';

export default function MCCPage() {
  const { mccs } = useMCC();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSaveMcc = async (mccData: Partial<Mcc>) => {
    try {
      await api.mcc.insert(mccData as Mcc);
      toast.success('MCC guardado en Supabase');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error guardando MCC');
    }
  };

  return (
    <div className="max-w-4xl mx-auto relative">
      <PageHeader 
        title="Catálogo de MCC" 
        subtitle="Base de datos de comercios y sus niveles de riesgo."
        badge="GESTIÓN"
        icon={List}
        action={
          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-[0_4px_15px_rgba(37,99,235,0.3)] transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Añadir MCC
          </button>
        }
      />
      
      <Card>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-navy-800 dark:text-white">Códigos Guardados ({mccs.length})</h3>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
              <input
                type="text"
                placeholder="Buscar por código o concepto..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-navy-300 dark:border-white/10 rounded-lg bg-navy-50 dark:bg-navy-900 text-navy-800 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-navy-800 focus:ring-2 focus:ring-navy-600/50 text-sm"
              />
            </div>
          </div>

          <div className="grid gap-3 max-h-[500px] overflow-y-auto pr-2">
            {mccs
              .filter(m => m.code.includes(searchQuery) || m.description.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((mcc, idx) => (
              <div key={mcc.code + idx} className="flex items-center justify-between p-4 rounded-lg border border-navy-200 dark:border-white/10 hover:border-navy-300 dark:hover:border-white/20 hover:shadow-sm transition-all bg-white dark:bg-navy-800/50">
                <div className="flex flex-col">
                  <span className="font-mono font-bold text-navy-600 dark:text-navy-300 text-lg">{mcc.code}</span>
                  <span className="text-sm font-medium text-navy-700 dark:text-navy-100 mt-1">{mcc.description}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                  mcc.base_risk_score >= 75 ? 'bg-red-100 text-red-700 border border-red-200' :
                  mcc.base_risk_score >= 50 ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                  mcc.base_risk_score >= 25 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                  'bg-green-100 text-green-700 border border-green-200'
                }`}>
                  Riesgo: {mcc.base_risk_score}
                </span>
              </div>
            ))}
            {mccs.length === 0 && (
              <div className="text-center py-10 text-navy-400">
                Aún no hay códigos MCC guardados. Haz clic en "Añadir MCC".
              </div>
            )}
          </div>
        </div>
      </Card>

      <MccCenteredForm 
        isOpen={showForm} 
        onClose={() => setShowForm(false)} 
        onSubmit={handleSaveMcc} 
      />
    </div>
  );
}
