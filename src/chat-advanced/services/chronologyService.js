import axios from 'axios';
import { API_BASE_URL as BASE_URL } from '../constants';

const API_URL = '/chronology';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    const csrfToken = localStorage.getItem('csrfToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (csrfToken) {
      config.headers['x-csrf-token'] = csrfToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const chronologyService = {
  /**
   * Start a chronology analysis session.
   * @param {string[]} editSessionIds - Array of edit session IDs to analyze.
   * @returns {Promise<{ message: string, sessionId: string }>}
   */
  startChronology: async (editSessionIds) => {
    try {
      console.log('📅 Starting chronology with sessions:', editSessionIds);
      const response = await api.post(`${API_URL}/start`, { editSessionIds });
      console.log('✅ Chronology started:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Start chronology error:', error?.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get chronology results / status (for polling).
   * @param {string} sessionId
   * @returns {Promise<Object>}
   */
  getChronologyResults: async (sessionId) => {
    try {
      const response = await api.get(`${API_URL}/${sessionId}/results`);
      return response.data;
    } catch (error) {
      console.error('❌ Get chronology results error:', error?.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Chat with chronology Q&A agent.
   * @param {string} sessionId
   * @param {string} message
   * @returns {Promise<{ reply: string }>}
   */
  chatWithAgent: async (sessionId, message) => {
    try {
      console.log('💬 Chronology chat:', { sessionId, message });
      const response = await api.post(`${API_URL}/${sessionId}/chat`, { message });
      return response.data;
    } catch (error) {
      console.error('❌ Chronology chat error:', error?.response?.data || error.message);
      throw error;
    }
  },
};

export default chronologyService;
