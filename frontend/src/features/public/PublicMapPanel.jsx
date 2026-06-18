import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { LoadingState } from '../../components/ui/LoadingState';
import { MapView } from '../../components/map/MapView';
import { formatCurrency } from '../../utils/format';
import { useOffersMap } from './useOffersMap';

export function PublicMapPanel({ variant = 'default', mapHeight = 420 }) {
  const { offers, loading, error } = useOffersMap();

  return (
    <section className={`map-panel map-panel-${variant}`}>
      <div className={`stack-md map-panel-column map-panel-column-${variant}`}>
        <h2>Ofertas activas</h2>
        <p className="muted">Visualiza comerciantes que están ofertando ahora mismo.</p>
        <ErrorMessage message={error} />
        <Card className={`offers-list offers-list-${variant}`}>
          {loading ? (
            <LoadingState />
          ) : offers.length ? (
            offers.map((offer) => (
              <article className="offer-item" key={offer.id}>
                <div>
                  <strong>{offer.product?.productName ?? offer.productName}</strong>
                  <p>
                    {offer.merchantProfile?.businessName ??
                      offer.businessName ??
                      offer.merchantProfile?.ownerFullName ??
                      offer.ownerFullName}
                  </p>
                </div>
                <div>
                  <span>{offer.saleType}</span>
                  <strong>{offer.price ? formatCurrency(offer.price) : 'Precio no indicado'}</strong>
                </div>
              </article>
            ))
          ) : (
            <EmptyState title="Sin ofertas activas" description="Cuando haya publicaciones disponibles aparecerán aquí." />
          )}
        </Card>
      </div>

      <Card className={`map-card map-card-${variant}`}>
        {loading ? <LoadingState /> : <MapView offers={offers} height={mapHeight} />}
      </Card>
    </section>
  );
}
