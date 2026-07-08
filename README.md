<div align="center">

# FinSphere

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=nodedotjs&logoColor=white) ![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white) ![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white) ![Redis](https://img.shields.io/badge/Redis-Upstash-DC382D?logo=redis&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white) ![Vercel](https://img.shields.io/badge/Vercel-Frontend-000000?logo=vercel&logoColor=white) ![Render](https://img.shields.io/badge/Render-Backend-46E3B7?logo=render&logoColor=white)

**A full-stack paper-trading platform for learning to invest — real prices, zero risk.**

[![Live Demo](https://img.shields.io/badge/%F0%9F%9A%80_Live_Demo-7A3E48?style=for-the-badge&logo=vercel&logoColor=white)](https://finsphere.vercel.app/login?demo=true)

One-click demo login — no signup required.

</div>

---

## Screenshots

| Landing Page | Dashboard |
|---|---|
| _Add screenshot: `docs/screenshots/landing.png`_ | _Add screenshot: `docs/screenshots/dashboard.png`_ |

| Trade | Portfolio |
|---|---|
| _Add screenshot: `docs/screenshots/trade.png`_ | _Add screenshot: `docs/screenshots/portfolio.png`_ |

| News | Learning Hub |
|---|---|
| _Add screenshot: `docs/screenshots/news.png`_ | _Add screenshot: `docs/screenshots/learning-hub.png`_ |

---

## Features

- **Authentication** — JWT register/login, hashed passwords, protected routes, persistent sessions
- **Virtual trading** — buy and sell real stocks against a virtual $100,000 balance at live prices
- **Live quotes & charts** — real-time pricing via Finnhub; intraday/daily candles via Yahoo Finance
- **Portfolio tracking** — live holdings, weighted-average cost basis, per-position unrealized P&L
- **Analytics** — portfolio value over time, allocation breakdown, transaction history, health score
- **Market news** — general market and per-symbol company news
- **Learning Hub** — 12 lessons (beginner → advanced) with quizzes and custom financial infographics
- **Watchlist** — track symbols without holding a position
- **Responsive** — dedicated mobile layouts across every page, not just reflowed desktop views

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Material UI, React Router, Recharts, Axios |
| Backend | Node.js, Express 5, JWT, bcrypt, express-validator |
| Database | MongoDB Atlas (Mongoose) |
| Cache | Redis (Upstash) |
| Market data | Finnhub (quotes/news), Yahoo Finance (candles) |
| DevOps | Docker Compose, GitHub Actions, Vercel, Render |

---

## Architecture

Two independent services — a React SPA (Vercel) and an Express API (Render) — backed by MongoDB Atlas and an optional Redis cache. The frontend calls the API over `VITE_API_URL`; every trade executes at a server-verified price inside an atomic MongoDB transaction.

```text
finsphere/
├── render.yaml                # Render deployment manifest
├── docker-compose.yml         # Local dev stack: frontend + backend + mongo + redis
├── backend/
│   ├── app.js                 # Express app (routes, middleware) — no listen/DB connect
│   ├── server.js              # Boots app.js: connects DB, starts listening
│   ├── config/                # Database and Redis connections
│   ├── controllers/           # Request handlers / business logic
│   ├── middleware/            # Auth, validation, error handling
│   ├── models/                # Mongoose schemas
│   ├── routes/                # Express route definitions
│   ├── services/              # External API adapters (Finnhub, Yahoo Finance)
│   └── docs/                  # Setup guide, API docs, development roadmap
└── frontend/
    ├── vercel.json            # Vercel SPA rewrite config
    └── src/
        ├── components/        # Reusable UI components
        ├── context/           # Auth context/state
        ├── hooks/             # Custom hooks
        ├── layouts/           # Page layout wrappers
        ├── pages/             # Route-level pages
        ├── routes/            # Routing + protected-route guard
        ├── services/          # API client layer
        └── utils/             # Constants and helpers
```

---

## Getting Started

### Prerequisites

Node.js 20+, npm, and a MongoDB instance (local or [Atlas free tier](https://www.mongodb.com/atlas)).

### Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in the values (see Environment Variables)
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend runs at `http://localhost:3000` and proxies `/api` requests to the backend at `http://localhost:5001`.

### Running with Docker

Runs the whole stack without installing Node, Redis, or MongoDB directly — purely for local dev (Render and Vercel deploy from source).

```bash
cp backend/.env.example backend/.env   # then fill in JWT_SECRET and FINNHUB_API_KEY
docker compose up --build
```

Starts four bind-mounted containers with hot reload — `frontend` (`:3000`), `backend` (`:5001`), `mongo`, and `redis`. Prefer Atlas? Replace `MONGO_URI` in `backend/.env`; nothing else changes.

```bash
docker compose down      # stop and remove containers
docker compose down -v   # also reset the Mongo volume
```

Each `Dockerfile` also has a non-root `production` target for self-hosting outside Compose (not used by the current Render/Vercel deployment):

```bash
docker build --target production -t finsphere-backend ./backend
docker run -p 5001:5001 --env-file backend/.env finsphere-backend

# VITE_API_URL is baked in at build time
docker build --target production --build-arg VITE_API_URL=https://your-api.example.com/api -t finsphere-frontend ./frontend
docker run -p 3000:3000 finsphere-frontend
```

---

## Environment Variables

**`backend/.env`**

| Variable | Required | Description |
|---|---|---|
| `PORT` | No (default `5001`) | Server port |
| `NODE_ENV` | No (default `development`) | Environment mode |
| `MONGO_URI` | **Yes** | MongoDB connection string (local or Atlas) |
| `JWT_SECRET` | **Yes** | Secret used to sign auth tokens |
| `JWT_EXPIRE` | No (default `30d`) | Token lifetime |
| `FINNHUB_API_KEY` | **Yes** | [Free Finnhub API key](https://finnhub.io/) |
| `CORS_ORIGIN` | No (default: all origins) | Comma-separated allowed origins in production |
| `REDIS_URL` | No | Caches quotes/candles/news to reduce Finnhub calls. Omit to run without a cache — the app degrades gracefully |

**`frontend/.env`**

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | **Yes** | Backend API base URL, e.g. `http://localhost:5001/api` |

---

## Deployment

- **Frontend** — Vercel, from `frontend/` (`vercel.json` handles SPA routing); `VITE_API_URL` set as a build-time env var
- **Backend** — Render, defined by `render.yaml`; secrets (`MONGO_URI`, `JWT_SECRET`, `FINNHUB_API_KEY`, `CORS_ORIGIN`) set in the dashboard
- **Database** — MongoDB Atlas
- **Cache** — Redis (optional); any provider with a connection string works. Set `REDIS_URL`, or omit it to run uncached
- **CI** — GitHub Actions (`.github/workflows/ci.yml`) installs both packages and builds the frontend on every push and PR (install/build verification only)

---

## Performance

Public market-data endpoints (quotes, candles, news) use the **cache-aside** pattern: served from Redis on a hit, falling through to Finnhub/Yahoo on a miss. If Redis is unavailable the app degrades gracefully and calls the upstream API directly.

Measured over 30 Postman Runner iterations per endpoint (first = cache miss, rest = cache hits):

| Endpoint | Cache miss (live API) | Cache hit (Redis) | Reduction |
|---|---|---|---|
| Stock quote | 431 ms | 51 ms | **88.1%** |
| Historical candles | 538 ms | 37 ms | **93.1%** |
| Market news | 429 ms | 37.3 ms | **91.3%** |

TTLs are tuned per data type — **quotes 30 s**, **candles 5 min**, **news 2 min**. **Trade execution bypasses the cache entirely**: every buy/sell fetches a fresh live price, so orders never fill against stale data.

---

## Security

- **Authentication** — stateless JWT Bearer tokens verified against the database on every protected request; passwords bcrypt-hashed and never returned by any query
- **Trade integrity** — execution price is fetched server-side, never trusted from the client; balance, holding, and record updates commit atomically via race-safe conditional updates (e.g. `quantity: { $gte: qty }`), so concurrent requests can't double-sell or double-credit
- **Request safety** — input validation on every write endpoint, request body size limits, and every query scoped to the authenticated user's own ID
