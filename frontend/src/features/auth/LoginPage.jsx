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
  const highlights = [
    {
      title: 'Mapa y panel conectados',
      description: 'Consulta el mapa publico y entra a tu panel sin perder continuidad visual ni de navegacion.',
    },
    {
      title: 'Experiencia segun tu rol',
      description: 'Cada cuenta abre herramientas especificas para visitantes, comerciantes y administradores.',
    },
  ];

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
      eyebrow="Ingreso"
      title="Iniciar sesion"
      subtitle="Ingresa con tu cuenta para administrar tu experiencia segun tu rol."
      asideTitle="Tu cuenta lista para seguir explorando Abasto Paceno."
      asideDescription="Mantuvimos el mismo tono visual del inicio para que entrar al sistema se sienta como una continuidad natural de la experiencia."
      highlights={highlights}
      error={error}
      footer={<p className="auth-footer">No tienes cuenta? <Link to="/register">Registrate</Link></p>}
    >
      <form className="stack-md" onSubmit={handleSubmit}>
        <Input label="Correo electronico" name="email" type="email" value={formValues.email} onChange={handleChange} />
        <Input label="Contrasena" name="password" type="password" value={formValues.password} onChange={handleChange} />
        <Button type="submit" disabled={loading}>{loading ? 'Ingresando...' : 'Entrar'}</Button>
      </form>
    </AuthFormShell>
  );
}
