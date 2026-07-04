const {
  getQuote,
  getProfile,
  searchSymbols,
  getNews,
  getCandles,
  getMarketNews,
} = require('../services/stockService');


// GET /api/stocks/quote/:symbol
const quote = async (req, res, next) => {
  try {
    const data = await getQuote(req.params.symbol);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};


// GET /api/stocks/profile/:symbol
const profile = async (req, res, next) => {
  try {
    const data = await getProfile(req.params.symbol);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};


// GET /api/stocks/search?q=
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


// GET /api/stocks/news/:symbol
const news = async (req, res, next) => {
  try {
    const data = await getNews(req.params.symbol);
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};


// GET /api/stocks/history/:symbol?resolution=&from=&to= (unix timestamps)
const history = async (req, res, next) => {
  try {
    const { resolution, from, to } = req.query;
    const data = await getCandles(req.params.symbol, resolution, from, to);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};


// GET /api/stocks/market-news?category=general
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
