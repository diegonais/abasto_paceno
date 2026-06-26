import { PublicMapPanel } from '../public/PublicMapPanel';

export function UserMapPage() {
  return (
    <div className="map-page-full">
      <PublicMapPanel variant="immersive" mapHeight="100%" />
    </div>
  );
}
