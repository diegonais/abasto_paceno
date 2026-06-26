import { useEffect, useMemo } from 'react';
import { CircleMarker, MapContainer, TileLayer, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';

import '../../styles/landing-preview.css';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../../config/constants';
import { formatCurrency } from '../../utils/format';
import {
  getMerchantName,
  getOfferCoordinates,
  getOfferTypeKey,
  getProductName,
  getTypeMeta,
} from './mapUtils';
import { useOffersMap } from './useOffersMap';

const insightCards = [
  {
    value: 'Mapa vivo',
    label: 'ofertas cercanas por zona',
  },
  {
    value: 'Sin pagos',
    label: 'solo consulta y contacto directo',
  },
  {
    value: '3 roles',
    label: 'visitantes, comerciantes y admin',
  },
];

const infoCards = [
  {
    icon: 'clipboard',
    title: 'Que resuelve',
    description:
      'Centraliza ofertas activas de productos esenciales para que la ciudadania encuentre puntos de venta cercanos y tome mejores decisiones de compra.',
  },
  {
    icon: 'store',
    title: 'Para comerciantes',
    description:
      'Permite publicar ubicacion, precio, cantidad aproximada y horarios sin convertir el sistema en tienda, delivery o pasarela de pago.',
  },
  {
    icon: 'shield',
    title: 'Gestion confiable',
    description:
      'El panel administrativo mantiene ordenados usuarios, categorias, productos y publicaciones visibles en el mapa publico.',
  },
];

const fallbackPreviewOffers = [
  {
    id: 'preview-huevo',
    productName: 'Huevo criollo',
    businessName: 'Caserita Lucia',
    categoryName: 'huevos',
    price: 29,
    latitude: -16.5022,
    longitude: -68.1215,
    createdAt: '2026-06-26T10:00:00.000Z',
  },
  {
    id: 'preview-leche',
    productName: 'Leche',
    businessName: 'Caserita Lucia',
    categoryName: 'lacteos',
    price: 6.5,
    latitude: -16.5004,
    longitude: -68.1239,
    createdAt: '2026-06-26T09:00:00.000Z',
  },
  {
    id: 'preview-tomate',
    productName: 'Tomate',
    businessName: 'Distribuidora Cardenas',
    categoryName: 'verduras',
    price: 5,
    latitude: -16.5065,
    longitude: -68.1292,
    createdAt: '2026-06-26T08:00:00.000Z',
  },
];

function getOfferTimestamp(offer) {
  return new Date(offer.createdAt ?? offer.availableFrom ?? 0).getTime();
}

function getOfferMapPath(offer) {
  const offerId = String(offer?.id ?? '');

  if (!offerId || offerId.startsWith('preview-')) {
    return '/map';
  }

  return `/map?offer=${encodeURIComponent(offerId)}`;
}

function MiniMapViewport({ offers }) {
  const map = useMap();
  const boundsKey = useMemo(
    () => offers.map((offer) => offer.id ?? getProductName(offer)).join('|'),
    [offers],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => map.invalidateSize(false), 120);

    return () => window.clearTimeout(timeoutId);
  }, [map]);

  useEffect(() => {
    const coordinates = offers
      .map((offer) => getOfferCoordinates(offer))
      .filter(Boolean)
      .map((coordinate) => [coordinate.lat, coordinate.lng]);

    if (coordinates.length > 1) {
      map.fitBounds(coordinates, {
        animate: false,
        maxZoom: 14,
        padding: [42, 74],
      });
      return;
    }

    if (coordinates.length === 1) {
      map.setView(coordinates[0], 14, { animate: false });
      return;
    }

    map.setView(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, { animate: false });
  }, [boundsKey, map, offers]);

  return null;
}

function MiniLatestMap({ offers }) {
  return (
    <MapContainer
      attributionControl={false}
      boxZoom={false}
      center={DEFAULT_MAP_CENTER}
      className="miniMapCanvas"
      doubleClickZoom={false}
      dragging={false}
      keyboard={false}
      scrollWheelZoom={false}
      tap={false}
      touchZoom={false}
      zoom={DEFAULT_MAP_ZOOM}
      zoomControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MiniMapViewport offers={offers} />
      {offers.map((offer) => {
        const coordinates = getOfferCoordinates(offer);

        if (!coordinates) return null;

        const type = getTypeMeta(getOfferTypeKey(offer));

        return (
          <CircleMarker
            center={[coordinates.lat, coordinates.lng]}
            key={offer.id ?? getProductName(offer)}
            pathOptions={{
              color: '#fffaf3',
              fillColor: type.color,
              fillOpacity: 0.96,
              opacity: 1,
              weight: 3,
            }}
            radius={8}
          />
        );
      })}
    </MapContainer>
  );
}

function LandingIcon({ name }) {
  const icons = {
    clipboard: (
      <path
        d="M9 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2m2 0a2 2 0 0 0 4 0m-4 0a2 2 0 0 1 4 0M8 10h4m-4 4h6m-6 4h6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    ),
    store: (
      <path
        d="M4 9l1.5-4h13L20 9m-16 0v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9M4 9a2.5 2.5 0 0 0 5 0m0 0a2.5 2.5 0 0 0 5 0m0 0a2.5 2.5 0 0 0 5 0M9 19v-5h6v5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    ),
    shield: (
      <path
        d="M12 3l7 3v5c0 4.5-3 8.5-7 10c-4-1.5-7-5.5-7-10V6l7-3Zm0 5.5l1.2 2.4l2.6.4l-1.9 1.8l.5 2.6l-2.4-1.3l-2.4 1.3l.5-2.6l-1.9-1.8l2.6-.4Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {icons[name]}
    </svg>
  );
}

export function PublicHomePage() {
  const { offers, loading } = useOffersMap();
  const latestOffers = useMemo(
    () =>
      [...(offers.length ? offers : fallbackPreviewOffers)]
        .sort((first, second) => getOfferTimestamp(second) - getOfferTimestamp(first))
        .slice(0, 3),
    [offers],
  );

  return (
    <section className="landingPage">
      <div className="landingMapTexture" aria-hidden="true" />
      <div className="bg-blobs" aria-hidden="true">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>
      <div className="pageShell">
        <section className="heroSection">
          <div className="heroGrid">
            <div className="heroContent">
              <img
                className="heroLogo"
                src="/abasto-boliviano.png"
                alt="Abasto Boliviano"
              />

              <h1 className="heroTitle">
                Encuentra ofertas esenciales cerca de ti.
              </h1>

              <p className="heroDescription">
                Una plataforma para consultar disponibilidad aproximada, precios y
                puntos de venta en un mapa claro, sin pagos ni intermediarios.
              </p>

              <div className="heroActions">
                <Link className="primaryButton" to="/map">
                  Ver mapa
                </Link>
                <Link className="secondaryButton" to="/register">
                  Publicar oferta
                </Link>
              </div>

              <div className="landingInsights" aria-label="Resumen de Abasto Boliviano">
                {insightCards.map((card) => (
                  <div className="landingInsight" key={card.value}>
                    <strong>{card.value}</strong>
                    <span>{card.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <aside className="landingVisual" aria-label="Vista previa de ofertas">
              <div className="mapPreview">
                <div className="mapPreviewHeader">
                  <span>La Paz</span>
                  <strong>{loading ? 'Actualizando...' : 'Lo mas reciente'}</strong>
                </div>

                <MiniLatestMap offers={latestOffers} />

                <div className="offerStack">
                  {latestOffers.map((offer) => (
                    <Link
                      aria-label={`Ver ${getProductName(offer)} en el mapa`}
                      className="previewOffer"
                      key={offer.id ?? getProductName(offer)}
                      to={getOfferMapPath(offer)}
                    >
                      <div>
                        <strong>{getProductName(offer)}</strong>
                        <span>{getMerchantName(offer)}</span>
                      </div>
                      <b>{offer.price ? formatCurrency(offer.price) : 'Nuevo'}</b>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="infoPanel">
                {infoCards.map((card) => (
                  <article className="infoCard infoCardLarge" key={card.title}>
                    <div className="infoIcon">
                      <LandingIcon name={card.icon} />
                    </div>

                    <div className="infoCardBody">
                      <h3>{card.title}</h3>
                      <p>{card.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </aside>
          </div>
        </section>
      </div>
    </section>
  );
}
