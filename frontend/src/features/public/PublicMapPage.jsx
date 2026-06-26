import { PublicMapPanel } from './PublicMapPanel';

export function PublicMapPage({ initialView = 'map' }) {
  return (
    <section className="public-map-page">
      <PublicMapPanel variant="immersive" mapHeight="100%" initialView={initialView} />
    </section>
  );
}
