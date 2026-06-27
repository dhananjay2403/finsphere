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
