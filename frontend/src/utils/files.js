export function validateImageFile(file, maxSizeBytes) {
  if (!file) {
    return '';
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return 'Solo se permiten imagenes JPG, PNG o WEBP.';
  }

  if (file.size > maxSizeBytes) {
    return `La imagen supera el limite de ${Math.round(maxSizeBytes / (1024 * 1024))} MB.`;
  }

  return '';
}
