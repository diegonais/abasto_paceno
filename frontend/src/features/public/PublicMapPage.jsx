import { PageHeader } from '../../components/ui/PageHeader';
import { PublicMapPanel } from './PublicMapPanel';

export function PublicMapPage() {
  return (
    <div className="stack-lg">
      <PageHeader
        title="Mapa público"
        description="Consulta las ofertas activas sin necesidad de iniciar sesión."
      />
      <PublicMapPanel />
    </div>
  );
}
