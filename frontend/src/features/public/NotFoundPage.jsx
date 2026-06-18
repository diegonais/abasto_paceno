import { Link } from 'react-router-dom';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export function NotFoundPage() {
  return (
    <div className="center-shell">
      <Card className="auth-card">
        <h1>Vista no encontrada</h1>
        <p>La ruta que intentaste abrir no existe o ya no está disponible.</p>
        <Link to="/"><Button>Volver al inicio</Button></Link>
      </Card>
    </div>
  );
}
