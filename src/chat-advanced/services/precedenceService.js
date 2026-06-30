import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class PrecedenceService {
  async startAnalysis(fileId) {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${BASE_URL}/api/precedence/start`,
      { fileId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  async getResults(sessionId) {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${BASE_URL}/api/precedence/${sessionId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  async chatWithAgent(sessionId, message) {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${BASE_URL}/api/precedence/${sessionId}/chat`,
      { message },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
}

export default new PrecedenceService();
