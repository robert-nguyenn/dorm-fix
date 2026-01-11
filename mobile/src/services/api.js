import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ticket API
export const ticketAPI = {
  // Create new ticket with image
  createTicket: async (formData) => {
    const response = await api.post('/tickets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
    const response = await api.patch(`/tickets/${id}/resolve`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
