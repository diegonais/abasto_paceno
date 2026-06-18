import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { getDefaultRouteForRole } from '../../config/navigation';
import { AuthFormShell } from './AuthFormShell';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setFormValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const user = await register(formValues);
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
      subtitle="El registro público crea usuarios normales; el rol administrador queda fuera de esta pantalla."
      error={error}
      footer={<p className="auth-footer">¿Ya tienes cuenta? <Link to="/login">Ingresa</Link></p>}
    >
      <form className="stack-md" onSubmit={handleSubmit}>
        <Input label="Nombre completo" name="fullName" value={formValues.fullName} onChange={handleChange} />
        <Input label="Correo electrónico" name="email" type="email" value={formValues.email} onChange={handleChange} />
        <Input label="Contraseña" name="password" type="password" value={formValues.password} onChange={handleChange} />
        <Button type="submit" disabled={loading}>{loading ? 'Creando cuenta...' : 'Registrarme'}</Button>
      </form>
    </AuthFormShell>
  );
}
