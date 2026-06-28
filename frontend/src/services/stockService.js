import api from './api';


// ---------------------------------------------------------------------------
// Stock Service — frontend wrapper for /api/stocks/* endpoints
// ---------------------------------------------------------------------------
// All communication with the backend stock API is contained here.
// Pages and components must never call api.js directly for stock data.
//
// Each method propagates errors from axios; callers handle them in try/catch.
// ---------------------------------------------------------------------------

const stockService = {

  /**
   * Search companies by name or ticker symbol.
   * Calls: GET /api/stocks/search?q=<query>
   *
   * @param {string} query — e.g. "apple" or "AAPL"
   * @returns {Promise<Array<{ symbol, name, type, displaySymbol }>>}
   */
  search: async (query) => {
    const response = await api.get('/stocks/search', { params: { q: query } });
    return response.data.data; // array of { symbol, name, type, displaySymbol }
  },

  /**
   * Get real-time quote for a symbol.
   * Calls: GET /api/stocks/quote/:symbol
   *
   * @param {string} symbol — e.g. "AAPL"
   * @returns {Promise<{ symbol, price, change, changePercent, high, low, open, previousClose, timestamp }>}
   */
  getQuote: async (symbol) => {
    const response = await api.get(`/stocks/quote/${symbol}`);
    return response.data.data;
  },

  /**
   * Get company profile for a symbol.
   * Calls: GET /api/stocks/profile/:symbol
   *
   * @param {string} symbol
   * @returns {Promise<{ symbol, name, exchange, industry, marketCap, logo, weburl, ipo, currency, country }>}
   */
  getProfile: async (symbol) => {
    const response = await api.get(`/stocks/profile/${symbol}`);
    return response.data.data;
  },

  /**
   * Get OHLCV candle history for charting.
   * Calls: GET /api/stocks/history/:symbol?resolution=&from=&to=
   *
   * @param {string} symbol
   * @param {string} resolution — "1" | "5" | "15" | "30" | "60" | "D" | "W" | "M"
   * @param {number} [from]  — Unix timestamp (seconds). Defaults to backend default (1Y ago).
   * @param {number} [to]    — Unix timestamp (seconds). Defaults to now.
   * @returns {Promise<{ symbol, resolution, status, candles: Array<{ time, open, high, low, close, volume }> }>}
   */
  getHistory: async (symbol, resolution = 'D', from, to) => {
    const params = { resolution };
    if (from) params.from = from;
    if (to)   params.to   = to;
    const response = await api.get(`/stocks/history/${symbol}`, { params });
    return response.data.data; // { symbol, resolution, status, candles }
  },

  /**
   * Get recent company news for a symbol.
   * Calls: GET /api/stocks/news/:symbol
   *
   * @param {string} symbol
   * @returns {Promise<Array<{ id, headline, source, url, summary, datetime, image }>>}
   */
  getNews: async (symbol) => {
    const response = await api.get(`/stocks/news/${symbol}`);
    return response.data.data;
  },

  /**
   * Get general market news (no symbol required).
   * Calls: GET /api/stocks/market-news?category=<category>
   *
   * @param {string} [category] — "general" | "forex" | "crypto" | "merger"
   * @returns {Promise<Array<{ id, headline, source, url, summary, datetime, image, category }>>}
   */
  getMarketNews: async (category = 'general') => {
    const response = await api.get('/stocks/market-news', { params: { category } });
    return response.data.data;
  },
};


export default stockService;
