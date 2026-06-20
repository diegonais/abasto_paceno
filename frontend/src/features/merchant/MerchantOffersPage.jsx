import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Input } from '../../components/ui/Input';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import { Select } from '../../components/ui/Select';
import { Table } from '../../components/ui/Table';
import { Textarea } from '../../components/ui/Textarea';
import { MapView } from '../../components/map/MapView';
import { SALE_TYPES } from '../../config/constants';
import { offersService } from '../../services/offersService';
import { productsService } from '../../services/productsService';
import { formatCurrency } from '../../utils/format';

const emptyForm = {
  productId: '',
  saleType: SALE_TYPES.UNIT,
  approximateQuantity: '',
  price: '',
  latitude: '',
  longitude: '',
  locationDescription: '',
  availableFrom: '',
  availableUntil: '',
};

export function MerchantOffersPage({ mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [formValues, setFormValues] = useState(emptyForm);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadData() {
    setLoading(true);
    try {
      const [offersData, productsData] = await Promise.all([
        offersService.listMine(),
        productsService.list(),
      ]);
      setOffers(offersData);
      setProducts(productsData);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void (async () => {
      await loadData();
    })();
  }, []);

  useEffect(() => {
    async function loadOffer() {
      if (!id) return;

      try {
        const offer = await offersService.getById(id);
        setFormValues({
          productId: offer.product?.id ?? '',
          saleType: offer.saleType ?? SALE_TYPES.UNIT,
          approximateQuantity: offer.approximateQuantity ?? '',
          price: offer.price ?? '',
          latitude: offer.latitude ?? '',
          longitude: offer.longitude ?? '',
          locationDescription: offer.locationDescription ?? '',
          availableFrom: offer.availableFrom ? offer.availableFrom.slice(0, 16) : '',
          availableUntil: offer.availableUntil ? offer.availableUntil.slice(0, 16) : '',
        });
        setSelectedPoint({ lat: Number(offer.latitude), lng: Number(offer.longitude) });
      } catch (requestError) {
        setError(requestError.message);
      }
    }

    loadOffer();
  }, [id]);

  function handleChange(event) {
    setFormValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function handleCoordinatePick(point) {
    setSelectedPoint(point);
    setFormValues((current) => ({
      ...current,
      latitude: point.lat.toFixed(7),
      longitude: point.lng.toFixed(7),
    }));
  }

  async function handleDisable(offerId) {
    try {
      await offersService.disable(offerId);
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formValues,
        approximateQuantity: formValues.approximateQuantity ? Number(formValues.approximateQuantity) : undefined,
        price: formValues.price ? Number(formValues.price) : undefined,
        latitude: Number(formValues.latitude),
        longitude: Number(formValues.longitude),
        availableFrom: formValues.availableFrom || undefined,
        availableUntil: formValues.availableUntil || undefined,
      };

      if (id) {
        await offersService.update(id, payload);
      } else {
        await offersService.create(payload);
      }

      navigate('/merchant/offers');
      await loadData();
      setFormValues(emptyForm);
      setSelectedPoint(null);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  const isFormMode = mode === 'create' || mode === 'edit';

  return (
    <div className="stack-lg">
      <PageHeader
        title="Mis ofertas"
        description="Publica, edita o deshabilita tus ofertas sin mezclarlo con otras vistas."
        actions={!isFormMode ? <Button onClick={() => navigate('/merchant/offers/create')}>Nueva oferta</Button> : null}
      />

      <ErrorMessage message={error} />

      {isFormMode ? (
        <div className="content-grid content-grid-map-form">
          <Card className="form-card">
            <form className="stack-md" onSubmit={handleSubmit}>
              <Select
                label="Producto"
                name="productId"
                value={formValues.productId}
                onChange={handleChange}
                options={[
                  { value: '', label: 'Selecciona un producto' },
                  ...products.map((product) => ({ value: product.id, label: product.productName })),
                ]}
              />
              <Select
                label="Tipo de venta"
                name="saleType"
                value={formValues.saleType}
                onChange={handleChange}
                options={[
                  { value: SALE_TYPES.UNIT, label: 'Unidad' },
                  { value: SALE_TYPES.TRAY, label: 'Maple' },
                ]}
              />
              <Input label="Cantidad aproximada" name="approximateQuantity" type="number" value={formValues.approximateQuantity} onChange={handleChange} />
              <Input label="Precio" name="price" type="number" step="0.01" value={formValues.price} onChange={handleChange} />
              <Input label="Latitud" name="latitude" value={formValues.latitude} onChange={handleChange} />
              <Input label="Longitud" name="longitude" value={formValues.longitude} onChange={handleChange} />
              <Input label="Disponible desde" name="availableFrom" type="datetime-local" value={formValues.availableFrom} onChange={handleChange} />
              <Input label="Disponible hasta" name="availableUntil" type="datetime-local" value={formValues.availableUntil} onChange={handleChange} />
              <Textarea label="Descripcion de ubicacion" name="locationDescription" value={formValues.locationDescription} onChange={handleChange} rows={4} />
              <div className="inline-actions">
                <Button variant="ghost" onClick={() => navigate('/merchant/offers')}>Cancelar</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar oferta'}</Button>
              </div>
            </form>
          </Card>

          <Card className="map-card map-card-picker">
            <div className="map-panel-heading">
              <h2>Ubicacion de la oferta</h2>
            </div>
            <MapView
              offers={offers}
              height="100%"
              onCoordinatePick={handleCoordinatePick}
              selectedPoint={selectedPoint}
            />
          </Card>
        </div>
      ) : (
        <Card>
          {loading ? (
            <LoadingState />
          ) : offers.length ? (
            <Table
              columns={[
                { key: 'product', label: 'Producto', render: (row) => row.product?.productName },
                { key: 'saleType', label: 'Venta' },
                { key: 'price', label: 'Precio', render: (row) => row.price ? formatCurrency(row.price) : '-' },
                { key: 'isActive', label: 'Estado', render: (row) => <Badge tone={row.isActive ? 'success' : 'warning'}>{row.isActive ? 'Activa' : 'Inactiva'}</Badge> },
                {
                  key: 'actions',
                  label: 'Acciones',
                  render: (row) => (
                    <div className="table-actions">
                      <Button variant="secondary" size="sm" onClick={() => navigate(`/merchant/offers/${row.id}/edit`)}>Editar</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDisable(row.id)}>Deshabilitar</Button>
                    </div>
                  ),
                },
              ]}
              rows={offers}
            />
          ) : (
            <EmptyState title="Sin ofertas propias" description="Crea tu primera oferta para aparecer en el mapa publico." />
          )}
        </Card>
      )}
    </div>
  );
}
