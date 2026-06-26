export function buildFormData(values) {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    formData.append(key, value);
  });

  return formData;
}
