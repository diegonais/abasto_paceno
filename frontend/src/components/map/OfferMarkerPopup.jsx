import { useState } from 'react';
import { useMap } from 'react-leaflet';

import {
  getMerchantName,
  getOfferCoordinates,
  getOfferTypeKey,
  getProductName,
  getTypeMeta,
} from '../../features/public/mapUtils';
import { formatCurrency } from '../../utils/format';

export function OfferMarkerPopup({ offer }) {
  const map = useMap();
  const [showDetail, setShowDetail] = useState(false);
  const [shareStatus, setShareStatus] = useState('');
  const coordinates = getOfferCoordinates(offer);
  const productName = getProductName(offer);
  const merchantName = getMerchantName(offer);
  const type = getTypeMeta(getOfferTypeKey(offer));
  const googleMapsUrl = coordinates
    ? `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`
    : '';
  const routeUrl = coordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`
    : '';
  const shareText = `${productName} en ${merchantName}${
    offer.price ? ` - ${formatCurrency(offer.price)}` : ''
  }${googleMapsUrl ? ` ${googleMapsUrl}` : ''}`;

  async function handleShare() {
    setShareStatus('');

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${productName} - Abasto Boliviano`,
          text: shareText,
          url: googleMapsUrl || window.location.href,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        setShareStatus('Copiado');
      }
    } catch {
      setShareStatus('No se pudo compartir');
    }
  }

  return (
    <article className="marker-popup-card">
      <header className="marker-popup-header">
        <span
          className="marker-popup-type"
          style={{ '--popup-type-color': type.color }}
        >
          {type.label}
        </span>
        <button type="button" onClick={() => map.closePopup()}>
          Cerrar
        </button>
      </header>

      <div className="marker-popup-body">
        <h3>{merchantName}</h3>
        <p className="marker-popup-location">
          {offer.locationDescription ?? 'Ubicacion publicada por el comerciante'}
        </p>
        <p className="marker-popup-product">{productName}</p>

        <div className="marker-popup-meta">
          <span>Tienda fisica</span>
          {offer.price ? <strong>{formatCurrency(offer.price)}</strong> : null}
        </div>
      </div>

      <div className="marker-popup-actions">
        <a className="marker-popup-primary" href={routeUrl} target="_blank" rel="noreferrer">
          Ruta aqui
        </a>
        <a href={googleMapsUrl} target="_blank" rel="noreferrer">
          Google Maps
        </a>
        <button type="button" onClick={handleShare}>
          {shareStatus || 'Compartir'}
        </button>
        <button type="button" onClick={() => setShowDetail((current) => !current)}>
          Detalle
        </button>
      </div>

      {showDetail ? (
        <dl className="marker-popup-detail">
          <div>
            <dt>Venta</dt>
            <dd>{offer.saleType ?? 'No indicada'}</dd>
          </div>
          <div>
            <dt>Cantidad</dt>
            <dd>{offer.approximateQuantity ?? 'No indicada'}</dd>
          </div>
        </dl>
      ) : null}
    </article>
  );
}
