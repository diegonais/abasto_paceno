import { Link } from 'react-router-dom';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PublicMapPanel } from './PublicMapPanel';

export function PublicHomePage() {
  return (
    <div className="stack-xl">
      <section className="hero">
        <div className="hero-copy">
          <p className="hero-kicker">Mercado conectado</p>
          <h1>Encuentra ofertas activas en el mapa de La Paz.</h1>
          <p>
            Abasto Paceño conecta a visitantes, usuarios y comerciantes con un flujo simple:
            explorar, publicar y administrar sin perder claridad.
          </p>
          <div className="hero-actions">
            <Link to="/map"><Button>Ver mapa</Button></Link>
            <Link to="/register"><Button variant="secondary">Crear cuenta</Button></Link>
          </div>
        </div>

        <Card className="hero-card">
          <h3>Qué puedes hacer</h3>
          <ul className="feature-list">
            <li>Explorar puntos de venta activos sin iniciar sesión.</li>
            <li>Publicar ofertas con ubicación real si eres comerciante.</li>
            <li>Administrar usuarios, productos y categorías si eres admin.</li>
          </ul>
        </Card>
      </section>

      <PublicMapPanel />
    </div>
  );
}
