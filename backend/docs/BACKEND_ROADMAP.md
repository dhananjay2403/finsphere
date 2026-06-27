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

## Milestone 4 — Authentication

**Status**: Not started

- [ ] User model (name, email, hashed password, balance)
- [ ] `POST /api/auth/register`
- [ ] `POST /api/auth/login`
- [ ] `GET /api/auth/me`
- [ ] JWT middleware (`middleware/auth.js`)
- [ ] Input validation (`middleware/validate.js`)

**Test**: Register → Login → Access `/auth/me` with token → Get 401 without token

---

## Milestone 3 — Stock Data Integration

**Status**: Not started

- [ ] External stock API adapter (`services/stockService.js`)
- [ ] `GET /api/stocks/search?q=`
- [ ] `GET /api/stocks/:symbol/quote`
- [ ] `GET /api/stocks/:symbol/chart?range=`
- [ ] Basic caching layer

**Test**: Search "AAPL" → Get quote → Get 1M chart data

---

## Milestone 4 — Trading Engine

**Status**: Not started

- [ ] Holding model
- [ ] Trade model
- [ ] `POST /api/trades/buy`
- [ ] `POST /api/trades/sell`
- [ ] `GET /api/trades/history`

**Test**: Buy 10 AAPL → Balance decreased → Holding exists → Sell 5 → Balance increased

---

## Milestone 5 — Portfolio & Dashboard APIs

**Status**: Not started

- [ ] `GET /api/portfolio`
- [ ] `GET /api/portfolio/summary`
- [ ] `GET /api/portfolio/allocation`
- [ ] `GET /api/portfolio/health`
- [ ] PortfolioSnapshot model + cron job
- [ ] `GET /api/portfolio/history`

**Test**: After trades, verify correct holdings, P&L, and allocation

---

## Milestone 6 — Watchlist

**Status**: Not started

- [ ] Watchlist model
- [ ] `GET /api/watchlist`
- [ ] `POST /api/watchlist`
- [ ] `DELETE /api/watchlist/:symbol`

**Test**: Add 3 symbols → List shows 3 → Remove 1 → List shows 2

---

## Milestone 7 — News Feed

**Status**: Not started

- [ ] External news API adapter (`services/newsService.js`)
- [ ] `GET /api/news?page=&limit=&q=`

**Test**: Fetch page 1 → Keyword filter → Verify pagination

---

## Milestone 8 — Learning Progress

**Status**: Not started

- [ ] LearningProgress model
- [ ] `GET /api/learn/progress`
- [ ] `POST /api/learn/:slug/complete`
- [ ] `POST /api/learn/:slug/quiz`

**Test**: Complete lesson → Progress shows completed → Submit quiz → Score persists

---

## Milestone 9 — Hardening & Polish

**Status**: Not started

- [ ] Input validation on all endpoints
- [ ] Rate limiting
- [ ] CORS production config
- [ ] API documentation (Swagger / Postman collection)
- [ ] Full end-to-end test

**Test**: Complete flow from register to trade to portfolio to learning
