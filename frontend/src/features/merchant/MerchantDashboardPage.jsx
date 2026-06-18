import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { PublicMapPanel } from '../public/PublicMapPanel';

export function MerchantDashboardPage() {
  return (
    <div className="stack-lg">
      <PageHeader
        title="Panel del comerciante"
        description="Consulta el mapa y mantén visible la actividad de tus ofertas."
      />

      <div className="stats-grid">
        <Card><h3>Mapa activo</h3><p>Consulta visual rápida de la competencia y la oferta pública.</p></Card>
        <Card><h3>Mis ofertas</h3><p>Gestiona tus publicaciones desde una vista separada.</p></Card>
        <Card><h3>Perfil comercial</h3><p>Mantén actualizada la información del negocio.</p></Card>
      </div>

      <PublicMapPanel />
    </div>
  );
}
