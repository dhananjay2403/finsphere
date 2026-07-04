const axios = require('axios');
// yahoo-finance2 v3: default export is the class — must instantiate before use
const YahooFinanceClass = require('yahoo-finance2').default;
const yahooFinance = new YahooFinanceClass();

// All Finnhub communication lives here — controllers never touch axios or
// Finnhub directly, so swapping providers later only means changing this
// file. Every method throws a descriptive Error on failure and lets the
// controller's try/catch forward it to the global error handler.

const BASE_URL = 'https://finnhub.io/api/v1';

// Resolved once at module load — fails fast if the key is missing
const API_KEY = process.env.FINNHUB_API_KEY;

if (!API_KEY) {
  // Warn loudly at startup — do not silently swallow a missing key
  console.error('⚠  FINNHUB_API_KEY is not set in .env — stock endpoints will fail');
}

const finnhubClient = axios.create({
  baseURL: BASE_URL,
  timeout: 8000, // 8 s — Finnhub occasionally runs slow; fail before the Express default
  params: {
    token: API_KEY, // Appended to every request automatically
  },
});


// Wraps every Finnhub call and normalises the error — rate limit, bad
// key, network failure, or a generic upstream error.
const callFinnhub = async (endpoint, params = {}) => {

  if (!API_KEY) {
    const err = new Error('Finnhub API key is not configured');
    err.statusCode = 503;
    throw err;
  }

  try {
    const response = await finnhubClient.get(endpoint, { params });
    return response.data;
  }

  catch (err) {

    // Finnhub returned an HTTP error response
    if (err.response) {
      const status = err.response.status;
      const message = err.response.data?.error || err.response.statusText;

      if (status === 429) {
        const rateErr = new Error('Finnhub rate limit reached — please try again shortly');
        rateErr.statusCode = 429;
        throw rateErr;
      }

      if (status === 401 || status === 403) {
        const authErr = new Error('Invalid or missing Finnhub API key');
        authErr.statusCode = 502;
        throw authErr;
      }

      const upstreamErr = new Error(`Finnhub error: ${message}`);
      upstreamErr.statusCode = 502;
      throw upstreamErr;
    }

    // Network failure / timeout (no response received)
    if (err.request) {
      const netErr = new Error('Could not reach Finnhub — network failure or timeout');
      netErr.statusCode = 503;
      throw netErr;
    }

    // Unexpected error (e.g. programming mistake)
    throw err;
  }
};


// Live quote for a symbol — Finnhub's single-letter fields (c, d, dp...)
// get renamed to something readable below.
const getQuote = async (symbol) => {

  const data = await callFinnhub('/quote', { symbol: symbol.toUpperCase() });

  // Finnhub returns { c: 0, ... } for unknown symbols — detect and reject
  if (!data || data.c === 0) {
    const err = new Error(`No quote data found for symbol: ${symbol.toUpperCase()}`);
    err.statusCode = 404;
    throw err;
  }

  return {
    symbol: symbol.toUpperCase(),
    price: data.c,   // current price
    change: data.d,   // day change (absolute)
    changePercent: data.dp,  // day change (%)
    high: data.h,   // day high
    low: data.l,   // day low
    open: data.o,   // day open
    previousClose: data.pc,  // previous close
    timestamp: data.t,   // unix timestamp of last trade
  };
};


// Company profile — name, sector, exchange, logo, etc.
const getProfile = async (symbol) => {

  const data = await callFinnhub('/stock/profile2', { symbol: symbol.toUpperCase() });

  // Finnhub returns an empty object {} for unknown symbols
  if (!data || !data.name) {
    const err = new Error(`No company profile found for symbol: ${symbol.toUpperCase()}`);
    err.statusCode = 404;
    throw err;
  }

  return {
    symbol: symbol.toUpperCase(),
    name: data.name,
    exchange: data.exchange,
    industry: data.finnhubIndustry,
    marketCap: data.marketCapitalization, // in USD millions
    logo: data.logo,
    weburl: data.weburl,
    ipo: data.ipo,
    currency: data.currency,
    country: data.country,
  };
};


// Symbol/company search, filtered down to common stocks only.
const searchSymbols = async (query) => {

  if (!query || query.trim().length < 1) {
    const err = new Error('Search query cannot be empty');
    err.statusCode = 400;
    throw err;
  }

  const data = await callFinnhub('/search', { q: query.trim() });

  if (!data || !data.result) return [];

  // Filter to common stocks only — exclude ETFs, options, bonds, etc.
  return data.result
    .filter((item) => item.type === 'Common Stock')
    .slice(0, 10) // Cap at 10 results — prevents enormous payloads
    .map((item) => ({
      symbol: item.symbol,
      name: item.description,
      type: item.type,
      displaySymbol: item.displaySymbol,
    }));
};


// Recent company news, last 7 days.
const getNews = async (symbol) => {

  // Build a 7-day date window (Finnhub free tier: last 30 days max)
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 7);

  const fmt = (d) => d.toISOString().split('T')[0]; // YYYY-MM-DD

  const data = await callFinnhub('/company-news', {
    symbol: symbol.toUpperCase(),
    from: fmt(from),
    to: fmt(to),
  });

  if (!Array.isArray(data)) return [];

  return data
    .slice(0, 20) // Cap at 20 articles
    .map((article) => ({
      id: article.id,
      headline: article.headline,
      source: article.source,
      url: article.url,
      summary: article.summary,
      datetime: article.datetime, // Unix timestamp
      image: article.image || null,
    }));
};


// Historical candles for charting. Finnhub's own candle endpoint is a
// premium-only feature and 401s on the free tier, so this pulls from Yahoo
// Finance instead (free, no key needed) and maps Finnhub-style resolution
// strings onto Yahoo's interval format below.
const getCandles = async (symbol, resolution = 'D', from, to) => {

  const now   = Math.floor(Date.now() / 1000);
  const oneYearAgo = now - 365 * 24 * 60 * 60;

  const toTs   = to   ? Number(to)   : now;
  const fromTs = from ? Number(from) : oneYearAgo;

  // Finnhub resolution string → Yahoo Finance interval
  const intervalMap = {
    '1':  '1m',
    '5':  '5m',
    '15': '15m',
    '30': '30m',
    '60': '60m',
    'D':  '1d',
    'W':  '1wk',
    'M':  '1mo',
  };
  const interval = intervalMap[resolution] || '1d';

  try {
    const result = await yahooFinance.chart(symbol.toUpperCase(), {
      period1:  new Date(fromTs * 1000),
      period2:  new Date(toTs   * 1000),
      interval,
    }, {
      // Suppress yahoo-finance2 validation warnings that appear for some symbols
      validateResult: false,
    });

    const quotes = result?.quotes ?? [];

    if (quotes.length === 0) {
      const err = new Error(`No candle data for ${symbol.toUpperCase()} at resolution "${resolution}"`);
      err.statusCode = 404;
      throw err;
    }

    // Normalise to the same shape the rest of the codebase expects
    const candles = quotes
      .filter((q) => q.close !== null && q.close !== undefined)
      .map((q) => ({
        time:   Math.floor(new Date(q.date).getTime() / 1000), // Unix seconds
        open:   q.open,
        high:   q.high,
        low:    q.low,
        close:  q.close,
        volume: q.volume ?? 0,
      }));

    if (candles.length === 0) {
      const err = new Error(`No valid candle data for ${symbol.toUpperCase()}`);
      err.statusCode = 404;
      throw err;
    }

    return {
      symbol:     symbol.toUpperCase(),
      resolution,
      status:     'ok',
      candles,
    };

  } catch (err) {
    // Re-throw errors we already formatted
    if (err.statusCode) throw err;

    // Yahoo Finance errors (network, unknown symbol, etc.)
    console.error(`[stockService] getCandles failed for ${symbol}:`, err.message);
    const fetchErr = new Error(`Chart data unavailable for ${symbol.toUpperCase()} — ${err.message}`);
    fetchErr.statusCode = 502;
    throw fetchErr;
  }
};



// General market news, no symbol needed — category is one of "general",
// "forex", "crypto", or "merger".
const getMarketNews = async (category = 'general') => {

  const data = await callFinnhub('/news', { category });

  if (!Array.isArray(data)) return [];

  return data
    .filter((article) => article.headline && article.url)    // Skip empty articles
    .slice(0, 30)                                             // Cap at 30 articles
    .map((article) => ({
      id:       article.id,
      headline: article.headline,
      source:   article.source,
      url:      article.url,
      summary:  article.summary   || '',
      datetime: article.datetime,  // Unix timestamp (seconds)
      image:    article.image      || null,
      category: article.category  || category,
    }));
};


module.exports = { getQuote, getProfile, searchSymbols, getNews, getCandles, getMarketNews };
