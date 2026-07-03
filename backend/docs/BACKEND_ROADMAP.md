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

---

## Milestone 15D — Production Deployment & Authentication Stability ✅

**Status**: Complete

> **Correction (2026-07-03 deployment audit)**: this milestone's "Changes" table below overstated what actually shipped in commit `f7ffff7`. `frontend/.env.production` was never committed (it's git-ignored) and the CORS origin whitelist / `CORS_ORIGIN` env var described in the CORS row and in `backend/.env.example` were never implemented — `backend/server.js` kept a bare `app.use(cors())` wildcard until the fix below. Both gaps are now closed: `backend/server.js` reads `CORS_ORIGIN` (comma-separated allowlist, defaults to `*` if unset) and `render.yaml` declares the `CORS_ORIGIN` env var; `frontend/src/services/api.js` now throws at load time if `VITE_API_URL` is missing from a production build instead of silently falling back to `localhost`. The actual root cause of the auth regression this milestone was meant to prevent was `VITE_API_URL` never being reliably present at Vercel build time — see the production deployment checklist below, which still needs to be walked through against the live dashboards.

### Root cause analysis

#### Mobile browser auth failure
- **Cause 1**: `ProtectedRoute.jsx` had `const DEMO_MODE = true` — the entire auth guard was bypassed unconditionally. `isAuthenticated` was never checked.
- **Cause 2**: `LoginPage.jsx` had `handleDemoLogin()` which stored `mock_jwt_token` in localStorage. On the next page load, `AuthContext` called `authService.getProfile()` which sent this fake token to the backend and received a 401, immediately clearing the session — any navigation to a protected page would redirect to `/login`.
- **Cause 3**: The `?demo=true` auto-login `useEffect` triggered `handleDemoLogin()` silently on mobile when someone used a URL with that query string.

#### Refresh / direct URL failure
- **Cause**: No `vercel.json` was present. Vercel serves a static file tree — navigating to `/dashboard` directly requests a file at that path which doesn't exist → Vercel 404. The React SPA never loads.

#### Production API URL
- **Cause**: `VITE_API_URL=http://localhost:5001/api` (in `.env`) is baked into the Vite bundle at build time. On a deployed Vercel frontend, all API calls resolve to `localhost` on the *user's* machine — all requests fail silently.

#### CORS
- **Cause**: `app.use(cors())` (wildcard) is permissive but not secure for production. Replaced with an explicit origin whitelist.

### Changes

| File | Change |
|---|---|
| `frontend/src/routes/ProtectedRoute.jsx` | Removed `DEMO_MODE = true` bypass; restored real `isAuthenticated` guard |
| `frontend/src/pages/LoginPage.jsx` | Removed `handleDemoLogin`, `?demo=true` useEffect, and "Explore Demo" button |
| `frontend/vercel.json` | NEW — SPA rewrite: all paths → `index.html` |
| `frontend/.env.production` | NEW — `VITE_API_URL=https://finsphere-api.onrender.com/api` |
| `render.yaml` | NEW — Render service manifest (root level) |
| `backend/server.js` | Replaced wildcard CORS with origin whitelist; `CORS_ORIGIN` env var for production |
| `backend/.env.example` | Added `CORS_ORIGIN` documentation |

### Authentication flow (post-fix)

```
User visits /dashboard (refresh or direct URL)
  → Vercel rewrites to index.html                     [vercel.json]
  → React app boots, AuthContext runs useEffect
  → localStorage.getItem('finsphere_token') found
  → authService.getProfile() → GET /api/auth/me       [real JWT validation]
  → 200 OK → setUser(freshUser), setToken(token)
  → isLoading: false, isAuthenticated: true
  → ProtectedRoute renders children                   [real guard]
  → Dashboard renders with live data

User visits /dashboard (no token / new device)
  → Same rewrite → app boots → no token in localStorage
  → isLoading: false, isAuthenticated: false
  → ProtectedRoute redirects to /login with state={{ from: '/dashboard' }}
  → User logs in → login(user, token) stores real JWT
  → navigate('/dashboard', { replace: true })
```

### Production deployment checklist

#### Vercel (frontend)
- [ ] Connect GitHub repo → select `frontend/` as root directory
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Add environment variable in Vercel dashboard: `VITE_API_URL=https://finsphere-api.onrender.com/api`
- [ ] (Alternatively, `frontend/.env.production` is committed and Vite picks it up at build time)
- [ ] After deploy, note the Vercel URL (e.g. `https://finsphere.vercel.app`)

#### Render (backend)
- [ ] Connect GitHub repo → Render detects `render.yaml` automatically
- [ ] In Render dashboard, set secrets: `MONGO_URI`, `JWT_SECRET`, `FINNHUB_API_KEY`
- [ ] Set `CORS_ORIGIN=https://finsphere.vercel.app` (must match Vercel URL exactly)
- [ ] Note the Render service URL (e.g. `https://finsphere-api.onrender.com`)
- [ ] Update `VITE_API_URL` in Vercel environment variables to match the Render URL

**Test**:
1. Deploy both services → open Vercel URL → login with real credentials → redirect to dashboard
2. Refresh `/dashboard` → page reloads correctly (no 404)
3. Navigate to `/portfolio` directly → page loads (no 404)
4. Open on mobile browser → login → protected routes accessible
5. Check Render logs: `✓ Server running on 0.0.0.0:10000 [production]`
6. Open browser devtools → Network tab → confirm API calls go to Render URL, not localhost

---

## Milestone 15D Revision — Stable Authentication & Demo Login ✅

**Status**: Complete

### Regressions introduced by original M15D (now fixed)

| Regression | Root cause | Fix |
|---|---|---|
| Sign-in/Sign-up broken on mobile/LAN | `VITE_API_URL=http://localhost:5001/api` baked into bundle; `localhost` resolves to the client device, not the Mac | Replaced with Vite proxy + relative `VITE_API_URL=/api` |
| Demo login removed | `handleDemoLogin` and "Explore Demo" button deleted | Restored with real JWT flow |
| DEMO_MODE confusion | `DEMO_MODE = true` short-circuited real auth | Removed entirely; demo users get real JWTs |

### Root fix: Vite development proxy

**Problem**: Any device accessing the app over LAN could load the frontend (Vite exposed on all interfaces via `--host`) but all API calls failed because `http://localhost:5001/api` in the bundle resolves to the device's own localhost, not the server Mac.

**Solution**: Vite proxy in `vite.config.js`:
```js
proxy: {
  '/api': {
    target: 'http://localhost:5001',
    changeOrigin: true,
  },
},
```
And `VITE_API_URL=/api` in `.env`. All API requests go to Vite first, which proxies to `localhost:5001`. Since Vite runs on the Mac, `localhost` always resolves correctly regardless of the client device.

### Demo login — real JWT flow

The "Explore Demo" button now calls the real backend to obtain a legitimate JWT:

1. `POST /api/auth/login` with `demo@finsphere.com` / `Demo@finsphere1`
2. If 404/network-error (account missing), `POST /api/auth/register` then login
3. Stores real JWT → navigates to dashboard
4. Demo user can: search stocks, trade, manage watchlist, see live portfolio

The demo account (`demo@finsphere.com`) was created in Atlas on first button click. Its trades and balance persist in the shared demo account. Session persists for 7 days (JWT expiry).

### DEMO_MODE removed

`ProtectedRoute.jsx` previously had `const DEMO_MODE = true` which bypassed all auth checks. This is now removed. All users (real and demo) are authenticated via JWT.

### Changes

| File | Change |
|---|---|
| `frontend/vite.config.js` | Added `server.proxy: { '/api': { target: 'http://localhost:5001' } }` |
| `frontend/.env` | `VITE_API_URL=http://localhost:5001/api` → `VITE_API_URL=/api` |
| `frontend/src/pages/LoginPage.jsx` | `handleDemoLogin` now calls real backend; async with spinner |
| `frontend/src/routes/ProtectedRoute.jsx` | `DEMO_MODE` removed; real auth guard active for all users |

### Verified

```
✓ GET  http://localhost:3000/api/health  → 200 { success: true }     [proxy works]
✓ POST http://localhost:3000/api/auth/register → 201 { token, user } [sign-up works]
✓ POST http://localhost:3000/api/auth/login    → 200 { token, user } [sign-in works]
✓ POST /login (wrong password)                → 401 Invalid creds    [error handling works]
✓ GET  http://localhost:3000/api/auth/me       → 200 { user }        [JWT validation works]
✓ Demo account auto-registered & JWT obtained → demo user is full citizen
```

**Test on mobile**: Open `http://192.168.1.8:3000` on any LAN device → login works → protected routes work → stock search, trades, portfolio all function correctly.

---

## Milestone 15E — Trading, Live Market Data & Dashboard Accuracy ✅

**Status**: Complete

### Root Causes Resolved

| Issue | Was | Now |
|---|---|---|
| Portfolio Value stuck at $100k | `currentValue = totalInvested` (hardcoded placeholder) | `currentValue = Σ(qty × livePrice)` via Finnhub |
| Holdings show all-null prices | `currentPrice: null` hardcoded | Enriched from `stockService.getQuote()` in parallel |
| P&L always zero | `totalReturn = currentValue - totalInvested` = 0 (same value) | Real: `totalReturn = Σ(qty × livePrice) - Σ(qty × avgCost)` |
| Chart shows flat $100k line | Dead placeholder: `value: parseFloat((INITIAL).toFixed(2))` | Primary: real `PortfolioSnapshot` data; fallback: trade-math approximation |

### Architecture

**`portfolioController.js` refactored into:**

```
fetchQuotes(holdings)
  → Promise.allSettled(holdings.map(h => stockService.getQuote(h.symbol)))
  → Logs individual failures; never fails the whole response

takeSnapshot(userId, cashBalance, holdings, quoteResults)
  → Isolated write function; can be moved to cron/trigger without API change
  → Upserts PortfolioSnapshot for today (idempotent)

getHoldings  → enriches with currentPrice, currentValue, unrealisedPnL, unrealisedPnLPct
getSummary   → computes from live prices; falls back to cost for failed quotes
getCash      → unchanged (no price fetch needed)
getSnapshots → calls takeSnapshot (fire-and-forget, non-fatal), returns 90-day history
```

### New Endpoint

`GET /api/portfolio/snapshots` — returns last 90 days of `PortfolioSnapshot` records:
```json
{
  "success": true,
  "count": 1,
  "data": [
    { "date": "2026-06-29T00:00:00.000Z", "totalValue": 99870.24, "cashBalance": 99432.44 }
  ]
}
```

### Files Modified

| File | Change |
|---|---|
| `backend/controllers/portfolioController.js` | Full rewrite — live prices, isolated snapshot writer |
| `backend/routes/portfolio.js` | Added `GET /snapshots` route |
| `frontend/src/services/portfolioService.js` | Added `getSnapshots()` method |
| `frontend/src/pages/Dashboard.jsx` | `snapshots` state, `getSnapshots()` in fetchAll, `buildPerformanceChart` uses real data |

### Design Decisions

- **`Promise.allSettled` not `Promise.all`**: one Finnhub timeout never crashes the entire portfolio response. Failed symbols fall back to cost price in summary, null in holdings.
- **`takeSnapshot` is isolated**: the function is decoupled from the HTTP handler. Moving it to a cron job means changing only one line in a future jobs file — the function signature and schema stay the same.
- **Snapshot on GET**: simple and correct for a paper-trading app. The snapshot is upserted (not inserted), so calling the endpoint 100 times per day produces exactly one document per calendar day.

### Verified

```
✓ GET /api/portfolio/summary      → portfolioValue = cashBalance + live market value
✓ GET /api/portfolio/holdings     → currentPrice, currentValue, unrealisedPnL all non-null
✓ GET /api/portfolio/snapshots    → writes today's snapshot; returns array
✓ Buy 2 AAPL at live price $283.78 → holdings enriched, balance debited correctly
✓ Summary after buy: portfolioValue = $99,432.44 + $567.56 = $100,000 (exactly, just bought)
✓ Snapshot count: 1 entry for today's date
```

### Commit Message

```
feat(portfolio): live Finnhub prices for holdings/summary, portfolio snapshots for chart
```

---

## Milestone 15F — Trading UI, Stock Charts & News Experience ✅

**Status**: Complete

### Root Causes Resolved

| Issue | Root cause | Fix |
|---|---|---|
| Charts show "data unavailable" for every timeframe | Finnhub `/stock/candle` returns 401/403 on the free tier (premium-only endpoint) | Replaced with `yahoo-finance2` (free, no API key, same return shape) |
| Search dropdown stays open after selecting a stock | `setSearchQuery(result.symbol)` triggers the debounced search `useEffect` which calls `setShowDropdown(true)` 400ms later | Added `suppressDropdownRef` — suppresses the next auto-search dropdown open after a programmatic selection |
| Broken news images leave empty card area | `onError` hid the `<img>` tag but did not show the icon fallback | Added `imgFailed` state to `NewsCard`; on error, `hasImage` becomes `false` and the `NewspaperIcon` fallback renders naturally |

### Chart Fix — Full Lifecycle Trace

```
Frontend (TradePage.jsx)
  loadChart(symbol, '1M')
  → stockService.getHistory('AAPL', 'D', fromTs, nowTs)
  → GET /api/stocks/history/AAPL?resolution=D&from=...&to=...

Backend (stocksController.js → stockService.js)
  → getCandles('AAPL', 'D', fromTs, toTs)
  → callFinnhub('/stock/candle', { ... })         ← 401/403 from Finnhub
  → throw Error('Invalid or missing Finnhub API key') ← wrong error label, real cause: plan restriction

Fix:
  → yahooFinance.chart('AAPL', { period1, period2, interval: '1d' })
  → { symbol, resolution, status: 'ok', candles: [{ time, open, high, low, close, volume }] }
  → Same shape as before — controller, route, and frontend unchanged
```

### Resolution Mapping

| UI timeframe | Frontend resolution | Yahoo Finance interval |
|---|---|---|
| 1D | `'30'` | `'30m'` |
| 1W | `'60'` | `'60m'` |
| 1M | `'D'`  | `'1d'`  |
| 6M | `'D'`  | `'1d'`  |
| 1Y | `'D'`  | `'1d'`  |

### New Dependency

`yahoo-finance2@3.15.3` (backend-only)
- No API key required
- Free with no rate limits beyond Yahoo's standard throttling
- Installation: `npm install yahoo-finance2`

### Files Modified

| File | Change |
|---|---|
| `backend/services/stockService.js` | `getCandles` replaced with `yahoo-finance2` implementation; same function signature and return shape |
| `frontend/src/pages/TradePage.jsx` | `suppressDropdownRef` + `clearTimeout` in `handleSelectStock`; dropdown check in debounced effect |
| `frontend/src/pages/News.jsx` | `imgFailed` state in `NewsCard`; icon fallback shown on image error |

### Verified

```
✓ GET /api/stocks/history/AAPL?resolution=D&from=...  → 19 daily candles (1M)
✓ GET /api/stocks/history/AAPL?resolution=30&from=... → 9 intraday candles (1D)
✓ GET /api/stocks/history/MSFT?resolution=D&from=...  → 250 daily candles (1Y)
✓ All five timeframes (1D/1W/1M/6M/1Y) return real data
✓ Quotes, profile, search, news still use Finnhub (unchanged)
```

### Commit Message

```
feat(charts): replace Finnhub candles (premium) with yahoo-finance2; fix dropdown, news images
```

---

## Milestone 15G — Portfolio Health Audit & Production Polish ✅

**Status**: Complete

### Health Score Audit

| Metric | Formula (before) | Issue | Formula (after) |
|---|---|---|---|
| **Diversification** | `min(100, (count/10) × 100)` | ✅ Sound | Unchanged |
| **Cash Management** | `max(0, 100 - abs(cashRatio-0.3) × 200)` | ❌ A fresh account with 100% cash (cashRatio=1.0) → delta=0.7 → score=100-140 → clamped to **0** despite having no risk | Now measures `investedRatio` instead. Ideal band 20–50% invested. `count===0` → explicit 0 (not started) |
| **Activity** | `min(100, (tradeCount/20) × 100)` | ✅ Sound | Unchanged |
| **Concentration** | `max(0, (1 - maxWeight) × 100 × 1.25)` | ⚠️ Multiplier could exceed 100 before clamp; also asymmetric with empty-state treatment | Added `min(100, …)` ceiling; multiplier reduced to ×1.2 |

**Cash Management math (fixed):**
```
investedRatio = totalInvested / portfolioValue
cashDelta = |investedRatio - 0.35|    ← 35% deployed = ideal
cashScore = max(0, 100 - cashDelta × 250)
```
- 35% deployed → delta=0 → 100 ✅
- 0% deployed (fresh) → explicit 0 ✅  
- 100% deployed → delta=0.65 → score=max(0,100-162)=0 ✅

### Other Fixes

| File | Fix |
|---|---|
| `Dashboard.jsx` | Performance chart chip label now shows "N days" when using snapshots instead of "N trades" |
| `Portfolio.jsx` | `findTopHolder` now ranks by `currentValue` (live market value from M15E) when available, falls back to `totalInvested` only on quote failure |

### Files Modified

| File | Change |
|---|---|
| `frontend/src/pages/Dashboard.jsx` | `computeHealthScore` Cash Management fix + Concentration ceiling; chart chip label |
| `frontend/src/pages/Portfolio.jsx` | `findTopHolder` sorts by live `currentValue` |

### No Changes Needed

| Area | Status |
|---|---|
| `formatCurrency` | ✅ Correct — uses Intl.NumberFormat, 2 decimal places, USD |
| `formatPercent` | ✅ Correct — sign-aware, 2 decimal places |
| Portfolio P&L Summary formatting | ✅ Correct — consistent `formatCurrency` + `formatPercent` |
| Loading states (skeletons) | ✅ Present on all data sections |
| Error states | ✅ Alert components shown on fetch failure |
| Empty states | ✅ Descriptive empty-state panels on all sections |
| KPI card responsive sizing | ✅ `xs: 6 sm: 6 md: 3` grid + responsive font sizes |

### Commit Message

```
fix(dashboard): correct Cash Management health score; chart label; live price for top holder

---

## Milestone 15H — Portfolio Stability & UI Polish ✅

**Status**: Complete

### Objective 1 — Portfolio Value Reset Bug (Root Cause Fixed)

**Root cause trace:**

```
Dashboard mounts
  → fetchAll() fires 5 parallel requests:
      getSummary()     → fetchQuotes() for all holdings
      getHoldings()    → fetchQuotes() for all holdings
      getSnapshots()   → fetchQuotes() for all holdings   ← third concurrent batch

Finnhub free tier rate-limits the third batch (429 / timeout)
  → Promise.allSettled catches silently
  → ALL quotes fall back to avgCostPrice
  → takeSnapshot() computes:
      totalValue = cashBalance + sum(qty × avgCostPrice)  ≈ $100,000

findOneAndUpdate({ upsert: true }, { totalValue, cashBalance })
  → OVERWRITES today's accurate snapshot (written earlier)
  → Chart now shows degraded value ≈ $100,000 "reset"
```

**Fix — `takeSnapshot()` now accepts `quotesSucceeded` flag:**

| `quotesSucceeded` | MongoDB operation | Effect |
|---|---|---|
| `true` (≥1 live quote) | `$set { totalValue, cashBalance }` | Writes accurate real-time value |
| `false` (all quotes failed) | `$setOnInsert { totalValue, cashBalance }` | Only creates new document; **never overwrites** an existing accurate snapshot |

No workarounds, no polling changes, no rate-limit bypass — the actual write semantics are fixed.

---

### Objective 2 — Dashboard Card Height Equalization

Both "Portfolio Health Score" and "Investment Challenge" `<Paper>` elements now have:
```
height: '100%', display: 'flex', flexDirection: 'column'
```
The MUI `<Grid>` row stretches both to equal height automatically, producing a symmetrical layout.

---

### Objective 3 — Portfolio Page Desktop Redesign

Replaced 2-column (8/4) layout with balanced 3-column desktop grid:

| Breakpoint | Left | Middle | Right |
|---|---|---|---|
| `lg` | `5/12` Holdings table | `3/12` Cash + P&L | `4/12` Breakdown + Allocation + Largest |
| `md` | `12/12` Holdings | `6/12` Cash + P&L | `6/12` Breakdown + Allocation + Largest |
| `xs/sm` | Single column | Single column | Single column |

- Allocation card placed above Largest Position (as specified)
- Holdings table removed `maxHeight: 480` / `overflowY: auto` constraint
- Common `HoldingsTableHeader` sub-component extracted to avoid duplication

---

### Objective 4 — News Fallback Thumbnails

The existing Finnhub provider is kept. The `NewspaperIcon` placeholder replaced with:
- Warm gradient background (`#F0E9E2 → #D4C5BA`)
- Source initial monogram in a circular badge (e.g. "R" for Reuters)
- Small source name label below

Card dimensions remain fixed; layout is fully consistent whether or not a thumbnail loads.

---

### Objective 5 — Transactions Page

New dedicated `/transactions` route and page:

- Full trade history via existing `GET /api/trades/history` (no new backend API)
- Desktop: 7-column grid table (Date · Symbol · Company · Type · Qty · Price · Total)
- Mobile: compact card layout with icon, symbol, type, total
- Pagination: Prev/Next buttons, page counter, respects backend `totalPages`
- Back-to-Dashboard breadcrumb button — no Navbar entry added

---

### Files Modified

| File | Change |
|---|---|
| `backend/controllers/portfolioController.js` | `takeSnapshot()` — `quotesSucceeded` flag; `$setOnInsert` for degraded snapshots |
| `frontend/src/pages/Dashboard.jsx` | Health/Challenge card `height:100%`; "View All" → `ROUTES.TRANSACTIONS` |
| `frontend/src/pages/Portfolio.jsx` | Full 3-column desktop redesign |
| `frontend/src/pages/News.jsx` | Gradient + monogram fallback thumbnail |
| `frontend/src/pages/Transactions.jsx` | **[NEW]** Complete transactions page |
| `frontend/src/utils/constants.js` | Added `TRANSACTIONS: '/transactions'` |
| `frontend/src/routes/AppRoutes.jsx` | Registered `/transactions` route under ProtectedRoute |

### No Changes

| Area | Reason |
|---|---|
| Navbar | Transactions accessible via Dashboard "View All"; no extra nav tab |
| Backend trade API | Existing `GET /api/trades/history` reused as-is |
| News provider (Finnhub) | Provider retained; only fallback UI improved |
| Auth, Docker, Redis, CI/CD | Out of scope for this milestone |

### Responsive Verification

| Page | xs | sm | md | lg |
|---|---|---|---|---|
| Dashboard | ✓ single col KPIs | ✓ | ✓ chart+alloc | ✓ 3-wide |
| Portfolio | ✓ stack | ✓ stack | ✓ Holdings full + 2 side cols | ✓ 3-col |
| Transactions | ✓ cards | ✓ cards | ✓ table | ✓ table |
| News | ✓ 1-col | ✓ 2-col | ✓ 3-col | ✓ 3-col |

### Commit Message

```
fix(portfolio): prevent snapshot overwrite on Finnhub rate-limit; add Transactions page; polish dashboard & portfolio layout

- portfolioController: takeSnapshot() uses $setOnInsert when all quotes fail — prevents
  degraded (~$100k) value from overwriting an accurate same-day snapshot
- Dashboard: Health Score + Challenge cards equalised to height:100%; View All → /transactions
- Portfolio: 3-column desktop layout (Holdings | Cash+P&L | Breakdown+Allocation+Largest)
- News: gradient + source-initial monogram replaces plain icon fallback
- Transactions: new /transactions page with desktop table, mobile cards, pagination
- constants.js + AppRoutes.jsx: TRANSACTIONS route registered
```

---

## Milestone 15I — Final UI Refinement & Layout Polish ✅

**Status**: Complete  
**Scope**: Frontend only — no backend changes.

### Objective 1 — Health Score Card Spacing (`Dashboard.jsx`)

| Property | Before | After |
|---|---|---|
| Progress bar `mb` | `2.5` | `2` |
| Sub-metric Grid `spacing` | `1` | `1.5` |
| Sub-metric box `p` | `1.5` | `2` |

The tighter progress-bar margin combined with slightly more spacious metric boxes redistributes the available height more naturally, eliminating the dead space beneath the 2×2 grid.

---

### Objective 2 — Transactions Desktop Table (`Transactions.jsx`)

| Property | Before | After |
|---|---|---|
| Grid template | `120px 80px 1fr 80px 60px 100px 110px` | `140px 72px 1fr 82px 64px 110px 120px` |
| Column gap | `gap: 1` | `gap: 2` |
| Row / header padding | `px: 2, py: 1.5` | `px: 3, py: 2` |
| Hover state | none | `rgba(122, 62, 72, 0.03)` subtle tint |
| Sticky header | no | `position: sticky; top: 0; z-index: 1` |
| Numeric alignment | `textAlign: 'right'` | + `fontVariantNumeric: 'tabular-nums'` |
| Page header | left-aligned | centered |

---

### Objective 3 — Portfolio Refinement (`Portfolio.jsx`)

- **Removed**: Largest Position card, `findTopHolder`, `topHolder` variable, `TrendingUpIcon` import
- **Reordered right column**: Allocation chart now appears **above** Portfolio Breakdown
- **P&L Summary**: `flex: 1` removed — card now shrink-wraps its three rows
- **Page header**: centered
- Bundle size: 1079 kB → 1078 kB (dead code removed)

---

### Objective 4 — News Page Header (`News.jsx`)

- Title + subtitle: centered (`textAlign: 'center'`)
- Article count chip: moved below subtitle (no longer floated right)
- Category filter chips: `justifyContent: 'center'`

---

### Objective 5 — LearningHub Header (`LearningHub.jsx`)

- Title + subtitle: centered (`textAlign: 'center'`)
- Difficulty filter chips: `justifyContent: 'center'` (previously `flex-start` on desktop)

---

### Objective 6 — Trade Page Header (`TradePage.jsx`)

- Title + subtitle: centered
- The flex space-between wrapper was simplified to a plain centered Box
- No other Trade page changes

---

### Files Modified

| File | Change |
|---|---|
| `frontend/src/pages/Dashboard.jsx` | Health Score metric spacing |
| `frontend/src/pages/Transactions.jsx` | Centered header; wider/spacious table; hover; sticky header; tabular-nums |
| `frontend/src/pages/Portfolio.jsx` | Removed Largest Position; Allocation above Breakdown; P&L shrink-wraps; centered header |
| `frontend/src/pages/News.jsx` | Centered header + filter chips |
| `frontend/src/pages/LearningHub.jsx` | Centered header + filter chips |
| `frontend/src/pages/TradePage.jsx` | Centered header only |

### No Changes

| Area | Reason |
|---|---|
| Dashboard page | Left-aligned as specified |
| Backend | No backend changes in this milestone |
| Mobile layouts | Preserved — all xs/sm stacks unchanged |
| Trade page content | Only header centered; rest unchanged |
| News provider | Finnhub retained; M15H fallback accepted |

### Build Verification

```
✓ 1813 modules transformed
✓ 0 errors
Bundle: 1,078.11 kB (−1.69 kB vs M15H)
```

### Commit Message

```
style(ui): milestone 15I — center page headers; polish Transactions table; refine Portfolio layout

- Dashboard: Health Score metric boxes p:1.5→2, spacing:1→1.5, progress bar mb:2.5→2
- Transactions: centered header; TABLE_GRID widened; gap:1→2; px:2→3 py:1.5→2;
  subtle hover; sticky header; tabular-nums on numeric cols
- Portfolio: remove Largest Position card; Allocation above Breakdown; P&L
  shrink-wraps (flex:1 removed); centered header; TrendingUpIcon cleaned up
- News: centered title + chip count + category filters
- LearningHub: centered title + difficulty filters
- Trade: centered title + subtitle only
```