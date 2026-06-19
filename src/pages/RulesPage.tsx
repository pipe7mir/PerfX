import Card from '../components/ui/GlassCard';
import RulesPanel from '../components/fraud/RulesPanel';
import PageHeader from '../components/ui/PageHeader';
import { Sliders } from 'lucide-react';

export default function RulesPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader 
        title="Panel de Reglas" 
        badge="Configuración"
        icon={Sliders}
      />
      <Card>
        <RulesPanel />
      </Card>
    </div>
  );
}
