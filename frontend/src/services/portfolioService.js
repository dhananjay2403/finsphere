import api from './api';


// Wraps /api/portfolio/* — pages should go through this rather than
// calling api.js directly.

const portfolioService = {

  // GET /api/portfolio/holdings
  getHoldings: async () => {
    const response = await api.get('/portfolio/holdings');
    return response.data.data;
  },

  // GET /api/portfolio/summary — cash, invested, current value, P&L
  getSummary: async () => {
    const response = await api.get('/portfolio/summary');
    return response.data.data;
  },

  // GET /api/portfolio/cash
  getCash: async () => {
    const response = await api.get('/portfolio/cash');
    return response.data.data;
  },

  // GET /api/portfolio/snapshots — last 90 days; also triggers today's
  // snapshot write on the backend (non-fatal if it fails)
  getSnapshots: async () => {
    const response = await api.get('/portfolio/snapshots');
    return response.data.data;
  },
};


export default portfolioService;
