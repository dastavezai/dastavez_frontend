import axios from 'axios';
import { API_BASE_URL as BASE_URL } from '../constants';

const API_URL = '/studio';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add token to all requests
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
  (error) => {
    return Promise.reject(error);
  }
);

const researchService = {
  /**
   * Start a deep research session.
   * @param {string[]} editSessionIds - Array of edit session IDs to analyze.
   * @returns {Promise<{ message: string, sessionId: string }>}
   */
  startResearch: async (editSessionIds) => {
    try {
      console.log('🔬 Starting deep research with sessions:', editSessionIds);
      const response = await api.post(`${API_URL}/start`, { editSessionIds });
      console.log('✅ Research started:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Start research error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  /**
   * Get research results / status for a session.
   * @param {string} sessionId - The research session ID.
   * @returns {Promise<Object>} - Full research session object including status, agent data.
   */
  getResearchResults: async (sessionId) => {
    try {
      const response = await api.get(`${API_URL}/${sessionId}/results`);
      return response.data;
    } catch (error) {
      console.error('❌ Get research results error:', {
        message: error.message,
        status: error.response?.status,
      });
      throw error;
    }
  },

  /**
   * Chat with Agent 4 (Q&A on research results).
   * @param {string} sessionId - The research session ID.
   * @param {string} message - The user message.
   * @returns {Promise<{ reply: string }>}
   */
  chatWithAgent4: async (sessionId, message) => {
    try {
      console.log('💬 Agent 4 chat:', { sessionId, message });
      const response = await api.post(`${API_URL}/${sessionId}/chat`, { message });
      console.log('✅ Agent 4 response received');
      return response.data;
    } catch (error) {
      console.error('❌ Agent 4 chat error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },
};

export default researchService;
