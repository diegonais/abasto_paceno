import { Badge } from '../../components/ui/Badge';
import { EntityManagementPage } from '../../components/common/EntityManagementPage';
import { merchantProfilesService } from '../../services/merchantProfilesService';

export function AdminMerchantProfilesPage() {
  return (
    <EntityManagementPage
      title="Comerciantes"
      description="Administra perfiles comerciales con datos básicos del negocio."
      createTitle="Crear perfil comercial"
      service={merchantProfilesService}
      initialValues={{ userId: '', businessName: '', ownerFullName: '', phone: '', description: '' }}
      fields={[
        { name: 'userId', label: 'ID del usuario' },
        { name: 'businessName', label: 'Nombre del negocio' },
        { name: 'ownerFullName', label: 'Propietario' },
        { name: 'phone', label: 'Teléfono' },
        { name: 'description', label: 'Descripción', type: 'textarea' },
      ]}
      columns={[
        { key: 'businessName', label: 'Negocio', render: (row) => row.businessName || '-' },
        { key: 'ownerFullName', label: 'Propietario' },
        { key: 'phone', label: 'Teléfono', render: (row) => row.phone || '-' },
        { key: 'user', label: 'Usuario', render: (row) => row.user?.email ?? '-' },
        { key: 'isActive', label: 'Estado', render: (row) => <Badge tone={row.isActive ? 'success' : 'warning'}>{row.isActive ? 'Activo' : 'Inactivo'}</Badge> },
      ]}
    />
  );
}
