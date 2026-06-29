import api from './api';


const authService = {

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Resets the shared demo account to its initial state (clean trades,
  // holdings, watchlist and $100k balance) before a new demo session starts.
  resetDemo: async () => {
    const response = await api.post('/demo/reset');
    return response.data;
  },
};


export default authService;
