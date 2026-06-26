import { useEffect, useState } from 'react';

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

const emptyForm = {
  businessName: '',
  ownerFullName: '',
  merchantKind: MERCHANT_KINDS.INDIVIDUAL,
  documentId: '',
  contactEmail: '',
  phone: '',
  city: '',
  zone: '',
  addressLine: '',
  reference: '',
  openingHours: '',
  description: '',
};

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

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await merchantProfilesService.getMine();
        setExistingProfile(profile);
        setFormValues({
          businessName: profile.businessName ?? '',
          ownerFullName: profile.ownerFullName ?? user?.fullName ?? '',
          merchantKind: profile.merchantKind ?? MERCHANT_KINDS.INDIVIDUAL,
          documentId: profile.documentId ?? '',
          contactEmail: profile.contactEmail ?? user?.email ?? '',
          phone: profile.phone ?? '',
          city: profile.city ?? '',
          zone: profile.zone ?? '',
          addressLine: profile.addressLine ?? '',
          reference: profile.reference ?? '',
          openingHours: profile.openingHours ?? '',
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
    if (!formValues.addressLine.trim()) return 'La direccion es obligatoria.';
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
        ...formValues,
        businessName: formValues.businessName.trim(),
        ownerFullName: formValues.ownerFullName.trim(),
        documentId: formValues.documentId.trim(),
        contactEmail: formValues.contactEmail.trim().toLowerCase(),
        phone: formValues.phone.trim(),
        city: formValues.city.trim(),
        zone: formValues.zone.trim(),
        addressLine: formValues.addressLine.trim(),
        reference: formValues.reference.trim(),
        openingHours: formValues.openingHours.trim(),
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
          : 'Solicitud de comerciante enviada. Queda pendiente de aprobacion del admin.',
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
      ? 'Manten actualizada la informacion verificada de tu negocio.'
      : 'Completa esta solicitud para que el admin revise y apruebe tu perfil de comerciante.';
  const isStoreMerchant = formValues.merchantKind === MERCHANT_KINDS.STORE;

  return (
    <div className="stack-lg">
      <PageHeader title={pageTitle} description={pageDescription} />
      <Card className="form-card">
        {loading ? (
          <LoadingState />
        ) : (
          <form className="stack-md" onSubmit={handleSubmit}>
            <ErrorMessage message={error || message} />
            {existingProfile ? (
              <div className="stack-sm">
                <strong>Estado de verificacion: {existingProfile.verificationStatus}</strong>
                {existingProfile.reviewNotes ? <span>{existingProfile.reviewNotes}</span> : null}
              </div>
            ) : null}
            {existingProfile?.storePhotoPath ? (
              <img
                src={getAssetUrl(existingProfile.storePhotoPath)}
                alt="Foto de la tienda"
                style={{ width: '100%', maxWidth: '320px', borderRadius: '20px', objectFit: 'cover' }}
              />
            ) : null}
            <Select
              label="Tipo de comerciante"
              name="merchantKind"
              value={formValues.merchantKind}
              onChange={handleChange}
              options={[
                { value: MERCHANT_KINDS.INDIVIDUAL, label: 'Persona independiente' },
                { value: MERCHANT_KINDS.STORE, label: 'Tienda' },
              ]}
            />
            <Input label="Nombre del responsable" name="ownerFullName" value={formValues.ownerFullName} onChange={handleChange} />
            <Input label="Documento de identidad o NIT" name="documentId" value={formValues.documentId} onChange={handleChange} />
            <Input label="Correo de contacto" name="contactEmail" type="email" value={formValues.contactEmail} onChange={handleChange} />
            <Input label="Telefono de contacto" name="phone" value={formValues.phone} onChange={handleChange} />
            <Input label="Ciudad" name="city" value={formValues.city} onChange={handleChange} />
            <Input label="Zona o barrio" name="zone" value={formValues.zone} onChange={handleChange} />
            <Input label="Direccion" name="addressLine" value={formValues.addressLine} onChange={handleChange} />
            <Input label="Referencia" name="reference" value={formValues.reference} onChange={handleChange} />
            <Input label="Horario de atencion" name="openingHours" value={formValues.openingHours} onChange={handleChange} />

            <div
              style={{
                padding: '16px',
                border: '1px solid rgba(148, 163, 184, 0.24)',
                borderRadius: '18px',
                background: isStoreMerchant ? 'rgba(15, 118, 110, 0.08)' : 'rgba(148, 163, 184, 0.08)',
              }}
            >
              <div className="stack-sm">
                <strong>Datos de tienda {isStoreMerchant ? '(habilitados)' : '(opcionales)'}</strong>
                <span>
                  Si vendes como tienda, selecciona <strong>Tienda</strong> en el campo anterior y completa esta seccion.
                  Si vendes como persona independiente, puedes dejar estos datos vacios.
                </span>
              </div>
            </div>

            {isStoreMerchant ? (
              <>
                <Input
                  label="Nombre de la tienda"
                  name="businessName"
                  value={formValues.businessName}
                  onChange={handleChange}
                  placeholder="Ej. Tienda Dona Rosa"
                />
                <Input
                  label="Foto de la tienda"
                  name="storePhoto"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handlePhotoChange}
                />
              </>
            ) : (
              <Input
                label="Nombre de la tienda (opcional)"
                name="businessName"
                value={formValues.businessName}
                onChange={handleChange}
                placeholder="Solo si cuentas con tienda fisica"
              />
            )}

            <Textarea label="Descripcion del comercio" name="description" value={formValues.description} onChange={handleChange} rows={5} />
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : existingProfile ? 'Actualizar solicitud' : 'Enviar solicitud'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
