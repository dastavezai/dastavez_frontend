import axios from 'axios';
import { API_BASE_URL } from '../constants';

// Use the base URL from environment variable or default to localhost
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api/admin`;

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

export const getAllUsers = async () => {
  try {
    const response = await api.get(`${API_URL}/users`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const removeUser = async (userId) => {
  try {
    const response = await api.delete(`${API_URL}/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getFinancialStats = async () => {
  try {
    const response = await api.get(`${API_URL}/stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateSubscriptionPricing = async (newPrice) => {
  try {
    const response = await api.put(`${API_URL}/subscription/price`, { price: newPrice });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ============================================
// FEATURE ACCESS MANAGEMENT
// ============================================

export const getFeatureAccessMatrix = async () => {
  try {
    const response = await api.get(`${API_URL}/feature-access`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateFeatureAccessMatrix = async (features) => {
  try {
    const response = await api.put(`${API_URL}/feature-access`, { features });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ============================================
// USER TIER MANAGEMENT
// ============================================

export const updateUserTier = async (userId, tier) => {
  try {
    const response = await api.put(`${API_URL}/users/${userId}/tier`, { tier });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ============================================
// TEMPLATE DESIGN MANAGEMENT
// ============================================

export const getTemplateDesigns = async () => {
  try {
    const response = await api.get(`${API_URL}/template-designs`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getTemplateDesignCategories = async () => {
  try {
    const response = await api.get(`${API_URL}/template-designs/categories`);
    return response.data;
  } catch (error) {
    // Fallback if endpoint fails
    return { categories: ['Legal', 'Business', 'Academic', 'Personal'] };
  }
};

export const createTemplateDesign = async (designData) => {
  try {
    const response = await api.post(`${API_URL}/template-designs`, designData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateTemplateDesign = async (id, designData) => {
  try {
    const response = await api.put(`${API_URL}/template-designs/${id}`, designData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteTemplateDesign = async (id) => {
  try {
    const response = await api.delete(`${API_URL}/template-designs/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const analyzeDocumentDesign = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    // We need to use axios directly for multipart/form-data to override content-type correctly if needed
    // or just rely on axios to set it when FormData is passed
    const token = localStorage.getItem('jwt');
    const response = await axios.post(`${API_URL}/template-designs/analyze`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
