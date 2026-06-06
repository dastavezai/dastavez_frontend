/**
 * API base URL for department app axios instances.
 * - If VITE_API_URL is set, use it (production / custom backend).
 * - In Vite dev with empty env, use '' so requests hit /api on :5173 and the dev proxy forwards to :5000.
 * - Otherwise fall back to localhost:5000.
 */
export function getApiBaseUrl() {
  const env = String(import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
  if (env) return env;
  if (import.meta.env.DEV) return '';
  return 'http://localhost:5000';
}

export function formatDepartmentApiError(err, fallback = 'Request failed') {
  if (!err?.response) {
    const code = err?.code || '';
    if (code === 'ERR_NETWORK' || String(err?.message || '').includes('Network Error')) {
      return 'Cannot reach the API server. Start the backend from backend/server (npm run dev, port 5000), then refresh this page.';
    }
  }
  if (err?.response?.status === 401) {
    return 'Not signed in or session expired. Log in again at /department/login, then reopen Counter Studio.';
  }
  return err?.response?.data?.message || err?.message || fallback;
}
