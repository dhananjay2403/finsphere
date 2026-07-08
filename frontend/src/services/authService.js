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

  // `config` lets callers pass a per-request axios override (e.g. a longer
  // timeout for the cold-start session-restore check) without touching globals.
  getProfile: async (config) => {
    const response = await api.get('/auth/me', config);
    return response.data;
  },

  // One-shot demo entry: the backend ensures the demo account exists, resets
  // it to a clean state, and returns a real JWT in a single request. Given a
  // longer per-request timeout (not the global 10s) because on a cold backend
  // the upsert + reset can take a while — a timeout here would otherwise abort
  // a demo login that was about to succeed.
  demoLogin: async () => {
    // Send {} (not null) as the body: the axios instance sets
    // Content-Type: application/json, and a null body serializes to the string
    // "null", which the backend's strict express.json() parser rejects with a
    // 400. An empty object parses cleanly.
    const response = await api.post('/demo/login', {}, { timeout: 20_000 });
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
