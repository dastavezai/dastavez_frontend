
// Use environment-aware API URL (same as api.ts)
// In local dev with empty VITE_API_URL, this resolves to '/api' which triggers Vite proxy
export const API_BASE_URL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api';
