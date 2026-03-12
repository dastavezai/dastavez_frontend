import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let isRefreshingToken = false;
let tokenRetryQueue = [];
let isRefreshingCsrf = false;
let csrfRetryQueue = [];

/**
 * Add JWT + CSRF refresh interceptors to an axios instance.
 * Use for departmental services that need automatic token refresh on 403.
 */
export function addRefreshInterceptors(apiInstance) {
  apiInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const status = error.response?.status;
      let msg = '';
      const data = error.response?.data;
      if (data instanceof Blob) {
        try {
          const text = await data.text();
          const parsed = JSON.parse(text);
          msg = parsed?.message || parsed?.error || '';
        } catch { /* ignore */ }
      } else if (data && typeof data === 'object') {
        msg = data.message || data.error || '';
      }

      const isJwtExpired = status === 403 && (msg === 'Invalid token' || msg.includes('Invalid token'));
      const isCsrfError = status === 403 && (msg === 'Invalid CSRF token' || msg.includes('Invalid CSRF token'));

      if (isJwtExpired && !originalRequest._tokenRetried) {
        originalRequest._tokenRetried = true;
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) return Promise.reject(error);

        if (!isRefreshingToken) {
          isRefreshingToken = true;
          try {
            const refreshResp = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken });
            const newToken = refreshResp.data.accessToken;
            localStorage.setItem('token', newToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

            const csrfResp = await axios.post(
              `${BASE_URL}/api/auth/refresh-csrf`,
              {},
              { headers: { Authorization: `Bearer ${newToken}` } }
            );
            const newCsrf = csrfResp.data.csrfToken;
            localStorage.setItem('csrfToken', newCsrf);
            axios.defaults.headers.common['x-csrf-token'] = newCsrf;

            tokenRetryQueue.forEach(cb => cb());
            tokenRetryQueue = [];
          } catch (refreshErr) {
            tokenRetryQueue = [];
            return Promise.reject(refreshErr);
          } finally {
            isRefreshingToken = false;
          }
        } else {
          await new Promise(resolve => tokenRetryQueue.push(resolve));
        }

        originalRequest.headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
        originalRequest.headers['x-csrf-token'] = localStorage.getItem('csrfToken');
        return apiInstance(originalRequest);
      }

      if (isCsrfError && !originalRequest._csrfRetried) {
        originalRequest._csrfRetried = true;

        if (!isRefreshingCsrf) {
          isRefreshingCsrf = true;
          try {
            const token = localStorage.getItem('token');
            const resp = await axios.post(
              `${BASE_URL}/api/auth/refresh-csrf`,
              {},
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const newCsrf = resp.data.csrfToken;
            localStorage.setItem('csrfToken', newCsrf);
            axios.defaults.headers.common['x-csrf-token'] = newCsrf;
            csrfRetryQueue.forEach(cb => cb(newCsrf));
            csrfRetryQueue = [];
          } catch (refreshErr) {
            csrfRetryQueue = [];
            return Promise.reject(refreshErr);
          } finally {
            isRefreshingCsrf = false;
          }
        } else {
          await new Promise(resolve => csrfRetryQueue.push(resolve));
        }

        originalRequest.headers['x-csrf-token'] = localStorage.getItem('csrfToken');
        return apiInstance(originalRequest);
      }

      return Promise.reject(error);
    }
  );
}
