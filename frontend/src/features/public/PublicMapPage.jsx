import { PageHeader } from '../../components/ui/PageHeader';
import { PublicMapPanel } from './PublicMapPanel';

export function PublicMapPage() {
  return (
    <section className="public-feature-shell">
      <div className="public-feature-frame stack-xl">
        <div className="public-feature-copy">
          <PageHeader
            title="Mapa publico"
            description="Consulta ofertas activas en una vista alineada con el inicio: clara, amplia y pensada para explorar sin friccion."
          />
        </div>

        <PublicMapPanel variant="immersive" mapHeight="100%" />
      </div>
    </section>
  );
}
