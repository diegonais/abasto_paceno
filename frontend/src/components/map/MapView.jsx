import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import {
  Circle,
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  Polyline,
  TileLayer,
  ZoomControl,
  useMap,
  useMapEvents,
} from 'react-leaflet';

import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../../config/constants';
import {
  getOfferCoordinates,
  getOfferTypeKey,
  getTypeMeta,
} from '../../features/public/mapUtils';
import { OfferMarkerPopup } from './OfferMarkerPopup';

const MARKER_SVG = {
  verduras:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 14c7.2 0 11-4.4 12-9 1.5 7-2.4 13-9.2 13H6v-4Z"/><path d="M6 18c3.5-3 6.8-5 12-6"/></svg>',
  frutas:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 9c-2.2 1.4-3 4.3-1.7 6.7 1 1.9 2.7 3.3 4.6 3.3.8 0 1.4-.3 2.1-.3.7 0 1.2.3 2 .3 1.9 0 3.6-1.4 4.6-3.3 1.3-2.4.5-5.3-1.7-6.7-1.8-1.1-3.3-.4-4.9-.4-1.7 0-3.2-.7-5 .4Z"/><path d="M13 8c.4-2.4 1.9-3.7 4.3-4"/></svg>',
  lacteos:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4h6l-1 4v11a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V8l1-4Z"/><path d="M8 11h6"/></svg>',
  carnicos:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.5 5.5c2.3 2.3 2.2 6.1-.2 8.5-2.2 2.2-5.5 2.5-8 1L5 18.3 3.7 17 7 13.7c-1.4-2.5-1.1-5.8 1-8 2.4-2.4 6.2-2.5 8.5-.2Z"/><path d="M14 8h.1"/></svg>',
  panaderia:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 14c0-4.4 3.6-8 8-8s8 3.6 8 8v2.5A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5V14Z"/><path d="M8 9c1.2 1 1.9 2.3 2 4"/><path d="M13 8c.9 1.2 1.3 2.6 1.1 4"/></svg>',
  abarrotes:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/><path d="M9 13h6"/></svg>',
  bebidas:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h10l-1.1 14a2 2 0 0 1-2 1.8h-3.8a2 2 0 0 1-2-1.8L7 5Z"/><path d="M8 10h8"/><path d="M10 3h4"/></svg>',
  huevos:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4c4 0 7 5.5 7 10a7 7 0 0 1-14 0c0-4.5 3-10 7-10Z"/></svg>',
  otros:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 10.5 12 5l7 5.5V20H5v-9.5Z"/><path d="M9 20v-6h6v6"/></svg>',
};

const markerIconCache = new Map();

function createOfferIcon(typeKey, isSelected) {
  const type = getTypeMeta(typeKey);
  const cacheKey = `${typeKey}-${type.color}-${isSelected ? 'selected' : 'default'}`;

  if (markerIconCache.has(cacheKey)) {
    return markerIconCache.get(cacheKey);
  }

  const icon = L.divIcon({
    className: `food-marker-shell${isSelected ? ' is-selected' : ''}`,
    html: `
      <span
        class="food-marker food-marker-${type.key}"
        style="--marker-color: ${type.color}; border-color: ${type.color}; background: #fffaf3; color: ${type.color}"
      >
        ${MARKER_SVG[type.key] ?? MARKER_SVG.otros}
      </span>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -24],
  });

  markerIconCache.set(cacheKey, icon);
  return icon;
}

const userLocationIcon = L.divIcon({
  className: 'user-location-marker-shell',
  html: '<span class="user-location-marker"><span class="user-location-wave"></span><span class="user-location-dot"></span></span>',
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

function CoordinatePicker({ onPick }) {
  useMapEvents({
    click(event) {
      onPick?.(event.latlng);
    },
  });

  return null;
}

function MapResizeObserver() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });

    resizeObserver.observe(container);
    map.invalidateSize();

    return () => resizeObserver.disconnect();
  }, [map]);

  return null;
}

function MapViewportController({
  offers,
  boundsKey,
  selectedOffer,
  selectedPoint,
  userLocation,
  locationFocusKey,
  routeCoordinates,
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedOffer) {
      const coordinates = getOfferCoordinates(selectedOffer);
      if (coordinates) {
        map.flyTo([coordinates.lat, coordinates.lng], Math.max(map.getZoom(), 15), {
          duration: 0.7,
        });
      }
      return;
    }

    if (selectedPoint) {
      map.flyTo([Number(selectedPoint.lat), Number(selectedPoint.lng)], 15, {
        duration: 0.7,
      });
      return;
    }
  }, [map, selectedOffer, selectedPoint]);

  useEffect(() => {
    if (userLocation && locationFocusKey) {
      map.flyTo([userLocation.lat, userLocation.lng], Math.max(map.getZoom(), 14), {
        duration: 0.7,
      });
    }
  }, [locationFocusKey, map, userLocation]);

  useEffect(() => {
    if (routeCoordinates?.length > 1) {
      const bounds = L.latLngBounds(routeCoordinates);

      if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.16), {
          animate: true,
          maxZoom: 16,
        });
      }
    }
  }, [map, routeCoordinates]);

  useEffect(() => {
    if (!selectedOffer && !selectedPoint && !userLocation && offers.length > 1) {
      const bounds = L.latLngBounds(
        offers
          .map((offer) => getOfferCoordinates(offer))
          .filter(Boolean)
          .map((coordinates) => [coordinates.lat, coordinates.lng]),
      );

      if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.18), {
          animate: false,
          maxZoom: 14,
        });
      }
    }
  }, [boundsKey, map, offers, selectedOffer, selectedPoint, userLocation]);

  return null;
}

export function MapView({
  offers = [],
  onCoordinatePick,
  onOfferSelect,
  selectedOfferId,
  selectedPoint,
  userLocation,
  locationFocusKey = 0,
  routeCoordinates = [],
  activeRouteOfferId = '',
  routeLoading = false,
  onRouteRequest,
  radiusKm,
  showUserRadius = false,
  height = 420,
}) {
  const markerRefs = useRef(new Map());
  const validOffers = useMemo(
    () => offers.filter((offer) => getOfferCoordinates(offer)),
    [offers],
  );
  const boundsKey = useMemo(
    () => validOffers.map((offer) => offer.id).join('|'),
    [validOffers],
  );
  const selectedOffer = useMemo(
    () => validOffers.find((offer) => offer.id === selectedOfferId),
    [selectedOfferId, validOffers],
  );

  useEffect(() => {
    if (!selectedOfferId) return undefined;

    const timeoutId = window.setTimeout(() => {
      markerRefs.current.get(selectedOfferId)?.openPopup();
    }, 520);

    return () => window.clearTimeout(timeoutId);
  }, [selectedOfferId, validOffers]);

  return (
    <div className="map-wrapper" style={{ height }}>
      <MapContainer
        center={DEFAULT_MAP_CENTER}
        zoom={DEFAULT_MAP_ZOOM}
        zoomControl={false}
        scrollWheelZoom="center"
        wheelPxPerZoomLevel={140}
        wheelDebounceTime={80}
        zoomDelta={0.5}
        zoomSnap={0.5}
        zoomAnimation
        fadeAnimation
        markerZoomAnimation
        inertia
        inertiaDeceleration={3600}
        className="map-canvas"
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapResizeObserver />
        <MapViewportController
          offers={validOffers}
          boundsKey={boundsKey}
          selectedOffer={selectedOffer}
          selectedPoint={selectedPoint}
          userLocation={userLocation}
          locationFocusKey={locationFocusKey}
          routeCoordinates={routeCoordinates}
        />

        {showUserRadius && userLocation ? (
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={(radiusKm ?? 0) * 1000}
            pathOptions={{
              color: '#2563eb',
              fillColor: '#2563eb',
              fillOpacity: 0.08,
              opacity: 0.7,
              weight: 2,
            }}
          />
        ) : null}

        {userLocation ? (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
            <Popup>Tu ubicacion aproximada</Popup>
          </Marker>
        ) : null}

        {routeCoordinates.length > 1 ? (
          <Polyline
            positions={routeCoordinates}
            pathOptions={{
              color: '#7b1835',
              opacity: 0.92,
              weight: 6,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        ) : null}

        {validOffers.map((offer) => {
          const coordinates = getOfferCoordinates(offer);
          const isSelected = offer.id === selectedOfferId;

          return (
            <Marker
              key={offer.id}
              position={[coordinates.lat, coordinates.lng]}
              icon={createOfferIcon(getOfferTypeKey(offer), isSelected)}
              ref={(marker) => {
                if (marker) {
                  markerRefs.current.set(offer.id, marker);
                } else {
                  markerRefs.current.delete(offer.id);
                }
              }}
              eventHandlers={{
                click: () => onOfferSelect?.(offer),
              }}
              zIndexOffset={isSelected ? 500 : 0}
            >
              <Popup className="offer-popup" closeButton={false} minWidth={300} maxWidth={360}>
                <OfferMarkerPopup
                  offer={offer}
                  onRouteRequest={onRouteRequest}
                  routeLoading={routeLoading && activeRouteOfferId === offer.id}
                />
              </Popup>
            </Marker>
          );
        })}

        {selectedPoint ? (
          <CircleMarker
            center={[Number(selectedPoint.lat), Number(selectedPoint.lng)]}
            radius={8}
            pathOptions={{ color: '#0F7D50', fillColor: '#0F7D50', fillOpacity: 0.85 }}
          >
          </CircleMarker>
        ) : null}

        {onCoordinatePick ? <CoordinatePicker onPick={onCoordinatePick} /> : null}
      </MapContainer>
    </div>
  );
}
