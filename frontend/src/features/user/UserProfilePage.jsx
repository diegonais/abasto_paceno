import { useState } from 'react';

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
    if (!/\S+@\S+\.\S+/.test(formValues.email)) return 'Ingresa un correo electronico valido.';
    if (formValues.password && formValues.password.length < 6) {
      return 'La nueva contrasena debe tener al menos 6 caracteres.';
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

  return (
    <div className="stack-lg">
      <PageHeader title="Mi perfil" description="Actualiza tus datos bÃ¡sicos de acceso." />
      <Card className="form-card">
        <form className="stack-md" onSubmit={handleSubmit}>
          <ErrorMessage message={error || message} />
          {user?.profilePhotoPath ? (
            <img
              src={getAssetUrl(user.profilePhotoPath)}
              alt="Foto de perfil"
              style={{ width: '112px', height: '112px', objectFit: 'cover', borderRadius: '18px' }}
            />
          ) : null}
          <Input label="Nombre completo" name="fullName" value={formValues.fullName} onChange={handleChange} />
          <Input label="Correo electrÃ³nico" name="email" type="email" value={formValues.email} onChange={handleChange} />
          <Input label="Nueva contraseÃ±a" name="password" type="password" value={formValues.password} onChange={handleChange} />
          <Input label="Actualizar foto de perfil" name="profilePhoto" type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePhotoChange} />
          <Button type="submit">Guardar cambios</Button>
        </form>
      </Card>
    </div>
  );
}
