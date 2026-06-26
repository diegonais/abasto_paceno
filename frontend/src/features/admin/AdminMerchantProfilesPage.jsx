import { useEffect, useState } from 'react';

import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import { Table } from '../../components/ui/Table';
import { MERCHANT_VERIFICATION_STATUSES } from '../../config/constants';
import { getAssetUrl } from '../../services/api/assets';
import { merchantProfilesService } from '../../services/merchantProfilesService';

export function AdminMerchantProfilesPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadProfiles() {
    setLoading(true);
    try {
      const data = await merchantProfilesService.list();
      setProfiles(data);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProfiles();
  }, []);

  async function handleReview(profile, verificationStatus) {
    const reviewNotes =
      verificationStatus === MERCHANT_VERIFICATION_STATUSES.APPROVED
        ? 'Perfil verificado y aprobado por administracion.'
        : 'Solicitud observada por administracion. Requiere correcciones.';

    try {
      await merchantProfilesService.update(profile.id, {
        verificationStatus,
        reviewNotes,
      });
      await loadProfiles();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleDisable(profileId) {
    try {
      await merchantProfilesService.disable(profileId);
      await loadProfiles();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div className="stack-lg">
      <PageHeader
        title="Comerciantes"
        description="Revisa solicitudes, valida informacion del comercio y aprueba solo perfiles confiables."
      />

      <ErrorMessage message={error} />

      <Card>
        {loading ? (
          <LoadingState />
        ) : profiles.length ? (
          <Table
            columns={[
              { key: 'businessName', label: 'Negocio', render: (row) => row.businessName || '-' },
              { key: 'ownerFullName', label: 'Responsable' },
              { key: 'merchantKind', label: 'Tipo' },
              { key: 'contactEmail', label: 'Correo' },
              { key: 'phone', label: 'Telefono', render: (row) => row.phone || '-' },
              { key: 'city', label: 'Ciudad', render: (row) => row.city || '-' },
              {
                key: 'verificationStatus',
                label: 'Verificacion',
                render: (row) => (
                  <Badge tone={row.verificationStatus === MERCHANT_VERIFICATION_STATUSES.APPROVED ? 'success' : row.verificationStatus === MERCHANT_VERIFICATION_STATUSES.REJECTED ? 'warning' : 'info'}>
                    {row.verificationStatus}
                  </Badge>
                ),
              },
              {
                key: 'storePhoto',
                label: 'Foto',
                render: (row) =>
                  row.storePhotoPath ? (
                    <img
                      src={getAssetUrl(row.storePhotoPath)}
                      alt={row.businessName ?? row.ownerFullName}
                      style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '14px' }}
                    />
                  ) : (
                    '-'
                  ),
              },
              {
                key: 'actions',
                label: 'Acciones',
                render: (row) => (
                  <div className="table-actions">
                    <Button size="sm" onClick={() => handleReview(row, MERCHANT_VERIFICATION_STATUSES.APPROVED)}>
                      Aprobar
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleReview(row, MERCHANT_VERIFICATION_STATUSES.REJECTED)}>
                      Rechazar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDisable(row.id)}>
                      Deshabilitar
                    </Button>
                  </div>
                ),
              },
            ]}
            rows={profiles}
          />
        ) : (
          <EmptyState title="Sin solicitudes" description="Aun no hay perfiles comerciales registrados." />
        )}
      </Card>
    </div>
  );
}
