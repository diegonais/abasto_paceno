import axios from 'axios';

const baseURL = process.env.EXPO_PUBLIC_API_URL;

if (!baseURL) {
  console.warn('EXPO_PUBLIC_API_URL no esta configurada para la app movil.');
}

export const apiClient = axios.create({
  baseURL,
  timeout: 12000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Ocurrio un error inesperado.';

    return Promise.reject(new Error(Array.isArray(message) ? message.join(', ') : message));
  },
);
