import { useEffect, useState } from 'react';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Input } from '../../components/ui/Input';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import { Textarea } from '../../components/ui/Textarea';
import { merchantProfilesService } from '../../services/merchantProfilesService';

export function MerchantProfilePage() {
  const [formValues, setFormValues] = useState({
    businessName: '',
    ownerFullName: '',
    phone: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await merchantProfilesService.getMine();
        setFormValues({
          businessName: profile.businessName ?? '',
          ownerFullName: profile.ownerFullName ?? '',
          phone: profile.phone ?? '',
          description: profile.description ?? '',
        });
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function handleChange(event) {
    setFormValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await merchantProfilesService.updateMine(formValues);
      setMessage('Perfil comercial actualizado.');
      setError('');
    } catch (requestError) {
      setError(requestError.message);
      setMessage('');
    }
  }

  return (
    <div className="stack-lg">
      <PageHeader title="Perfil comercial" description="Edita la información visible y operativa de tu negocio." />
      <Card className="form-card">
        {loading ? (
          <LoadingState />
        ) : (
          <form className="stack-md" onSubmit={handleSubmit}>
            <ErrorMessage message={error || message} />
            <Input label="Nombre del negocio" name="businessName" value={formValues.businessName} onChange={handleChange} />
            <Input label="Propietario" name="ownerFullName" value={formValues.ownerFullName} onChange={handleChange} />
            <Input label="Teléfono" name="phone" value={formValues.phone} onChange={handleChange} />
            <Textarea label="Descripción" name="description" value={formValues.description} onChange={handleChange} rows={5} />
            <Button type="submit">Guardar perfil</Button>
          </form>
        )}
      </Card>
    </div>
  );
}
