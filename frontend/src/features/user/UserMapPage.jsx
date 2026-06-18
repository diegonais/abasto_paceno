import { PageHeader } from '../../components/ui/PageHeader';
import { PublicMapPanel } from '../public/PublicMapPanel';

export function UserMapPage() {
  return (
    <div className="stack-lg">
      <PageHeader
        title="Mapa de ofertas"
        description="Explora el mapa autenticado con la misma visibilidad pública y espacio para futuras acciones personalizadas."
      />
      <PublicMapPanel />
    </div>
  );
}
