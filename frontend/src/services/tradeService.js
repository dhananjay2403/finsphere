import api from './api';


// ---------------------------------------------------------------------------
// Trade Service — frontend wrapper for /api/trades/* endpoints
// ---------------------------------------------------------------------------

const tradeService = {

  /**
   * Buy shares of a stock.
   * Calls: POST /api/trades/buy
   *
   * @param {{ symbol: string, name: string, quantity: number, pricePerShare: number }} payload
   * @returns {Promise<{ trade: object, cashBalance: number }>}
   */
  buy: async ({ symbol, name, quantity, pricePerShare }) => {
    const response = await api.post('/trades/buy', { symbol, name, quantity, pricePerShare });
    return response.data.data; // { trade, cashBalance }
  },

  /**
   * Sell shares of a stock.
   * Calls: POST /api/trades/sell
   *
   * @param {{ symbol: string, quantity: number, pricePerShare: number }} payload
   * @returns {Promise<{ trade: object, cashBalance: number }>}
   */
  sell: async ({ symbol, quantity, pricePerShare }) => {
    const response = await api.post('/trades/sell', { symbol, quantity, pricePerShare });
    return response.data.data; // { trade, cashBalance }
  },

  /**
   * Get paginated trade history.
   * Calls: GET /api/trades/history?page=&limit=&symbol=
   *
   * @param {{ page?: number, limit?: number, symbol?: string }} [params]
   * @returns {Promise<{ data: Array, total: number, page: number, totalPages: number }>}
   */
  getHistory: async (params = {}) => {
    const response = await api.get('/trades/history', { params });
    const { data, total, page, totalPages } = response.data;
    return { data, total, page, totalPages };
  },
};


export default tradeService;
