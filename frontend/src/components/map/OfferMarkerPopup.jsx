import { formatCurrency } from '../../utils/format';

export function OfferMarkerPopup({ offer }) {
  return (
    <div className="marker-popup">
      <strong>{offer.product?.productName ?? 'Producto'}</strong>
      <p>{offer.merchantProfile?.businessName ?? offer.merchantProfile?.ownerFullName ?? 'Comerciante'}</p>
      <p>Venta: {offer.saleType}</p>
      {offer.approximateQuantity ? <p>Cantidad: {offer.approximateQuantity}</p> : null}
      {offer.price ? <p>Precio: {formatCurrency(offer.price)}</p> : null}
      {offer.locationDescription ? <p>{offer.locationDescription}</p> : null}
    </div>
  );
}
