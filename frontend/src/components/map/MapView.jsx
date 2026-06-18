import { CircleMarker, MapContainer, Popup, TileLayer, useMapEvents } from 'react-leaflet';

import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../../config/constants';
import { OfferMarkerPopup } from './OfferMarkerPopup';

function CoordinatePicker({ onPick }) {
  useMapEvents({
    click(event) {
      onPick?.(event.latlng);
    },
  });

  return null;
}

export function MapView({
  offers,
  onCoordinatePick,
  selectedPoint,
  height = 420,
}) {
  return (
    <div className="map-wrapper" style={{ height }}>
      <MapContainer center={DEFAULT_MAP_CENTER} zoom={DEFAULT_MAP_ZOOM} scrollWheelZoom className="map-canvas">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {offers.map((offer) => (
          <CircleMarker
            key={offer.id}
            center={[Number(offer.latitude), Number(offer.longitude)]}
            radius={10}
            pathOptions={{ color: '#7B1835', fillColor: '#AA2950', fillOpacity: 0.85 }}
          >
            <Popup>
              <OfferMarkerPopup offer={offer} />
            </Popup>
          </CircleMarker>
        ))}

        {selectedPoint ? (
          <CircleMarker
            center={[Number(selectedPoint.lat), Number(selectedPoint.lng)]}
            radius={8}
            pathOptions={{ color: '#0F7D50', fillColor: '#0F7D50', fillOpacity: 0.85 }}
          />
        ) : null}

        <CoordinatePicker onPick={onCoordinatePick} />
      </MapContainer>
    </div>
  );
}
