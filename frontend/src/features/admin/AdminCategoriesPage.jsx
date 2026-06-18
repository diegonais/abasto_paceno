import { Badge } from '../../components/ui/Badge';
import { EntityManagementPage } from '../../components/common/EntityManagementPage';
import { categoriesService } from '../../services/categoriesService';

export function AdminCategoriesPage() {
  return (
    <EntityManagementPage
      title="Categorías"
      description="Organiza el catálogo base de productos."
      createTitle="Crear categoría"
      service={categoriesService}
      initialValues={{ categoryName: '' }}
      fields={[{ name: 'categoryName', label: 'Nombre de categoría' }]}
      columns={[
        { key: 'categoryName', label: 'Nombre' },
        { key: 'isActive', label: 'Estado', render: (row) => <Badge tone={row.isActive ? 'success' : 'warning'}>{row.isActive ? 'Activa' : 'Inactiva'}</Badge> },
      ]}
    />
  );
}
