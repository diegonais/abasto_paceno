import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PROFILE_PHOTO_MAX_SIZE_BYTES } from '../../config/constants';
import { useAuth } from '../../hooks/useAuth';
import { buildFormData } from '../../services/api/formData';
import { getDefaultRouteForRole } from '../../config/navigation';
import { validateImageFile } from '../../utils/files';
import { AuthFormShell } from './AuthFormShell';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setFormValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    const validationError = validateImageFile(file, PROFILE_PHOTO_MAX_SIZE_BYTES);

    if (validationError) {
      setError(validationError);
      setProfilePhoto(null);
      return;
    }

    setError('');
    setProfilePhoto(file ?? null);
  }

  function validateForm() {
    if (!formValues.fullName.trim()) return 'El nombre completo es obligatorio.';
    if (formValues.fullName.trim().length < 3) return 'El nombre completo es demasiado corto.';
    if (!formValues.email.trim()) return 'El correo electronico es obligatorio.';
    if (!/\S+@\S+\.\S+/.test(formValues.email)) return 'Ingresa un correo electronico valido.';
    if (formValues.password.length < 6) return 'La contrasena debe tener al menos 6 caracteres.';
    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const user = await register(
        buildFormData({
          fullName: formValues.fullName.trim(),
          email: formValues.email.trim().toLowerCase(),
          password: formValues.password,
          profilePhoto,
        }),
      );
      navigate(getDefaultRouteForRole(user.role), { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFormShell
      title="Crear cuenta"
      error={error}
      footer={<p className="auth-footer">Ya tienes cuenta? <Link to="/login">Ingresa</Link></p>}
    >
      <form className="stack-md" onSubmit={handleSubmit}>
        <Input label="Nombre completo" name="fullName" value={formValues.fullName} onChange={handleChange} />
        <Input label="Correo electronico" name="email" type="email" value={formValues.email} onChange={handleChange} />
        <Input label="Contrasena" name="password" type="password" value={formValues.password} onChange={handleChange} />
        <Input label="Foto de perfil" name="profilePhoto" type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePhotoChange} />
        <Button type="submit" disabled={loading}>{loading ? 'Creando cuenta...' : 'Registrarme'}</Button>
      </form>
    </AuthFormShell>
  );
}
