const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export function getApiOrigin() {
  return apiBaseUrl.replace(/\/api\/?$/, '');
}

export function getAssetUrl(path) {
  if (!path) {
    return '';
  }

  if (/^https?:\/\//.test(path)) {
    return path;
  }

  return `${getApiOrigin()}${path}`;
}
