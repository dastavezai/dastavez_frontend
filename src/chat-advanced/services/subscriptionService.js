import axios from 'axios';
import { API_BASE_URL } from '../constants';

// Use the base URL from environment variable or default to localhost
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api/subscription`;

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

export const createOrder = async (amount, couponCode) => {
  try {
    const response = await api.post(`${API_URL}/order`, { amount, couponCode });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const verifyPayment = async (paymentData) => {
  try {
    const response = await api.post(`${API_URL}/verify`, paymentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getSubscriptionStatus = async () => {
  try {
    const response = await api.get(`${API_URL}/status`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const validateCoupon = async (code) => {
  try {
    const response = await api.post(`${API_URL}/validate-coupon`, { code });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getSubscriptionPrice = async () => {
  try {
    const response = await api.get(`${API_URL}/price`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateSubscriptionPrice = async (newPrice) => {
  try {
    // Convert rupees to paise for the request
    const response = await api.put(`${API_URL}/price`, { amount: Math.round(newPrice * 100) });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createCoupon = async (couponData) => {
  try {
    const response = await api.post(`${API_URL}/coupons`, couponData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getCoupons = async () => {
  try {
    const response = await api.get(`${API_URL}/coupons`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const editCoupon = async (id, couponData) => {
  try {
    const response = await api.put(`${API_URL}/coupons/${id}`, couponData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteCoupon = async (id) => {
  try {
    const response = await api.delete(`${API_URL}/coupons/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}; 