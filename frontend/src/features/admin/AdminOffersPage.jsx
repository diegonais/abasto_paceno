import { Badge } from '../../components/ui/Badge';
import { EntityManagementPage } from '../../components/common/EntityManagementPage';
import { offersService } from '../../services/offersService';
import { formatCurrency } from '../../utils/format';

export function AdminOffersPage() {
  return (
    <EntityManagementPage
      title="Ofertas"
      description="Monitorea ofertas publicadas y ajusta sus datos si hace falta."
      createTitle="Crear oferta"
      service={offersService}
      initialValues={{
        merchantProfileId: '',
        productId: '',
        saleType: 'unidad',
        approximateQuantity: '',
        price: '',
        latitude: '',
        longitude: '',
        locationDescription: '',
      }}
      fields={[
        { name: 'merchantProfileId', label: 'ID perfil comercial' },
        { name: 'productId', label: 'ID producto' },
        { name: 'saleType', label: 'Tipo de venta' },
        { name: 'approximateQuantity', label: 'Cantidad aproximada', type: 'number' },
        { name: 'price', label: 'Precio', type: 'number' },
        { name: 'latitude', label: 'Latitud' },
        { name: 'longitude', label: 'Longitud' },
        { name: 'locationDescription', label: 'Ubicación', type: 'textarea' },
      ]}
      toFormValues={(item) => ({
        merchantProfileId: item.merchantProfile?.id ?? '',
        productId: item.product?.id ?? '',
        saleType: item.saleType ?? 'unidad',
        approximateQuantity: item.approximateQuantity ?? '',
        price: item.price ?? '',
        latitude: item.latitude ?? '',
        longitude: item.longitude ?? '',
        locationDescription: item.locationDescription ?? '',
      })}
      transformSubmit={(values) => ({
        ...values,
        approximateQuantity: values.approximateQuantity ? Number(values.approximateQuantity) : undefined,
        price: values.price ? Number(values.price) : undefined,
        latitude: Number(values.latitude),
        longitude: Number(values.longitude),
      })}
      columns={[
        { key: 'product', label: 'Producto', render: (row) => row.product?.productName ?? '-' },
        { key: 'merchantProfile', label: 'Comerciante', render: (row) => row.merchantProfile?.businessName ?? row.merchantProfile?.ownerFullName ?? '-' },
        { key: 'saleType', label: 'Venta' },
        { key: 'price', label: 'Precio', render: (row) => row.price ? formatCurrency(row.price) : '-' },
        { key: 'isActive', label: 'Estado', render: (row) => <Badge tone={row.isActive ? 'success' : 'warning'}>{row.isActive ? 'Activa' : 'Inactiva'}</Badge> },
      ]}
    />
  );
}
