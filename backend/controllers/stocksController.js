const {
  getQuote,
  getProfile,
  searchSymbols,
  getNews,
  getCandles,
  getMarketNews,
} = require('../services/stockService');


// ---------------------------------------------------------------------------
// @desc    Get real-time quote for a symbol
// @route   GET /api/stocks/quote/:symbol
// @access  Protected
// ---------------------------------------------------------------------------
const quote = async (req, res, next) => {
  try {
    const data = await getQuote(req.params.symbol);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};


// ---------------------------------------------------------------------------
// @desc    Get company profile for a symbol
// @route   GET /api/stocks/profile/:symbol
// @access  Protected
// ---------------------------------------------------------------------------
const profile = async (req, res, next) => {
  try {
    const data = await getProfile(req.params.symbol);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};


// ---------------------------------------------------------------------------
// @desc    Search companies by name or symbol
// @route   GET /api/stocks/search?q=
// @access  Protected
// ---------------------------------------------------------------------------
const search = async (req, res, next) => {
  try {
    const q = req.query.q;
    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "q" is required',
      });
    }
    const data = await searchSymbols(q);
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};


// ---------------------------------------------------------------------------
// @desc    Get recent news for a symbol
// @route   GET /api/stocks/news/:symbol
// @access  Protected
// ---------------------------------------------------------------------------
const news = async (req, res, next) => {
  try {
    const data = await getNews(req.params.symbol);
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};


// ---------------------------------------------------------------------------
// @desc    Get historical candle data for charting
// @route   GET /api/stocks/history/:symbol
// @access  Protected
// @query   resolution (default "D"), from (unix ts), to (unix ts)
// ---------------------------------------------------------------------------
const history = async (req, res, next) => {
  try {
    const { resolution, from, to } = req.query;
    const data = await getCandles(req.params.symbol, resolution, from, to);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};


// ---------------------------------------------------------------------------
// @desc    Get general market news (no symbol needed)
// @route   GET /api/stocks/market-news?category=general
// @access  Protected
// ---------------------------------------------------------------------------
const marketNews = async (req, res, next) => {
  try {
    const category = req.query.category || 'general';
    const data = await getMarketNews(category);
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};


module.exports = { quote, profile, search, news, history, marketNews };
