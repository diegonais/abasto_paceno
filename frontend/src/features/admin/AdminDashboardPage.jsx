import { useEffect, useState } from 'react';

import { Card } from '../../components/ui/Card';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import { categoriesService } from '../../services/categoriesService';
import { merchantProfilesService } from '../../services/merchantProfilesService';
import { offersService } from '../../services/offersService';
import { productsService } from '../../services/productsService';
import { usersService } from '../../services/usersService';

export function AdminDashboardPage() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const [users, merchants, categories, products, offers] = await Promise.all([
          usersService.list(),
          merchantProfilesService.list(),
          categoriesService.list(),
          productsService.list(),
          offersService.list(),
        ]);

        setStats([
          { label: 'Usuarios', value: users.length },
          { label: 'Comerciantes', value: merchants.length },
          { label: 'Categorías', value: categories.length },
          { label: 'Productos', value: products.length },
          { label: 'Ofertas', value: offers.length },
        ]);
        setError('');
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="stack-lg">
      <PageHeader title="Dashboard admin" description="Resumen operativo del prototipo y acceso rápido al resto de vistas." />
      <ErrorMessage message={error} />
      {loading ? (
        <LoadingState />
      ) : (
        <div className="stats-grid">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <p className="muted">{stat.label}</p>
              <h2>{stat.value}</h2>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
