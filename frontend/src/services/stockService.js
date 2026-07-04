import api from './api';


// Wraps /api/stocks/* — pages and components should go through this rather
// than calling api.js directly.

const stockService = {

  // GET /api/stocks/search?q=
  search: async (query) => {
    const response = await api.get('/stocks/search', { params: { q: query } });
    return response.data.data;
  },

  // GET /api/stocks/quote/:symbol
  getQuote: async (symbol) => {
    const response = await api.get(`/stocks/quote/${symbol}`);
    return response.data.data;
  },

  // GET /api/stocks/profile/:symbol
  getProfile: async (symbol) => {
    const response = await api.get(`/stocks/profile/${symbol}`);
    return response.data.data;
  },

  // GET /api/stocks/history/:symbol — resolution is one of "1","5","15","30",
  // "60","D","W","M"; from/to are unix seconds, default to the last year
  getHistory: async (symbol, resolution = 'D', from, to) => {
    const params = { resolution };
    if (from) params.from = from;
    if (to)   params.to   = to;
    const response = await api.get(`/stocks/history/${symbol}`, { params });
    return response.data.data;
  },

  // GET /api/stocks/news/:symbol
  getNews: async (symbol) => {
    const response = await api.get(`/stocks/news/${symbol}`);
    return response.data.data;
  },

  // GET /api/stocks/market-news — category is "general", "forex", "crypto", or "merger"
  getMarketNews: async (category = 'general') => {
    const response = await api.get('/stocks/market-news', { params: { category } });
    return response.data.data;
  },
};


export default stockService;
