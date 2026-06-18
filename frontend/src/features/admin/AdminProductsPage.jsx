import { useEffect, useState } from 'react';

import { Badge } from '../../components/ui/Badge';
import { EntityManagementPage } from '../../components/common/EntityManagementPage';
import { categoriesService } from '../../services/categoriesService';
import { productsService } from '../../services/productsService';

export function AdminProductsPage() {
  const [categoryOptions, setCategoryOptions] = useState([{ value: '', label: 'Selecciona una categoría' }]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const categories = await categoriesService.list();
        setCategoryOptions([
          { value: '', label: 'Selecciona una categoría' },
          ...categories.map((category) => ({ value: category.id, label: category.categoryName })),
        ]);
      } catch {
        setCategoryOptions([{ value: '', label: 'No se pudieron cargar categorías' }]);
      }
    }

    loadCategories();
  }, []);

  return (
    <EntityManagementPage
      title="Productos"
      description="Gestiona productos y su categoría asociada."
      createTitle="Crear producto"
      service={productsService}
      initialValues={{ productName: '', description: '', categoryId: '' }}
      fields={[
        { name: 'productName', label: 'Nombre del producto' },
        { name: 'description', label: 'Descripción', type: 'textarea' },
        { name: 'categoryId', label: 'Categoría', type: 'select', options: categoryOptions },
      ]}
      toFormValues={(item) => ({
        productName: item.productName,
        description: item.description ?? '',
        categoryId: item.category?.id ?? '',
      })}
      columns={[
        { key: 'productName', label: 'Producto' },
        { key: 'description', label: 'Descripción', render: (row) => row.description || '-' },
        { key: 'category', label: 'Categoría', render: (row) => row.category?.categoryName ?? '-' },
        { key: 'isActive', label: 'Estado', render: (row) => <Badge tone={row.isActive ? 'success' : 'warning'}>{row.isActive ? 'Activo' : 'Inactivo'}</Badge> },
      ]}
    />
  );
}
