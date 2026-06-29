import api from './api';


// ---------------------------------------------------------------------------
// Portfolio Service — frontend wrapper for /api/portfolio/* endpoints
// ---------------------------------------------------------------------------
// All communication with the backend portfolio API is contained here.
// Pages never call api.js directly for portfolio data.
// ---------------------------------------------------------------------------

const portfolioService = {

  /**
   * Get all holdings for the authenticated user.
   * Calls: GET /api/portfolio/holdings
   *
   * @returns {Promise<Array<{
   *   _id: string,
   *   symbol: string,
   *   name: string,
   *   quantity: number,
   *   avgCostPrice: number,
   *   totalInvested: number,
   *   currentPrice: null,
   *   currentValue: null,
   *   unrealisedPnL: null,
   *   unrealisedPnLPct: null,
   * }>>}
   */
  getHoldings: async () => {
    const response = await api.get('/portfolio/holdings');
    return response.data.data; // array of holding objects
  },

  /**
   * Get portfolio summary (cash, invested, value, P&L).
   * Calls: GET /api/portfolio/summary
   *
   * @returns {Promise<{
   *   cashBalance: number,
   *   totalInvested: number,
   *   currentValue: number,
   *   totalReturn: number,
   *   totalReturnPct: number,
   *   portfolioValue: number,
   * }>}
   */
  getSummary: async () => {
    const response = await api.get('/portfolio/summary');
    return response.data.data;
  },

  /**
   * Get available cash balance only.
   * Calls: GET /api/portfolio/cash
   *
   * @returns {Promise<{ cashBalance: number }>}
   */
  getCash: async () => {
    const response = await api.get('/portfolio/cash');
    return response.data.data; // { cashBalance }
  },

  /**
   * Get portfolio performance snapshot history (last 90 days).
   * Also triggers today's snapshot write on the backend (non-fatal).
   * Calls: GET /api/portfolio/snapshots
   *
   * @returns {Promise<Array<{ date: string, totalValue: number, cashBalance: number }>>}
   */
  getSnapshots: async () => {
    const response = await api.get('/portfolio/snapshots');
    return response.data.data; // array of snapshot objects
  },
};


export default portfolioService;
