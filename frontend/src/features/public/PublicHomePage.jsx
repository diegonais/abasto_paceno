import { Link } from 'react-router-dom';

import '../../styles/landing-preview.css';

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

const previewOffers = [
  { product: 'Huevo criollo', place: 'Miraflores', price: 'Bs 29' },
  { product: 'Tomate', place: 'Sopocachi', price: 'Bs 5' },
  { product: 'Pan marraqueta', place: 'Max Paredes', price: 'Bs 0.70' },
];

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
                  <strong>Ofertas activas</strong>
                </div>

                <div className="mapRoute" aria-hidden="true" />
                <span className="mapPin mapPinOne" aria-hidden="true" />
                <span className="mapPin mapPinTwo" aria-hidden="true" />
                <span className="mapPin mapPinThree" aria-hidden="true" />

                <div className="offerStack">
                  {previewOffers.map((offer) => (
                    <article className="previewOffer" key={offer.product}>
                      <div>
                        <strong>{offer.product}</strong>
                        <span>{offer.place}</span>
                      </div>
                      <b>{offer.price}</b>
                    </article>
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
