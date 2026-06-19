import EvaluationEngine from '../components/fraud/EvaluationEngine';
import PageHeader from '../components/ui/PageHeader';
import { Activity } from 'lucide-react';

export default function EvaluationPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader 
        title="Evaluador de Riesgo" 
        badge="PERFX"
        icon={Activity}
      />
      <EvaluationEngine />
    </div>
  );
}
