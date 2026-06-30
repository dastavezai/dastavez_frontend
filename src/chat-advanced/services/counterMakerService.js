import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class CounterMakerService {
  async extractFacts(complaintFileId) {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${BASE_URL}/api/counter-maker/extract`,
      { complaintFileId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  async startAnalysis(complaintFileId, counterFacts) {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${BASE_URL}/api/counter-maker/start`,
      { complaintFileId, counterFacts },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  async getResults(sessionId) {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${BASE_URL}/api/counter-maker/${sessionId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  async chatWithAgent(sessionId, message) {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${BASE_URL}/api/counter-maker/${sessionId}/chat`,
      { message },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
}

export default new CounterMakerService();
