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

          <div className="public-feature-card-grid">
            <article className="public-feature-card">
              <strong>Exploracion inmediata</strong>
              <p>Revisa comerciantes, productos y precios desde una sola pantalla antes de iniciar sesion.</p>
            </article>

            <article className="public-feature-card">
              <strong>Lectura mas limpia</strong>
              <p>La columna de ofertas y el mapa ahora viven dentro del mismo lenguaje visual de la portada.</p>
            </article>
          </div>
        </div>

        <PublicMapPanel variant="immersive" mapHeight="100%" />
      </div>
    </section>
  );
}
