import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 30000,
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Let axios set multipart boundaries for FormData requests
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    } else if (!config.headers['Content-Type'] && !config.headers['content-type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  // Sign up new user
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Logout
  logout: async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
  },

  // Check if user is logged in
  isLoggedIn: async () => {
    const token = await AsyncStorage.getItem('authToken');
    return !!token;
  },

  // Get stored user
  getStoredUser: async () => {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

// Ticket API
export const ticketAPI = {
  // Create new ticket with image
  createTicket: async (formData) => {
    // Let axios set the multipart boundary automatically for React Native
    const response = await api.post('/tickets', formData);
    return response.data;
  },

  // Get all tickets
  getTickets: async (filters = {}) => {
    const response = await api.get('/tickets', { params: filters });
    return response.data;
  },

  // Get ticket by ID
  getTicketById: async (id) => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },

  // Update ticket status
  updateStatus: async (id, status, note) => {
    const response = await api.patch(`/tickets/${id}/status`, { status, note });
    return response.data;
  },

  // Resolve ticket with after photo
  resolveTicket: async (id, formData) => {
    // Let axios set the multipart boundary automatically for React Native
    const response = await api.patch(`/tickets/${id}/resolve`, formData);
    return response.data;
  },
};

// Location API
export const locationAPI = {
  // Get all locations
  getLocations: async () => {
    const response = await api.get('/locations');
    return response.data;
  },
};

export default api;
