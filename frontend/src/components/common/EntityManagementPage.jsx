import { useCallback, useEffect, useState } from 'react';

import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { ErrorMessage } from '../ui/ErrorMessage';
import { Input } from '../ui/Input';
import { LoadingState } from '../ui/LoadingState';
import { Modal } from '../ui/Modal';
import { PageHeader } from '../ui/PageHeader';
import { Select } from '../ui/Select';
import { Table } from '../ui/Table';
import { Textarea } from '../ui/Textarea';

function FieldRenderer({ field, value, onChange }) {
  const sharedProps = {
    label: field.label,
    name: field.name,
    value: value ?? '',
    onChange: (event) => onChange(field.name, event.target.value),
    placeholder: field.placeholder,
  };

  if (field.type === 'select') {
    return <Select {...sharedProps} options={field.options} />;
  }

  if (field.type === 'textarea') {
    return <Textarea {...sharedProps} rows={field.rows ?? 4} />;
  }

  return <Input {...sharedProps} type={field.type ?? 'text'} />;
}

export function EntityManagementPage({
  title,
  description,
  service,
  columns,
  fields,
  createTitle,
  initialValues,
  transformSubmit = (values) => values,
  toFormValues = (item) => item,
  disableActionLabel = 'Deshabilitar',
  canDisable = true,
  extraActions,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formValues, setFormValues] = useState(initialValues);
  const [saving, setSaving] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await service.list();
      setItems(response);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    void (async () => {
      await loadItems();
    })();
  }, [loadItems]);

  function openCreate() {
    setEditingItem(null);
    setFormValues(initialValues);
    setIsOpen(true);
  }

  function openEdit(item) {
    setEditingItem(item);
    setFormValues({ ...initialValues, ...toFormValues(item) });
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
    setEditingItem(null);
    setFormValues(initialValues);
  }

  function handleChange(name, value) {
    setFormValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = transformSubmit(formValues, editingItem);
      if (editingItem) {
        await service.update(editingItem.id, payload);
      } else {
        await service.create(payload);
      }
      closeModal();
      await loadItems();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDisable(item) {
    try {
      await service.disable(item.id);
      await loadItems();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  const actionColumns = [
    ...columns,
    {
      key: 'actions',
      label: 'Acciones',
      render: (row) => (
        <div className="table-actions">
          <Button variant="secondary" size="sm" onClick={() => openEdit(row)}>Editar</Button>
          {extraActions?.(row)}
          {canDisable ? (
            <Button variant="ghost" size="sm" onClick={() => handleDisable(row)}>
              {disableActionLabel}
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="stack-lg">
      <PageHeader
        title={title}
        description={description}
        actions={<Button onClick={openCreate}>Nuevo</Button>}
      />

      <ErrorMessage message={error} />

      <Card>
        {loading ? (
          <LoadingState />
        ) : items.length ? (
          <Table columns={actionColumns} rows={items} />
        ) : (
          <EmptyState title="Sin registros" description="Aún no hay información para mostrar." />
        )}
      </Card>

      <Modal
        isOpen={isOpen}
        title={editingItem ? `Editar ${title}` : createTitle}
        onClose={closeModal}
      >
        <form className="stack-md" onSubmit={handleSubmit}>
          {fields.map((field) => (
            <FieldRenderer
              key={field.name}
              field={field}
              value={formValues[field.name]}
              onChange={handleChange}
            />
          ))}
          <div className="modal-actions">
            <Button variant="ghost" onClick={closeModal}>Cancelar</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
