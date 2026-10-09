const apiUrl = import.meta.env.VITE_API_URL?.trim();

if (!apiUrl) {
  throw new Error('Falta configurar VITE_API_URL en el archivo .env');
}

export const API_URL = apiUrl.replace(/\/$/, '');
export const SYNC_USER_ID = import.meta.env.VITE_SYNC_USER_ID?.trim() || '0';
