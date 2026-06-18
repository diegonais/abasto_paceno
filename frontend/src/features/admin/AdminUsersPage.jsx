import { Badge } from '../../components/ui/Badge';
import { EntityManagementPage } from '../../components/common/EntityManagementPage';
import { ROLES } from '../../config/constants';
import { usersService } from '../../services/usersService';

export function AdminUsersPage() {
  return (
    <EntityManagementPage
      title="Usuarios"
      description="Administra cuentas y roles desde una vista separada."
      createTitle="Crear usuario"
      service={usersService}
      initialValues={{ fullName: '', email: '', password: '', role: ROLES.USER }}
      fields={[
        { name: 'fullName', label: 'Nombre completo' },
        { name: 'email', label: 'Correo electrónico', type: 'email' },
        { name: 'password', label: 'Contraseña', type: 'password' },
        {
          name: 'role',
          label: 'Rol',
          type: 'select',
          options: [
            { value: ROLES.USER, label: 'Usuario' },
            { value: ROLES.MERCHANT, label: 'Comerciante' },
            { value: ROLES.ADMIN, label: 'Admin' },
          ],
        },
      ]}
      transformSubmit={(values, editingItem) => {
        const payload = {
          fullName: values.fullName,
          email: values.email,
          role: values.role,
        };
        if (values.password) payload.password = values.password;
        if (!editingItem && !values.password) payload.password = '123456';
        return payload;
      }}
      columns={[
        { key: 'fullName', label: 'Nombre' },
        { key: 'email', label: 'Correo' },
        { key: 'role', label: 'Rol' },
        { key: 'isActive', label: 'Estado', render: (row) => <Badge tone={row.isActive ? 'success' : 'warning'}>{row.isActive ? 'Activo' : 'Inactivo'}</Badge> },
      ]}
    />
  );
}
