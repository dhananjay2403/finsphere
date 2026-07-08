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

  // `config` lets callers pass a per-request axios override (e.g. a longer timeout) without touching globals.
  getProfile: async (config) => {
    const response = await api.get('/auth/me', config);
    return response.data;
  },

  // One-shot demo entry: backend ensures the account exists, resets it, and returns a JWT — given a longer
  // per-request timeout since a cold-backend upsert can take a while.
  demoLogin: async () => {
    // {} not null: a null body serializes to the string "null", which the backend's strict
    // express.json() parser rejects with a 400. An empty object parses cleanly.
    const response = await api.post('/demo/login', {}, { timeout: 20_000 });
    return response.data;
  },
};


export default authService;
