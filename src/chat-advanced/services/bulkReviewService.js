import axios from 'axios';
import { API_BASE_URL } from '../constants';

const BASE_URL = `${API_BASE_URL}/bulk-review`;

const bulkReviewService = {
  startBulkReview: async (editSessionIds, guestId = null) => {
    try {
      const response = await axios.post(`${BASE_URL}/start`, { editSessionIds, guestId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getResults: async (sessionId) => {
    try {
      const response = await axios.get(`${BASE_URL}/${sessionId}/results`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  chat: async (sessionId, message, guestId = null) => {
    try {
      const response = await axios.post(`${BASE_URL}/${sessionId}/chat`, { message, guestId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default bulkReviewService;
