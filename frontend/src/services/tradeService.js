import api from './api';


// Wraps /api/trades/*

const tradeService = {

  // POST /api/trades/buy — pricePerShare is sent for the request shape but
  // the backend prices the trade itself
  buy: async ({ symbol, name, quantity, pricePerShare }) => {
    const response = await api.post('/trades/buy', { symbol, name, quantity, pricePerShare });
    return response.data.data;
  },

  // POST /api/trades/sell — same note on pricePerShare as buy
  sell: async ({ symbol, quantity, pricePerShare }) => {
    const response = await api.post('/trades/sell', { symbol, quantity, pricePerShare });
    return response.data.data;
  },

  // GET /api/trades/history?page=&limit=&symbol=
  getHistory: async (params = {}) => {
    const response = await api.get('/trades/history', { params });
    const { data, total, page, totalPages } = response.data;
    return { data, total, page, totalPages };
  },
};


export default tradeService;
