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
  const highlights = [
    {
      title: 'Registro simple',
      description: 'El alta publica esta pensada para comenzar rapido y entrar a la plataforma sin pasos confusos.',
    },
    {
      title: 'Base para crecer',
      description: 'Desde aqui una persona puede empezar como usuario y luego continuar su recorrido dentro del ecosistema.',
    },
  ];

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
      eyebrow="Registro"
      title="Crear cuenta"
      subtitle="El registro publico crea usuarios normales; el rol administrador queda fuera de esta pantalla."
      asideTitle="Crea tu cuenta dentro de una interfaz consistente con el inicio."
      asideDescription="La idea es que registrarse se sienta tan claro y agradable como recorrer la portada y el mapa publico."
      highlights={highlights}
      error={error}
      footer={<p className="auth-footer">Ya tienes cuenta? <Link to="/login">Ingresa</Link></p>}
    >
      <form className="stack-md" onSubmit={handleSubmit}>
        <Input label="Nombre completo" name="fullName" value={formValues.fullName} onChange={handleChange} />
        <Input label="Correo electronico" name="email" type="email" value={formValues.email} onChange={handleChange} />
        <Input label="Contrasena" name="password" type="password" value={formValues.password} onChange={handleChange} />
        <Button type="submit" disabled={loading}>{loading ? 'Creando cuenta...' : 'Registrarme'}</Button>
      </form>
    </AuthFormShell>
  );
}
