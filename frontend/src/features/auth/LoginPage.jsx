import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { getDefaultRouteForRole } from '../../config/navigation';
import { AuthFormShell } from './AuthFormShell';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formValues, setFormValues] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setFormValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const user = await login(formValues);
      navigate(location.state?.from ?? getDefaultRouteForRole(user.role), { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFormShell
      title="Iniciar sesión"
      subtitle="Ingresa con tu cuenta para administrar tu experiencia según tu rol."
      error={error}
      footer={<p className="auth-footer">¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>}
    >
      <form className="stack-md" onSubmit={handleSubmit}>
        <Input label="Correo electrónico" name="email" type="email" value={formValues.email} onChange={handleChange} />
        <Input label="Contraseña" name="password" type="password" value={formValues.password} onChange={handleChange} />
        <Button type="submit" disabled={loading}>{loading ? 'Ingresando...' : 'Entrar'}</Button>
      </form>
    </AuthFormShell>
  );
}
