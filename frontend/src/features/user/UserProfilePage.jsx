import { useState } from 'react';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import { usersService } from '../../services/usersService';

export function UserProfilePage() {
  const { user, refreshUser } = useAuth();
  const [formValues, setFormValues] = useState({
    fullName: user?.fullName ?? '',
    email: user?.email ?? '',
    password: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  function handleChange(event) {
    setFormValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const payload = {
        fullName: formValues.fullName,
        email: formValues.email,
      };

      if (formValues.password) {
        payload.password = formValues.password;
      }

      await usersService.updateMe(payload);
      await refreshUser();
      setMessage('Perfil actualizado correctamente.');
      setError('');
      setFormValues((current) => ({ ...current, password: '' }));
    } catch (requestError) {
      setError(requestError.message);
      setMessage('');
    }
  }

  return (
    <div className="stack-lg">
      <PageHeader title="Mi perfil" description="Actualiza tus datos básicos de acceso." />
      <Card className="form-card">
        <form className="stack-md" onSubmit={handleSubmit}>
          <ErrorMessage message={error || message} />
          <Input label="Nombre completo" name="fullName" value={formValues.fullName} onChange={handleChange} />
          <Input label="Correo electrónico" name="email" type="email" value={formValues.email} onChange={handleChange} />
          <Input label="Nueva contraseña" name="password" type="password" value={formValues.password} onChange={handleChange} />
          <Button type="submit">Guardar cambios</Button>
        </form>
      </Card>
    </div>
  );
}
