# FinSphere Backend — Development Roadmap

This document tracks backend development progress across milestones.

Each milestone is independently testable. We do not proceed to the next milestone until the current one is reviewed and confirmed.

---

## Milestone 1 — Project Initialization ✅

**Status**: Complete

- [x] Initialize Node.js project
- [x] Install core dependencies (express, mongoose, dotenv, cors, morgan)
- [x] Create folder structure
- [x] Setup MongoDB connection (`config/db.js`)
- [x] Create Express server with health-check endpoint
- [x] Global error handler middleware
- [x] `.gitignore`, `.env.example`
- [x] Documentation (`docs/SETUP.md`, `docs/BACKEND_ROADMAP.md`)

**Test**: `GET /api/health` returns `{ success: true, message: "FinSphere API is running" }`

---

## Milestone 2 — Express Server Refinement ✅

**Status**: Complete

- [x] Payload size limit (`express.json({ limit: '10kb' })`)
- [x] Conditional morgan logging (dev only)
- [x] Graceful shutdown (SIGTERM / SIGINT handlers)
- [x] Store `app.listen()` server reference

**Test**: Health check, 404, and payload >10kb all return correct responses

---

## Milestone 3 — MongoDB Connection ✅

**Status**: Complete

- [x] Connection lifecycle event listeners (error, disconnected, reconnected)
- [x] MongoDB Atlas configuration in `.env.example`
- [x] Local + Atlas documentation in `docs/SETUP.md`
- [x] Test both local and Atlas connections

**Test**: Server connects to local MongoDB; `.env.example` includes Atlas template

---

## Milestone 4 — User Model ✅

**Status**: Complete

- [x] User schema (`models/User.js`)
- [x] Fields: name, email (unique, validated), password (select: false), balance (default: 100k)
- [x] Mongoose validation, timestamps, indexes

**Test**: Model loads without errors; schema validation works

---

## Milestone 5 — Authentication: Register ✅

**Status**: Complete

- [x] Password hashing (bcrypt, 10 salt rounds)
- [x] Request validation (`middleware/validate.js`, `express-validator`)
- [x] `POST /api/auth/register`
- [x] Duplicate email check (409)
- [x] User saved to MongoDB with hashed password
- [x] `maxlength: 128` on password field (M4 PR fix)

**Test**: Register → 201. Duplicate → 409. Invalid body → 422.

---

## Milestone 6 — Authentication: Login ✅

**Status**: Complete

- [x] `POST /api/auth/login`
- [x] `bcrypt.compare()` password verification
- [x] Generic 401 for both wrong email and wrong password
- [x] Login validation (presence only — avoids field enumeration hints)

**Test**: Valid → 200. Wrong password → 401. Unknown email → 401. Missing fields → 422.

---

## Milestone 7 — Authentication: JWT ✅

**Status**: Complete

- [x] `utils/generateToken.js`
- [x] JWT generated on successful login
- [x] Token contains only `{ id }` — no sensitive data
- [x] Token expiry via `JWT_EXPIRE` env var (default: 7d)
- [x] `JWT_SECRET` + `JWT_EXPIRE` added to `.env.example`

**Test**: Login → token returned. Decode confirms `{ id, iat, exp }` only.

---

## Milestone 8 — Authentication: Protected Routes ✅

**Status**: Complete

- [x] `middleware/authMiddleware.js` (`protect`)
- [x] Bearer token extraction from `Authorization` header
- [x] JWT verification + user attached to `req.user`
- [x] `GET /api/auth/me`

**Test**: Valid token → 200 user. No token → 401. Invalid token → 401. Wrong format → 401.

---

## Milestone 9 — Frontend Authentication Integration ✅

**Status**: Complete

- [x] `AuthContext.jsx` — validates stored token via `GET /api/auth/me` on app load
- [x] Expired/invalid tokens cleared automatically on startup
- [x] `authController.js` — token now returned on register (auto-login after signup)
- [x] `authService.js` — no changes required (already correct)
- [x] `api.js` — no changes required (Bearer injection + 401 redirect already in place)

**Test**: Register → auto-login. Page refresh → session restored via `/auth/me`. Expired token → cleared, redirect to login.

---

## Milestone 10 — Portfolio Data Models ✅

**Status**: Complete

- [x] `models/Holding.js` — current user positions, compound unique index `{userId, symbol}`
- [x] `models/Trade.js` — immutable trade ledger, `enum: ['buy', 'sell']`
- [x] `models/Watchlist.js` — 1-to-1 with embedded symbols array, unique index on `userId`
- [x] `models/PortfolioSnapshot.js` — daily value snapshots, compound unique index `{userId, date}`

**Test**: All 4 models load without errors; collections named correctly.

---

## Milestone 11 — Portfolio APIs ✅

**Status**: Complete

- [x] `controllers/portfolioController.js` — `getHoldings`, `getSummary`, `getCash`
- [x] `routes/portfolio.js` — `GET /api/portfolio/holdings`, `/summary`, `/cash`
- [x] All routes protected by `authMiddleware.protect`
- [x] `server.js` updated — `app.use('/api/portfolio', ...)`
- [x] Holdings response includes `totalInvested`, `currentPrice` (null), `unrealisedPnL` (null) placeholders
- [x] Summary response includes `cashBalance`, `totalInvested`, `currentValue`, `totalReturn`, `totalReturnPct`, `portfolioValue`
- [x] Mongoose `.aggregate()` used for `totalInvested` — single DB round-trip

**Note**: `currentValue` === `totalInvested` and `totalReturn` === 0 until live price feed
is integrated in Milestone 12 (Stock Data Integration).

**Test**: See Postman tests in docs/PORTFOLIO_API.md

---

## Milestone 12 — Paper Trading ✅

**Status**: Complete

- [x] `controllers/tradeController.js` — `buyStock`, `sellStock`, `getTradeHistory`
- [x] `routes/trades.js` — `POST /buy`, `POST /sell`, `GET /history`
- [x] `server.js` updated — `app.use('/api/trades', ...)`
- [x] Weighted average cost price on every buy
- [x] Position deleted when fully sold (`quantity === 0`)
- [x] Paginated trade history (`?page=&limit=&symbol=`)
- [x] express-validator on all mutating endpoints
- [x] Ordered atomic writes with balance guard (no negative balance)

**Test**: Buy 10 AAPL → balance decreases → Holding created → Buy 5 more → avgCostPrice recalculated → Sell 5 → quantity decremented → Sell 10 → Holding deleted → balance restored

---

## Milestone 13 — Watchlist ✅

**Status**: Complete

- [x] `controllers/watchlistController.js` — `getWatchlist`, `addToWatchlist`, `removeFromWatchlist`
- [x] `routes/watchlist.js` — `GET /`, `POST /`, `DELETE /:symbol`
- [x] `server.js` updated — `app.use('/api/watchlist', ...)`
- [x] Upsert on first add — no separate seed step required
- [x] Atomic duplicate prevention via `$not: $elemMatch` in the query filter
- [x] Atomic removal via `$pull` on the embedded symbols array
- [x] express-validator on body (add) and URL param (remove)
- [x] 409 on duplicate, 404 on remove-not-found

**Test**: GET empty → POST AAPL → POST MSFT → POST AAPL (409) → GET shows 2 → DELETE AAPL → GET shows 1 → DELETE GOOGL (404)

---

## Milestone 14 — Finnhub Backend Integration ✅

**Status**: Complete

- [x] `services/stockService.js` — provider-agnostic service layer (Finnhub adapter)
- [x] `controllers/stocksController.js` — thin delegation; no Finnhub knowledge
- [x] `routes/stocks.js` — 5 protected GET endpoints with express-validator
- [x] `server.js` updated — `app.use('/api/stocks', ...)`
- [x] `.env.example` updated — `FINNHUB_API_KEY` documented
- [x] `axios` installed as backend dependency
- [x] Centralised error handling — 404 (invalid symbol), 429 (rate limit), 502 (upstream error), 503 (network/key missing)

**Endpoints**: `GET /quote/:symbol`, `/profile/:symbol`, `/search?q=`, `/news/:symbol`, `/history/:symbol`

**Test**: GET /api/stocks/quote/AAPL → 200 with price data. GET /api/stocks/quote/INVALIDSYMBOL999 → 404.

---

## Milestone 15A — Trade Page Frontend Integration ✅

**Status**: Complete

### New files
- [x] `frontend/src/services/stockService.js` — thin wrappers for all 5 `/api/stocks/*` endpoints (`search`, `getQuote`, `getProfile`, `getHistory`, `getNews`)
- [x] `frontend/src/services/tradeService.js` — thin wrappers for `/api/trades/buy`, `/api/trades/sell`, `getHistory`

### TradePage integration (`frontend/src/pages/TradePage.jsx`)
- [x] **Live search** — debounced (400 ms) `GET /api/stocks/search?q=` with autocomplete dropdown; `ClickAwayListener` closes it; "No results" empty state
- [x] **Stock quote** — `GET /api/stocks/quote/:symbol` on result selection → populates symbol, price, change, day metrics
- [x] **Company profile** — `GET /api/stocks/profile/:symbol` → company name, exchange/country chips, logo avatar, market cap, industry
- [x] **Historical chart** — `GET /api/stocks/history/:symbol` with per-timeframe resolution mapping (1D→30min, 1W→60min, 1M/6M/1Y→Daily); recharts AreaChart with formatted time labels
- [x] **Buy order** — `POST /api/trades/buy` with symbol, name, quantity, pricePerShare; success/error feedback; cash balance auto-updates
- [x] **Sell order** — `POST /api/trades/sell`; same flow
- [x] **Cash Available** — `GET /api/portfolio/cash` on mount; updates after each trade
- [x] **Watchlist** — `GET /api/watchlist` on mount; `POST` / `DELETE` add/remove; clicking a watchlist item loads that stock; persists across sessions
- [x] **Recent Orders** — `GET /api/trades/history?limit=5` on mount; refreshes after each trade; buy/sell colour-coded rows
- [x] **Loading states** — `Skeleton` for all async sections; `CircularProgress` inside Buy/Sell buttons during execution
- [x] **Error handling** — `Alert` components for order errors, stock load errors, search empty state
- [x] **Estimated total** — derived client-side from `quantity × stock.price` (no backend call)
- [x] Entire original responsive layout preserved — no UI redesign

**Test**:
1. Search "AAPL" → dropdown appears → select → stock card populates with live price
2. Switch timeframes → chart re-fetches with correct resolution
3. Enter quantity 5 → estimated total shows → click Buy → success alert → cash decreases → order appears in Recent Orders
4. Click Sell on a held stock → success / "Insufficient shares" error handled
5. Add stock to Watchlist → persists on page refresh → Remove works
6. Refresh page → watchlist, cash balance, recent orders all reload from backend

---

## Milestone 15B — Dashboard & Portfolio Frontend Integration ✅

**Status**: Complete

### New files
- [x] `frontend/src/services/portfolioService.js` — thin wrappers for all 3 `/api/portfolio/*` endpoints (`getHoldings`, `getSummary`, `getCash`)

### Dashboard integration (`frontend/src/pages/Dashboard.jsx`)
- [x] **Portfolio Value KPI** — `GET /api/portfolio/summary` → `portfolioValue`
- [x] **Total Gain / Loss KPI** — `summary.totalReturn` + `summary.totalReturnPct`; badge colour driven by sign
- [x] **Total Invested KPI** — `summary.totalInvested` + holdings count (replaces "Today's Change" placeholder)
- [x] **Total Transactions KPI** — `GET /api/trades/history?limit=100` → `total count`
- [x] **Portfolio Performance chart** — derived from real trade history: cumulative portfolio value plotted per trade; empty state when no trades exist
- [x] **Allocation panel** — top 3 holdings by `totalInvested` weight; empty state when no holdings
- [x] **Portfolio Health Score** — computed client-side from 4 real metrics: Diversification (holding count), Cash Management (cash ratio vs 30% ideal), Activity (trade count), Concentration (inverse max-weight)
- [x] **Investment Challenge** — driven by unique trading days in trade history; "Active trading days" / "Total trades" / "Completion"
- [x] **Recent Transactions** — `GET /api/trades/history?limit=5` → colour-coded buy/sell rows; empty state when no trades
- [x] **Skeleton loaders** — all 4 KPI cards, chart, allocation panel, health score, challenge, and recent transactions have loading skeletons
- [x] All fetches run in parallel with `Promise.allSettled` — one section failing does not break others
- [x] Original responsive layout preserved — no UI redesign

### Portfolio integration (`frontend/src/pages/Portfolio.jsx`)
- [x] **Holdings table** — `GET /api/portfolio/holdings` → symbol, name, qty, avg cost, invested columns; "In development" chip removed; empty state when no holdings
- [x] **Cash Available** — `GET /api/portfolio/summary` → `cashBalance`
- [x] **P&L Summary** — `totalInvested`, `portfolioValue`, `totalReturn` + `totalReturnPct`; Skeletons resolve to real values
- [x] **Portfolio Breakdown stacked bar** — computed from real holdings by `totalInvested` weight; up to 6 named + "Other" bucket
- [x] **Largest Position card** — replaces hard-coded "Top Performer AAPL +12.4%" with real largest holding by invested amount
- [x] **Allocation donut (PieChart)** — populated from real holdings; empty state when no holdings
- [x] **Skeleton loaders** — holdings table, all right-column cards, donut chart
- [x] `Promise.allSettled` — holdings and summary fetched in parallel; each section degrades independently
- [x] Original responsive layout preserved — no UI redesign

**Test**:
1. Load `/dashboard` → all 4 KPI cards show live data; skeletons resolve
2. Execute a trade on Trade page → return to Dashboard → Portfolio Value, Gain/Loss, and Recent Transactions update
3. Dashboard allocation panel shows real ticker symbols (not hard-coded sectors)
4. Health score reflects actual diversification: buying 1 stock → low Diversification score; 5+ stocks → higher
5. Challenge counter increments each unique day a trade is placed
6. Load `/portfolio` → Holdings table shows real positions; "In development" chip gone
7. P&L Summary rows show real numbers from backend (not Skeletons)
8. Portfolio Breakdown bar and Allocation donut reflect real position weights
9. Largest Position card shows actual top holding, not hard-coded AAPL

---

## Milestone 15C — News Integration, Bug Fixes & Cleanup ✅

**Status**: Complete

### New endpoints
- [x] `GET /api/stocks/market-news?category=general` — general Finnhub market news (no symbol required)
  - Supported categories: `general`, `forex`, `crypto`, `merger`
  - Returns up to 30 articles: `{ id, headline, source, url, summary, datetime, image, category }`

### Backend changes
- [x] `backend/services/stockService.js` — added `getMarketNews(category)` method
- [x] `backend/controllers/stocksController.js` — added `marketNews` controller action
- [x] `backend/routes/stocks.js` — registered `GET /market-news` route
- [x] `backend/server.js` — changed `app.listen(PORT)` to `app.listen(PORT, '0.0.0.0')` for LAN access

### Frontend service changes
- [x] `frontend/src/services/stockService.js` — added `getMarketNews(category)` method

### News page (`frontend/src/pages/News.jsx`)
- [x] Live Finnhub market news grid (replaces static skeleton placeholders)
- [x] Category filter tabs: General / Forex / Crypto / Mergers — re-fetches on change
- [x] Clickable news cards open original article in a new tab
- [x] Thumbnail image with fallback to `NewspaperIcon` on load error
- [x] Source chip overlaid on thumbnail
- [x] Relative timestamp via `timeAgo()` helper
- [x] `SKELETON_COUNT=9` animated loading cards while fetching
- [x] Error `Alert` if endpoint fails
- [x] Empty state when API returns 0 articles
- [x] Article count badge in header
- [x] "In development" chip and "coming soon" banner removed

### Mobile / LAN access bug fix
- Root cause: `app.listen(PORT)` defaults to `127.0.0.1` — LAN devices cannot reach it.
  `VITE_API_URL=http://localhost:5001/api` resolves to the *client* device, not the server Mac.
- [x] `backend/server.js` — listen on `0.0.0.0` so port 5001 is reachable from LAN
- [x] `frontend/vite.config.js` — added `host: true` so `--host` flag actually exposes dev server
- [x] `frontend/.env` — documented LAN switchover (uncomment IP line, restart dev server)

### Portfolio Value clarification
- Analysis: Backend `portfolioValue = cashBalance + totalInvested` is **mathematically correct**.
  When you buy $10k of stock: cash drops $10k, holdings cost-basis rises $10k → net = $100k (unchanged).
  Portfolio value only changes when market prices move. Since Finnhub live prices are not yet injected
  into `GET /portfolio/holdings`, P&L stays $0 — this is **honest, not a bug**.
- Resolution: Dashboard KPI label changed from "Today's Change" (misleading) to "Total Invested"
  which shows the actual invested capital — a more useful metric without a live price feed.

### Cleanup
- [x] All `INITIAL_BALANCE` usages removed from page components (constants.js still exports it for reference)
- [x] All hardcoded mock arrays removed from Dashboard and Portfolio (M15B)
- [x] Dead "In development" chips removed
- [x] Static placeholder captions removed

**Test**:
1. Load `/news` → 9 skeleton cards → real articles appear → clicking opens article in new tab
2. Click "Forex" category → news re-fetches; "General" tab restores
3. Open app from LAN device after IP swap in `.env` and dev server restart → login works
4. Dashboard "Total Invested" KPI shows cost basis; "Portfolio Value" = cash + invested
5. Backend restart → `✓ Server running on 0.0.0.0:5001` in logs