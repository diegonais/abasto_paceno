import { PageHeader } from '../../components/ui/PageHeader';
import { PublicMapPanel } from '../public/PublicMapPanel';

export function MerchantDashboardPage() {
  return (
    <div className="stack-lg">
      <PageHeader
        title="Panel del comerciante"
        description="Consulta el mapa y manten visible la actividad de tus ofertas."
      />

      <PublicMapPanel variant="immersive" mapHeight="100%" />
    </div>
  );
}
