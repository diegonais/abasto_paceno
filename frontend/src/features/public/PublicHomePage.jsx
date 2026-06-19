import '../../styles/landing-preview.css';

const infoCards = [
  {
    icon: 'clipboard',
    title: 'Qué resuelve Abasto Paceño',
    description:
      'Conecta a la ciudadanía con ofertas activas de productos en La Paz mediante un mapa claro, permitiendo encontrar puntos de venta cercanos, consultar disponibilidad aproximada y tomar mejores decisiones de compra.',
  },
  {
    icon: 'structure',
    title: 'Cómo funciona',
    description:
      'Los comerciantes registran sus productos, ubicación, cantidad aproximada y horarios. Los visitantes exploran el mapa público, filtran por categoría y encuentran ofertas disponibles sin iniciar sesión.',
  },
];

const roleCards = [
  {
    icon: 'user',
    title: 'Visitantes',
    description: 'Exploran ofertas activas en el mapa público sin iniciar sesión.',
  },
  {
    icon: 'store',
    title: 'Comerciantes',
    description: 'Publican productos, ubicación, cantidad aproximada y horarios de atención.',
  },
  {
    icon: 'shield',
    title: 'Administradores',
    description: 'Gestionan usuarios, categorías, productos y publicaciones del sistema.',
  },
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
    structure: (
      <path
        d="M12 3v5m0 0H7m5 0h5m-9 0v4m8-4v4M7 12H4v5h6v-5H7Zm10 0h-3v5h6v-5h-3Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    ),
    user: (
      <path
        d="M12 12a4 4 0 1 0-4-4a4 4 0 0 0 4 4Zm-7 9a7 7 0 0 1 14 0"
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
      <div className="pageShell">
        <section className="heroSection">
          <div className="heroGrid">
            <div className="heroContent">
              
              <center>
                  <img
                className="heroLogo"
                src="/abasto-paceno.png"
                alt="Abasto Paceño"
              />

              <h1 className="heroTitle">
                Encuentra, publica y gestiona información del mercado en un solo lugar.
              </h1>
              </center>


              

              {/* <p className="heroDescription">
                Abasto Paceño conecta a la ciudadanía con ofertas reales de productos en La Paz.
                Un sistema claro, confiable y accesible para tomar mejores decisiones cada día.
              </p> */}
            </div>

            <aside className="infoPanel" aria-label="Información de Abasto Paceño">
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

              <article className="infoCard rolesCard">
                <div className="rolesHeader">
                  <div className="infoIcon">
                    <LandingIcon name="user" />
                  </div>

                  <div>
                    <h3>Tipos de usuario</h3>
                    <p>
                      Cada rol accede a funciones específicas para consultar, publicar o administrar la información.
                    </p>
                  </div>
                </div>

                <div className="roleGrid">
                  {roleCards.map((card) => (
                    <section className="roleCard" key={card.title}>
                      <div className="roleIcon">
                        <LandingIcon name={card.icon} />
                      </div>

                      <strong>{card.title}</strong>
                      <span>{card.description}</span>
                    </section>
                  ))}
                </div>
              </article>
            </aside>
          </div>
        </section>
      </div>
    </section>
  );
}
