import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { LoadingState } from '../../components/ui/LoadingState';
import { MapView } from '../../components/map/MapView';
import { semanticSearchService } from '../../services/semanticSearchService';
import { formatCurrency } from '../../utils/format';
import {
  FOOD_TYPES,
  RADIUS_OPTIONS,
  buildMerchantGroups,
  distanceInKm,
  formatDistance,
  getMerchantName,
  getOfferCoordinates,
  getOfferTypeKey,
  getProductName,
  getTypeMeta,
  normalizeText,
} from './mapUtils';
import { useOffersMap } from './useOffersMap';

function TypeGlyph({ typeKey }) {
  return <span className={`map-type-glyph map-type-glyph-${typeKey}`} aria-hidden="true" />;
}

function matchesSearch(offer, searchTerm) {
  if (!searchTerm) return true;

  const searchable = [
    getProductName(offer),
    getMerchantName(offer),
    offer.ownerFullName,
    offer.locationDescription,
    offer.categoryName,
  ]
    .map(normalizeText)
    .join(' ');

  return searchable.includes(searchTerm);
}

function getFilteredOffers(offers, filters) {
  return offers.filter((offer) => {
    const coordinates = getOfferCoordinates(offer);
    const typeKey = getOfferTypeKey(offer);
    const matchesType = filters.typeKey === 'all' || typeKey === filters.typeKey;
    const matchesText = matchesSearch(offer, filters.searchTerm);
    const distanceKm = coordinates ? distanceInKm(filters.userLocation, coordinates) : null;
    const matchesRadius =
      !filters.nearbyEnabled || (distanceKm !== null && distanceKm <= filters.radiusKm);

    return matchesType && matchesText && matchesRadius;
  });
}

function OfferPrice({ offer }) {
  return (
    <span className="map-price">{offer.price ? formatCurrency(offer.price) : 'Sin precio'}</span>
  );
}

function formatRouteDistance(distanceKm) {
  if (!Number.isFinite(distanceKm)) return '';
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(distanceKm >= 10 ? 0 : 1)} km`;
}

function formatRouteDuration(durationMinutes) {
  if (!Number.isFinite(durationMinutes)) return '';
  if (durationMinutes < 1) return '< 1 min';
  if (durationMinutes < 60) return `${Math.round(durationMinutes)} min`;

  const hours = Math.floor(durationMinutes / 60);
  const minutes = Math.round(durationMinutes % 60);
  return minutes ? `${hours} h ${minutes} min` : `${hours} h`;
}

function requestBrowserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('La geolocalizacion no esta disponible en este navegador.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        reject(new Error('No pudimos obtener tu ubicacion. Revisa el permiso del navegador.'));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60000,
        timeout: 10000,
      },
    );
  });
}

async function fetchRouteInMap(origin, destination) {
  const coordinates = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const response = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=false`,
  );

  if (!response.ok) {
    throw new Error('No se pudo calcular la ruta.');
  }

  const data = await response.json();
  const route = data.routes?.[0];

  if (!route?.geometry?.coordinates?.length) {
    throw new Error('No se encontro una ruta disponible.');
  }

  return {
    coordinates: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    distanceKm: route.distance / 1000,
    durationMinutes: route.duration / 60,
  };
}

function OfferList({ offers, selectedOfferId, onFocusOffer }) {
  if (!offers.length) {
    return (
      <EmptyState
        title="Sin ofertas en esta busqueda"
        description="Ajusta filtros o cambia el radio de ubicacion."
      />
    );
  }

  return (
    <div className="map-offer-list" aria-label="Ofertas activas">
      {offers.map((offer) => {
        const type = getTypeMeta(getOfferTypeKey(offer));
        const isSelected = selectedOfferId === offer.id;

        return (
          <button
            className={`map-offer-card${isSelected ? ' is-selected' : ''}`}
            type="button"
            key={offer.id}
            onClick={() => onFocusOffer(offer)}
          >
            <span
              className="map-offer-icon"
              style={{ '--offer-color': type.color }}
              aria-hidden="true"
            >
              <TypeGlyph typeKey={type.key} />
            </span>
            <span className="map-offer-copy">
              <strong>{getProductName(offer)}</strong>
              <span>{getMerchantName(offer)}</span>
              {offer.distanceKm !== null && offer.distanceKm !== undefined ? (
                <small>{formatDistance(offer.distanceKm)} de ti</small>
              ) : null}
            </span>
            <OfferPrice offer={offer} />
          </button>
        );
      })}
    </div>
  );
}

function MerchantList({
  merchants,
  expandedMerchantId,
  selectedOfferId,
  onToggleMerchant,
  onFocusOffer,
}) {
  if (!merchants.length) {
    return (
      <EmptyState
        title="Sin comercios visibles"
        description="Prueba con otra categoria, producto o radio."
      />
    );
  }

  return (
    <div className="merchant-list" aria-label="Comercios disponibles">
      {merchants.map((merchant) => {
        const isExpanded = expandedMerchantId === merchant.id;

        return (
          <article className={`merchant-card${isExpanded ? ' is-expanded' : ''}`} key={merchant.id}>
            <button
              className="merchant-card-head"
              type="button"
              aria-expanded={isExpanded}
              onClick={() => onToggleMerchant(merchant.id)}
            >
              <span>
                <strong>{merchant.name}</strong>
                <small>
                  {merchant.offers.length} productos
                  {merchant.distanceKm !== null && merchant.distanceKm !== undefined
                    ? ` · ${formatDistance(merchant.distanceKm)}`
                    : ''}
                </small>
              </span>
              <span className="merchant-card-toggle" aria-hidden="true">
                {isExpanded ? '-' : '+'}
              </span>
            </button>

            {isExpanded ? (
              <div className="merchant-products">
                {merchant.offers.map((offer) => {
                  const type = getTypeMeta(getOfferTypeKey(offer));

                  return (
                    <button
                      className={`merchant-product-row${
                        selectedOfferId === offer.id ? ' is-selected' : ''
                      }`}
                      type="button"
                      key={offer.id}
                      onClick={() => onFocusOffer(offer)}
                    >
                      <span
                        className="merchant-product-icon"
                        style={{ '--offer-color': type.color }}
                        aria-hidden="true"
                      >
                        <TypeGlyph typeKey={type.key} />
                      </span>
                      <span>
                        <strong>{getProductName(offer)}</strong>
                        <small>{offer.saleType ?? 'Venta directa'}</small>
                      </span>
                      <OfferPrice offer={offer} />
                    </button>
                  );
                })}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

export function PublicMapPanel({ variant = 'default', mapHeight = '100%', initialView = 'map' }) {
  const { offers, loading, error } = useOffersMap();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const offerIdFromQuery = searchParams.get('offer') ?? '';
  const activeView = offerIdFromQuery ? 'map' : initialView;
  const [searchTerm, setSearchTerm] = useState('');
  const [semanticOffers, setSemanticOffers] = useState(null);
  const [semanticStatus, setSemanticStatus] = useState('');
  const [semanticLoading, setSemanticLoading] = useState(false);
  const [semanticError, setSemanticError] = useState('');
  const [typeKey, setTypeKey] = useState('all');
  const [manualSelectedOfferId, setManualSelectedOfferId] = useState('');
  const [expandedMerchantId, setExpandedMerchantId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyEnabled, setNearbyEnabled] = useState(false);
  const [radiusKm, setRadiusKm] = useState(3);
  const [geoStatus, setGeoStatus] = useState('');
  const [locationFocusKey, setLocationFocusKey] = useState(0);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState('');
  const selectedOfferId = offerIdFromQuery || manualSelectedOfferId;
  const baseOffers = semanticOffers ?? offers;

  const typeCounts = useMemo(() => {
    const counts = FOOD_TYPES.reduce((lookup, type) => {
      lookup[type.key] = type.key === 'all' ? baseOffers.length : 0;
      return lookup;
    }, {});

    baseOffers.forEach((offer) => {
      const offerType = getOfferTypeKey(offer);
      counts[offerType] = (counts[offerType] ?? 0) + 1;
    });

    return counts;
  }, [baseOffers]);

  const normalizedSearchTerm = useMemo(
    () => (semanticOffers ? '' : normalizeText(searchTerm)),
    [searchTerm, semanticOffers],
  );

  const filteredOffers = useMemo(
    () =>
      getFilteredOffers(baseOffers, {
        nearbyEnabled,
        radiusKm,
        searchTerm: normalizedSearchTerm,
        typeKey,
        userLocation,
      }).map((offer) => {
        const coordinates = getOfferCoordinates(offer);
        const distanceKm = coordinates ? distanceInKm(userLocation, coordinates) : null;
        return { ...offer, distanceKm };
      }),
    [baseOffers, nearbyEnabled, normalizedSearchTerm, radiusKm, typeKey, userLocation],
  );

  const merchants = useMemo(
    () => buildMerchantGroups(filteredOffers, userLocation),
    [filteredOffers, userLocation],
  );

  const visibleExpandedMerchantId = expandedMerchantId ?? merchants[0]?.id ?? '';

  function handleViewChange(nextView) {
    navigate(nextView === 'merchants' ? '/comercios' : '/map');
  }

  function handleOfferFocus(offer) {
    setSearchTerm('');
    setSemanticOffers(null);
    setSemanticStatus('');
    setSemanticError('');
    setTypeKey('all');
    setNearbyEnabled(false);
    setManualSelectedOfferId(offer.id);
    navigate(`/map?offer=${offer.id}`);
  }

  function handleOfferSelect(offer) {
    setManualSelectedOfferId(offer.id);
    navigate(`/map?offer=${offer.id}`, {
      replace: routerLocation.pathname === '/map',
    });
  }

  async function handleSemanticSearch(event) {
    event.preventDefault();
    const query = searchTerm.trim();

    if (query.length < 2) {
      setSemanticError('Escribe al menos 2 caracteres para buscar.');
      return;
    }

    setSemanticLoading(true);
    setSemanticError('');

    try {
      const result = await semanticSearchService.search(query);
      const nextOffers = Array.isArray(result.offers) ? result.offers : [];
      const products = Array.isArray(result.products) ? result.products : [];

      setSemanticOffers(nextOffers);
      setTypeKey('all');
      setManualSelectedOfferId('');
      setRouteInfo(null);
      setRouteError('');
      setSemanticStatus(
        products.length
          ? `${nextOffers.length} ofertas para: ${products.join(', ')}`
          : result.message || 'No encontramos productos relacionados en el catalogo.',
      );
      navigate('/map');
    } catch (requestError) {
      setSemanticError(requestError.message);
    } finally {
      setSemanticLoading(false);
    }
  }

  function clearSemanticSearch() {
    setSearchTerm('');
    setSemanticOffers(null);
    setSemanticStatus('');
    setSemanticError('');
  }

  async function handleNearby() {
    setGeoStatus('Solicitando ubicacion...');

    try {
      const location = await requestBrowserLocation();

      setManualSelectedOfferId('');
      setUserLocation(location);
      setNearbyEnabled(true);
      setRouteInfo(null);
      setRouteError('');
      setLocationFocusKey((currentKey) => currentKey + 1);
      setGeoStatus(`Mostrando comercios en un radio de ${radiusKm} km.`);
      navigate('/map');
    } catch (requestError) {
      setGeoStatus(requestError.message);
    }
  }

  async function handleRouteRequest(offer) {
    const destination = getOfferCoordinates(offer);

    if (!destination) {
      setRouteError('Esta oferta no tiene coordenadas para calcular ruta.');
      return;
    }

    setRouteLoading(true);
    setRouteError('');
    setGeoStatus(userLocation ? '' : 'Solicitando ubicacion para calcular ruta...');

    try {
      const origin = userLocation ?? (await requestBrowserLocation());
      const route = await fetchRouteInMap(origin, destination);

      setUserLocation(origin);
      setManualSelectedOfferId(offer.id);
      setNearbyEnabled(false);
      setLocationFocusKey((currentKey) => currentKey + 1);
      setRouteInfo({
        ...route,
        offerId: offer.id,
        destinationName: getMerchantName(offer),
        productName: getProductName(offer),
      });
      setGeoStatus('');
      navigate(`/map?offer=${offer.id}`, {
        replace: routerLocation.pathname === '/map',
      });
    } catch (routeRequestError) {
      setRouteError(routeRequestError.message);
    } finally {
      setRouteLoading(false);
    }
  }

  function handleRadiusChange(nextRadius) {
    setRadiusKm(nextRadius);

    if (userLocation) {
      setNearbyEnabled(true);
      setLocationFocusKey((currentKey) => currentKey + 1);
      setGeoStatus(`Mostrando comercios en un radio de ${nextRadius} km.`);
    }
  }

  function clearNearby() {
    setNearbyEnabled(false);
    setGeoStatus('');
  }

  function clearRoute() {
    setRouteInfo(null);
    setRouteError('');
  }

  const visibleOfferCount = filteredOffers.length;
  const visibleMerchantCount = merchants.length;

  return (
    <section className={`map-panel map-panel-${variant} public-map-experience`}>
      <div className="map-stage" aria-label="Mapa de comercios">
        {loading ? (
          <LoadingState />
        ) : (
          <MapView
            offers={filteredOffers}
            height={mapHeight}
            onOfferSelect={handleOfferSelect}
            selectedOfferId={selectedOfferId}
            userLocation={userLocation}
            locationFocusKey={locationFocusKey}
            routeCoordinates={routeInfo?.coordinates ?? []}
            activeRouteOfferId={routeInfo?.offerId ?? ''}
            routeLoading={routeLoading}
            onRouteRequest={handleRouteRequest}
            radiusKm={radiusKm}
            showUserRadius={nearbyEnabled}
          />
        )}

        <div className="map-floating-actions">
          <button className="nearby-action" type="button" onClick={handleNearby}>
            Cerca de mi
          </button>
          <div className="radius-card" role="radiogroup" aria-label="Radio de busqueda">
            {RADIUS_OPTIONS.map((option) => (
              <label
                className={`radius-option${radiusKm === option ? ' is-active' : ''}`}
                key={option}
              >
                <input
                  type="radio"
                  name="radius"
                  checked={radiusKm === option}
                  onChange={() => handleRadiusChange(option)}
                />
                <span>{option} km</span>
              </label>
            ))}
          </div>
        </div>

        <div className="map-status-bar">
          <span>{visibleMerchantCount} comercios</span>
          <span>{visibleOfferCount} ofertas activas</span>
          {nearbyEnabled && userLocation ? <span>Radio {radiusKm} km</span> : null}
        </div>

        {routeInfo ? (
          <div className="route-summary-card">
            <div>
              <span>Ruta calculada</span>
              <strong>{routeInfo.destinationName}</strong>
              <small>{routeInfo.productName}</small>
            </div>
            <div className="route-summary-metrics">
              <b>{formatRouteDistance(routeInfo.distanceKm)}</b>
              <b>{formatRouteDuration(routeInfo.durationMinutes)}</b>
            </div>
            <button type="button" onClick={clearRoute} aria-label="Cerrar ruta">
              Cerrar
            </button>
          </div>
        ) : null}

        {routeError ? (
          <div className="route-summary-card route-summary-card-error">
            <div>
              <span>Ruta</span>
              <strong>{routeError}</strong>
            </div>
            <button
              type="button"
              onClick={() => setRouteError('')}
              aria-label="Cerrar error de ruta"
            >
              Cerrar
            </button>
          </div>
        ) : null}

        <div className="map-legend" aria-label="Tipos de productos">
          {FOOD_TYPES.filter((type) => type.key !== 'all' && (typeCounts[type.key] ?? 0) > 0)
            .slice(0, 5)
            .map((type) => (
              <span key={type.key}>
                <i style={{ '--legend-color': type.color }} aria-hidden="true" />
                {type.shortLabel}
              </span>
            ))}
        </div>
      </div>

      <aside className="map-explorer-panel">
        <div className="map-explorer-scroll">
          <div className="map-hero-copy">
            <p className="map-eyebrow">
              {activeView === 'merchants' ? 'Comercios' : 'Mapa publico'}
            </p>
            <h1>
              {activeView === 'merchants'
                ? 'Vendedores y precios disponibles'
                : 'Encuentra abasto cerca de ti'}
            </h1>
            <p>
              Filtra por producto, revisa comercios cercanos y abre cada oferta directamente en el
              mapa.
            </p>
          </div>

          <div className="map-view-switch" role="tablist" aria-label="Vista publica">
            <button
              className={activeView === 'map' ? 'is-active' : ''}
              type="button"
              onClick={() => handleViewChange('map')}
            >
              Mapa
            </button>
            <button
              className={activeView === 'merchants' ? 'is-active' : ''}
              type="button"
              onClick={() => handleViewChange('merchants')}
            >
              Comercios
            </button>
          </div>

          <form className="map-search-form" onSubmit={handleSemanticSearch}>
            <div className="map-search-head">
              <div>
                <strong>Busqueda inteligente</strong>
                <small>Describe lo que quieres preparar y filtramos el mapa.</small>
              </div>
            </div>
            <label className="map-search-field">
              <span>Que estas buscando?</span>
              <input
                value={searchTerm}
                placeholder="Ej. quiero hacer parrillada"
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>
            <div className="map-search-actions">
              <button className="nearby-inline-action" type="submit" disabled={semanticLoading}>
                {semanticLoading ? 'Buscando...' : 'Buscar'}
              </button>
              {semanticOffers ? (
                <button className="nearby-clear-action" type="button" onClick={clearSemanticSearch}>
                  Ver todos
                </button>
              ) : null}
            </div>
            {semanticStatus ? <p className="semantic-search-status">{semanticStatus}</p> : null}
            {semanticError ? <p className="semantic-search-error">{semanticError}</p> : null}
          </form>

          {activeView === 'merchants' ? (
            <div className="merchant-priority-results">
              <ErrorMessage message={error} />

              <div className="map-results-head">
                <strong>Comercios</strong>
                <span>{visibleMerchantCount} visibles</span>
              </div>

              {loading ? (
                <LoadingState />
              ) : (
                <MerchantList
                  merchants={merchants}
                  expandedMerchantId={visibleExpandedMerchantId}
                  selectedOfferId={selectedOfferId}
                  onToggleMerchant={(merchantId) =>
                    setExpandedMerchantId(() =>
                      visibleExpandedMerchantId === merchantId ? '' : merchantId,
                    )
                  }
                  onFocusOffer={handleOfferFocus}
                />
              )}
            </div>
          ) : null}

          <div className="map-section-label">Categorias</div>
          <div className="map-type-grid">
            {FOOD_TYPES.map((type) => (
              <button
                className={`map-type-button${typeKey === type.key ? ' is-active' : ''}`}
                type="button"
                key={type.key}
                onClick={() => setTypeKey(type.key)}
              >
                <span
                  className="map-type-icon"
                  style={{ '--type-color': type.color }}
                  aria-hidden="true"
                >
                  <TypeGlyph typeKey={type.key} />
                </span>
                <span>
                  <strong>{type.label}</strong>
                  <small>{typeCounts[type.key] ?? 0} ofertas</small>
                </span>
              </button>
            ))}
          </div>

          <div className="nearby-panel">
            <div>
              <span className="map-section-label">Filtros</span>
              <strong>Ajusta la busqueda</strong>
              <p>Activa el GPS para limitar resultados por distancia aproximada.</p>
            </div>
            <button className="nearby-inline-action" type="button" onClick={handleNearby}>
              Cerca de mi
            </button>
            {nearbyEnabled ? (
              <button className="nearby-clear-action" type="button" onClick={clearNearby}>
                Ver todos
              </button>
            ) : null}
            {geoStatus ? <p className="geo-status">{geoStatus}</p> : null}
          </div>

          {activeView === 'map' ? (
            <>
              <ErrorMessage message={error} />

              <div className="map-results-head">
                <strong>Ofertas</strong>
                <span>{visibleOfferCount} visibles</span>
              </div>

              {loading ? (
                <LoadingState />
              ) : (
                <OfferList
                  offers={filteredOffers}
                  selectedOfferId={selectedOfferId}
                  onFocusOffer={handleOfferFocus}
                />
              )}
            </>
          ) : null}
        </div>
      </aside>
    </section>
  );
}
