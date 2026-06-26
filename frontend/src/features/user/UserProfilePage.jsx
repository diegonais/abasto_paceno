import { useEffect, useMemo, useState } from 'react';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { PROFILE_PHOTO_MAX_SIZE_BYTES } from '../../config/constants';
import { useAuth } from '../../hooks/useAuth';
import { getAssetUrl } from '../../services/api/assets';
import { buildFormData } from '../../services/api/formData';
import { usersService } from '../../services/usersService';
import { validateImageFile } from '../../utils/files';

export function UserProfilePage() {
  const { user, refreshUser } = useAuth();
  const [formValues, setFormValues] = useState({
    fullName: user?.fullName ?? '',
    email: user?.email ?? '',
    password: '',
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const photoPreviewUrl = useMemo(
    () => (profilePhoto ? URL.createObjectURL(profilePhoto) : ''),
    [profilePhoto],
  );

  useEffect(() => {
    if (!photoPreviewUrl) return undefined;

    return () => URL.revokeObjectURL(photoPreviewUrl);
  }, [photoPreviewUrl]);

  function handleChange(event) {
    setFormValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    const validationError = validateImageFile(file, PROFILE_PHOTO_MAX_SIZE_BYTES);

    if (validationError) {
      setError(validationError);
      setMessage('');
      setProfilePhoto(null);
      return;
    }

    setError('');
    setProfilePhoto(file ?? null);
  }

  function validateForm() {
    if (!formValues.fullName.trim()) return 'El nombre completo es obligatorio.';
    if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      return 'Ingresa un correo electrónico válido.';
    }
    if (formValues.password && formValues.password.length < 6) {
      return 'La nueva contraseña debe tener al menos 6 caracteres.';
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

    try {
      const payload = buildFormData({
        fullName: formValues.fullName.trim(),
        email: formValues.email.trim().toLowerCase(),
        profilePhoto,
      });

      if (formValues.password) {
        payload.append('password', formValues.password);
      }

      await usersService.updateMe(payload);
      await refreshUser();
      setMessage('Perfil actualizado correctamente.');
      setError('');
      setFormValues((current) => ({ ...current, password: '' }));
      setProfilePhoto(null);
    } catch (requestError) {
      setError(requestError.message);
      setMessage('');
    }
  }

  const currentPhotoUrl = user?.profilePhotoPath ? getAssetUrl(user.profilePhotoPath) : '';
  const visiblePhotoUrl = photoPreviewUrl || currentPhotoUrl;
  const userInitial = (formValues.fullName || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="stack-lg profile-page">
      <PageHeader
        title="Mi perfil"
        description="Actualiza tus datos de acceso y la foto que se muestra en tu cuenta."
      />
      <Card className="form-card profile-card">
        <form className="profile-form" onSubmit={handleSubmit}>
          <ErrorMessage message={error || message} />

          <section className="profile-photo-panel" aria-label="Foto de perfil">
            <div className="profile-avatar-preview">
              {visiblePhotoUrl ? (
                <img src={visiblePhotoUrl} alt="Foto de perfil" />
              ) : (
                <span>{userInitial}</span>
              )}
            </div>
            <div>
              <strong>Foto de perfil</strong>
              <p>Usa una imagen clara. Se verá en el círculo del encabezado.</p>
            </div>
            <Input
              label="Cambiar foto"
              name="profilePhoto"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handlePhotoChange}
            />
          </section>

          <div className="profile-form-grid">
            <Input
              label="Nombre completo"
              name="fullName"
              value={formValues.fullName}
              onChange={handleChange}
            />
            <Input
              label="Correo electrónico"
              name="email"
              type="email"
              value={formValues.email}
              onChange={handleChange}
            />
            <Input
              label="Nueva contraseña"
              name="password"
              type="password"
              value={formValues.password}
              onChange={handleChange}
              placeholder="Déjalo vacío si no quieres cambiarla"
            />
          </div>

          <div className="profile-submit-row">
            <span>Los cambios se aplican inmediatamente al guardar.</span>
            <Button type="submit">Guardar cambios</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
