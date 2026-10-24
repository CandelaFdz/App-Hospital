const apiUrl = import.meta.env.VITE_API_URL

if (!apiUrl) {
  throw new Error('Falta configurar VITE_API_URL en el archivo .env');
}

export const API_URL = apiUrl;
