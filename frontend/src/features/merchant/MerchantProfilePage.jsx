import { useEffect, useMemo, useState } from 'react';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Input } from '../../components/ui/Input';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import {
  MERCHANT_KINDS,
  ROLES,
  STORE_PHOTO_MAX_SIZE_BYTES,
} from '../../config/constants';
import { useAuth } from '../../hooks/useAuth';
import { getAssetUrl } from '../../services/api/assets';
import { buildFormData } from '../../services/api/formData';
import { merchantProfilesService } from '../../services/merchantProfilesService';
import { validateImageFile } from '../../utils/files';

const WEEKDAY_OPTIONS = [
  { value: 'Lun', label: 'Lun' },
  { value: 'Mar', label: 'Mar' },
  { value: 'Mie', label: 'Mie' },
  { value: 'Jue', label: 'Jue' },
  { value: 'Vie', label: 'Vie' },
  { value: 'Sab', label: 'Sab' },
  { value: 'Dom', label: 'Dom' },
];

const BOLIVIA_LOCATIONS = [
  {
    department: 'La Paz',
    cities: ['La Paz', 'El Alto', 'Viacha', 'Achocalla', 'Mecapaca'],
    zones: [
      'Centro',
      'Sopocachi',
      'Miraflores',
      'Max Paredes',
      'Villa Fatima',
      'San Antonio',
      'Obrajes',
      'Calacoto',
      'Irpavi',
      'Achumani',
      'Villa Adela',
      '16 de Julio',
    ],
  },
  {
    department: 'Cochabamba',
    cities: ['Cochabamba', 'Quillacollo', 'Sacaba', 'Tiquipaya', 'Colcapirhua'],
    zones: ['Centro', 'Recoleta', 'Cala Cala', 'Queru Queru', 'Sarco', 'Zona Sud'],
  },
  {
    department: 'Santa Cruz',
    cities: ['Santa Cruz de la Sierra', 'Warnes', 'Montero', 'Cotoca', 'La Guardia'],
    zones: ['Centro', 'Equipetrol', 'Plan 3000', 'Los Pozos', 'Mutualista', 'La Ramada'],
  },
  {
    department: 'Oruro',
    cities: ['Oruro', 'Huanuni', 'Challapata', 'Caracollo'],
    zones: ['Centro', 'Norte', 'Sur', 'Este', 'Oeste'],
  },
  {
    department: 'Potosi',
    cities: ['Potosi', 'Uyuni', 'Tupiza', 'Villazon'],
    zones: ['Centro', 'San Roque', 'Villa Banzer', 'Ciudad Satelite'],
  },
  {
    department: 'Chuquisaca',
    cities: ['Sucre', 'Yotala', 'Monteagudo', 'Camargo'],
    zones: ['Centro', 'Recoleta', 'Mercado Campesino', 'Zona Norte', 'Zona Sur'],
  },
  {
    department: 'Tarija',
    cities: ['Tarija', 'Yacuiba', 'Bermejo', 'Villamontes'],
    zones: ['Centro', 'San Roque', 'El Molino', 'La Pampa', 'Zona Norte'],
  },
  {
    department: 'Beni',
    cities: ['Trinidad', 'Riberalta', 'Guayaramerin', 'San Borja'],
    zones: ['Centro', 'Pompeya', 'Nueva Trinidad', 'Zona Sur'],
  },
  {
    department: 'Pando',
    cities: ['Cobija', 'Porvenir', 'Puerto Rico'],
    zones: ['Centro', 'Mapajo', 'Villa Busch', 'Senac'],
  },
];

const DEFAULT_DEPARTMENT = 'La Paz';

const emptyForm = {
  businessName: '',
  ownerFullName: '',
  merchantKind: MERCHANT_KINDS.INDIVIDUAL,
  documentId: '',
  contactEmail: '',
  phone: '',
  department: DEFAULT_DEPARTMENT,
  city: '',
  zone: '',
  addressLine: '',
  reference: '',
  openingDays: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
  openingTime: '08:00',
  closingTime: '18:00',
  openingNotes: '',
  description: '',
};

function getLocationByDepartment(department) {
  return (
    BOLIVIA_LOCATIONS.find((location) => location.department === department) ??
    BOLIVIA_LOCATIONS[0]
  );
}

function getDepartmentForCity(city) {
  const normalizedCity = String(city ?? '').trim().toLowerCase();
  const match = BOLIVIA_LOCATIONS.find((location) =>
    location.cities.some((locationCity) => locationCity.toLowerCase() === normalizedCity),
  );

  return match?.department ?? DEFAULT_DEPARTMENT;
}

function withCurrentOption(options, currentValue, labelPrefix = '') {
  if (!currentValue || options.some((option) => option.value === currentValue)) {
    return options;
  }

  return [
    ...options,
    {
      value: currentValue,
      label: `${labelPrefix}${currentValue}`,
    },
  ];
}

function parseOpeningHours(openingHours) {
  const value = String(openingHours ?? '').trim();
  const timeMatch = value.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
  const selectedDays = WEEKDAY_OPTIONS
    .filter((day) => value.includes(day.value))
    .map((day) => day.value);

  return {
    openingDays: selectedDays.length ? selectedDays : emptyForm.openingDays,
    openingTime: timeMatch?.[1] ?? emptyForm.openingTime,
    closingTime: timeMatch?.[2] ?? emptyForm.closingTime,
    openingNotes: value.includes('|') ? value.split('|').slice(1).join('|').trim() : '',
  };
}

function formatSelectedDays(days) {
  if (days.length === WEEKDAY_OPTIONS.length) return 'Todos los días';
  return days.join(', ');
}

function buildOpeningHours(formValues) {
  const baseHours = `${formatSelectedDays(formValues.openingDays)} ${formValues.openingTime} - ${formValues.closingTime}`;
  const notes = formValues.openingNotes.trim();

  return notes ? `${baseHours} | ${notes}` : baseHours;
}

export function MerchantProfilePage() {
  const { user, role, refreshUser } = useAuth();
  const [formValues, setFormValues] = useState({
    ...emptyForm,
    ownerFullName: user?.fullName ?? '',
    contactEmail: user?.email ?? '',
  });
  const [storePhoto, setStorePhoto] = useState(null);
  const [existingProfile, setExistingProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const selectedLocation = useMemo(
    () => getLocationByDepartment(formValues.department),
    [formValues.department],
  );

  const cityOptions = useMemo(() => {
    const options = selectedLocation.cities.map((city) => ({
      value: city,
      label: city,
    }));

    return withCurrentOption(options, formValues.city, 'Otra ciudad: ');
  }, [formValues.city, selectedLocation.cities]);

  const zoneOptions = useMemo(() => {
    const options = selectedLocation.zones.map((zone) => ({
      value: zone,
      label: zone,
    }));

    return withCurrentOption(options, formValues.zone, 'Otra zona: ');
  }, [formValues.zone, selectedLocation.zones]);

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await merchantProfilesService.getMine();
        const department = getDepartmentForCity(profile.city);
        const parsedHours = parseOpeningHours(profile.openingHours);

        setExistingProfile(profile);
        setFormValues({
          ...emptyForm,
          ...parsedHours,
          businessName: profile.businessName ?? '',
          ownerFullName: profile.ownerFullName ?? user?.fullName ?? '',
          merchantKind: profile.merchantKind ?? MERCHANT_KINDS.INDIVIDUAL,
          documentId: profile.documentId ?? '',
          contactEmail: profile.contactEmail ?? user?.email ?? '',
          phone: profile.phone ?? '',
          department,
          city: profile.city ?? '',
          zone: profile.zone ?? '',
          addressLine: profile.addressLine ?? '',
          reference: profile.reference ?? '',
          description: profile.description ?? '',
        });
        setError('');
      } catch (requestError) {
        if (!String(requestError.message).toLowerCase().includes('not found')) {
          setError(requestError.message);
        }
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, [user?.email, user?.fullName]);

  function handleChange(event) {
    setFormValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function handleDepartmentChange(event) {
    const department = event.target.value;
    const nextLocation = getLocationByDepartment(department);

    setFormValues((current) => ({
      ...current,
      department,
      city: nextLocation.cities[0] ?? '',
      zone: nextLocation.zones[0] ?? '',
    }));
  }

  function handleCityChange(event) {
    const city = event.target.value;
    const department = getDepartmentForCity(city);
    const location = getLocationByDepartment(department);

    setFormValues((current) => ({
      ...current,
      department,
      city,
      zone: location.zones.includes(current.zone) ? current.zone : location.zones[0] ?? '',
    }));
  }

  function handleDayToggle(day) {
    setFormValues((current) => {
      const hasDay = current.openingDays.includes(day);
      const openingDays = hasDay
        ? current.openingDays.filter((currentDay) => currentDay !== day)
        : [...current.openingDays, day];

      return { ...current, openingDays };
    });
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    const validationError = validateImageFile(file, STORE_PHOTO_MAX_SIZE_BYTES);

    if (validationError) {
      setError(validationError);
      setStorePhoto(null);
      return;
    }

    setError('');
    setStorePhoto(file ?? null);
  }

  function validateForm() {
    if (!formValues.ownerFullName.trim()) return 'El nombre del responsable es obligatorio.';
    if (!formValues.documentId.trim()) return 'El documento de identidad o NIT es obligatorio.';
    if (!/\S+@\S+\.\S+/.test(formValues.contactEmail)) return 'Ingresa un correo de contacto valido.';
    if (!formValues.phone.trim()) return 'El telefono de contacto es obligatorio.';
    if (!formValues.city.trim()) return 'La ciudad es obligatoria.';
    if (!formValues.zone.trim()) return 'La zona es obligatoria.';
    if (!formValues.addressLine.trim()) return 'La dirección es obligatoria.';
    if (!formValues.openingDays.length) return 'Selecciona al menos un día de atención.';
    if (!formValues.openingTime || !formValues.closingTime) {
      return 'Selecciona hora de apertura y cierre.';
    }
    if (formValues.openingTime >= formValues.closingTime) {
      return 'La hora de cierre debe ser posterior a la apertura.';
    }
    if (!formValues.description.trim() || formValues.description.trim().length < 20) {
      return 'Describe el comercio con al menos 20 caracteres.';
    }
    if (formValues.merchantKind === MERCHANT_KINDS.STORE && !formValues.businessName.trim()) {
      return 'El nombre de la tienda es obligatorio.';
    }
    if (
      formValues.merchantKind === MERCHANT_KINDS.STORE &&
      !storePhoto &&
      !existingProfile?.storePhotoPath
    ) {
      return 'La foto de la tienda es obligatoria para tiendas.';
    }

    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      setMessage('');
      return;
    }

    setSaving(true);

    try {
      const payload = buildFormData({
        businessName: formValues.businessName.trim(),
        ownerFullName: formValues.ownerFullName.trim(),
        merchantKind: formValues.merchantKind,
        documentId: formValues.documentId.trim(),
        contactEmail: formValues.contactEmail.trim().toLowerCase(),
        phone: formValues.phone.trim(),
        city: formValues.city.trim(),
        zone: formValues.zone.trim(),
        addressLine: formValues.addressLine.trim(),
        reference: formValues.reference.trim(),
        openingHours: buildOpeningHours(formValues),
        description: formValues.description.trim(),
        storePhoto,
      });

      const profile = existingProfile
        ? await merchantProfilesService.updateMine(payload)
        : await merchantProfilesService.apply(payload);

      setExistingProfile(profile);
      await refreshUser();
      setStorePhoto(null);
      setError('');
      setMessage(
        existingProfile
          ? 'Perfil comercial actualizado correctamente.'
          : 'Solicitud de comerciante enviada. Queda pendiente de aprobación del administrador.',
      );
    } catch (requestError) {
      setError(requestError.message);
      setMessage('');
    } finally {
      setSaving(false);
    }
  }

  const pageTitle = role === ROLES.MERCHANT ? 'Perfil comercial' : 'Solicitud para vender';
  const pageDescription =
    role === ROLES.MERCHANT
      ? 'Mantener tus datos claros ayuda a que tus ofertas aparezcan mejor ubicadas.'
      : 'Completa tus datos de venta para que administración pueda revisar tu solicitud.';
  const isStoreMerchant = formValues.merchantKind === MERCHANT_KINDS.STORE;

  return (
    <div className="stack-lg merchant-profile-page">
      <PageHeader title={pageTitle} description={pageDescription} />
      <Card className="form-card merchant-form-card">
        {loading ? (
          <LoadingState />
        ) : (
          <form className="merchant-form" onSubmit={handleSubmit}>
            <ErrorMessage message={error || message} />

            {existingProfile ? (
              <div className="merchant-status-card">
                <span>Estado de verificación</span>
                <strong>{existingProfile.verificationStatus}</strong>
                {existingProfile.reviewNotes ? <p>{existingProfile.reviewNotes}</p> : null}
              </div>
            ) : null}

            <section className="merchant-form-section">
              <div className="merchant-section-head">
                <span>1</span>
                <div>
                  <h2>Datos del responsable</h2>
                  <p>Información básica para validar la solicitud.</p>
                </div>
              </div>

              <div className="merchant-form-grid merchant-form-grid-three">
                <Select
                  label="Tipo de comerciante"
                  name="merchantKind"
                  value={formValues.merchantKind}
                  onChange={handleChange}
                  options={[
                    { value: MERCHANT_KINDS.INDIVIDUAL, label: 'Persona independiente' },
                    { value: MERCHANT_KINDS.STORE, label: 'Tienda física' },
                  ]}
                />
                <Input
                  label="Nombre del responsable"
                  name="ownerFullName"
                  value={formValues.ownerFullName}
                  onChange={handleChange}
                />
                <Input
                  label="Documento o NIT"
                  name="documentId"
                  value={formValues.documentId}
                  onChange={handleChange}
                />
                <Input
                  label="Correo de contacto"
                  name="contactEmail"
                  type="email"
                  value={formValues.contactEmail}
                  onChange={handleChange}
                />
                <Input
                  label="Telefono"
                  name="phone"
                  value={formValues.phone}
                  onChange={handleChange}
                />
              </div>
            </section>

            <section className="merchant-form-section">
              <div className="merchant-section-head">
                <span>2</span>
                <div>
                  <h2>Ubicación del comercio</h2>
                  <p>Selecciona desde listas para evitar datos escritos de formas distintas.</p>
                </div>
              </div>

              <div className="merchant-form-grid merchant-form-grid-three">
                <Select
                  label="Departamento"
                  name="department"
                  value={formValues.department}
                  onChange={handleDepartmentChange}
                  options={BOLIVIA_LOCATIONS.map((location) => ({
                    value: location.department,
                    label: location.department,
                  }))}
                />
                <Select
                  label="Ciudad"
                  name="city"
                  value={formValues.city}
                  onChange={handleCityChange}
                  options={[
                    { value: '', label: 'Selecciona ciudad' },
                    ...cityOptions,
                  ]}
                />
                <Select
                  label="Zona o barrio"
                  name="zone"
                  value={formValues.zone}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Selecciona zona' },
                    ...zoneOptions,
                  ]}
                />
                <Input
                  className="field-span-2"
                  label="Direccion"
                  name="addressLine"
                  value={formValues.addressLine}
                  onChange={handleChange}
                  placeholder="Calle, número, mercado o punto de referencia"
                />
                <Input
                  label="Referencia"
                  name="reference"
                  value={formValues.reference}
                  onChange={handleChange}
                  placeholder="Ej. frente a la parada"
                />
              </div>
            </section>

            <section className="merchant-form-section">
              <div className="merchant-section-head">
                <span>3</span>
                <div>
                  <h2>Horario de atención</h2>
                  <p>Marca días y elige las horas con controles visuales.</p>
                </div>
              </div>

              <div className="merchant-time-panel">
                <div className="weekday-grid" aria-label="Días de atención">
                  {WEEKDAY_OPTIONS.map((day) => {
                    const isSelected = formValues.openingDays.includes(day.value);

                    return (
                      <button
                        className={`weekday-chip${isSelected ? ' is-selected' : ''}`}
                        type="button"
                        key={day.value}
                        aria-pressed={isSelected}
                        onClick={() => handleDayToggle(day.value)}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>

                <div className="time-range-grid">
                  <Input
                    label="Abre"
                    name="openingTime"
                    type="time"
                    value={formValues.openingTime}
                    onChange={handleChange}
                  />
                  <Input
                    label="Cierra"
                    name="closingTime"
                    type="time"
                    value={formValues.closingTime}
                    onChange={handleChange}
                  />
                  <Input
                    label="Nota opcional"
                    name="openingNotes"
                    value={formValues.openingNotes}
                    onChange={handleChange}
                    placeholder="Ej. descanso de 13:00 a 14:00"
                  />
                </div>
              </div>
            </section>

            <section className="merchant-form-section">
              <div className="merchant-section-head">
                <span>4</span>
                <div>
                  <h2>Presentacion</h2>
                  <p>Ayuda a reconocer tu negocio y lo que ofreces.</p>
                </div>
              </div>

              <div className="merchant-form-grid">
                <div className="merchant-store-callout">
                  <strong>
                    Datos de tienda {isStoreMerchant ? 'requeridos' : 'opcionales'}
                  </strong>
                  <p>
                    Si vendes como tienda física, agrega el nombre comercial y una foto clara
                    del local. Si eres independiente, el nombre comercial puede quedar vacio.
                  </p>
                </div>

                {existingProfile?.storePhotoPath ? (
                  <img
                    className="merchant-photo-preview"
                    src={getAssetUrl(existingProfile.storePhotoPath)}
                    alt="Foto de la tienda"
                  />
                ) : null}

                <Input
                  label={isStoreMerchant ? 'Nombre de la tienda' : 'Nombre de la tienda (opcional)'}
                  name="businessName"
                  value={formValues.businessName}
                  onChange={handleChange}
                  placeholder="Ej. Tienda Dona Rosa"
                />

                {isStoreMerchant ? (
                  <Input
                    label="Foto de la tienda"
                    name="storePhoto"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handlePhotoChange}
                  />
                ) : null}

                <Textarea
                  className="field-span-full"
                  label="Descripción del comercio"
                  name="description"
                  value={formValues.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe que vendes, donde atiendes y que debe saber el comprador."
                />
              </div>
            </section>

            <div className="merchant-submit-bar">
              <span>{buildOpeningHours(formValues)}</span>
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : existingProfile ? 'Actualizar solicitud' : 'Enviar solicitud'}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
