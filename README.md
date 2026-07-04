<div align="center">

# FinSphere

**A full-stack paper-trading platform for learning to invest — real prices, zero risk.**

</div>

Trade live-priced stocks on a virtual $100,000 balance with a real portfolio dashboard, charts, news, and a financial-literacy curriculum — every trade executes at a server-verified price inside an atomic transaction, engineered like a real brokerage, not a toy.

![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white) ![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white) ![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white) ![Deployed](https://img.shields.io/badge/Deployed-Vercel%20%2B%20Render-000000?logo=vercel&logoColor=white)

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

- **Authentication** — JWT-based register/login, hashed passwords, protected routes, persistent sessions
- **Virtual trading** — buy and sell real stocks against a virtual $100,000 balance, executed at live market prices
- **Live stock quotes** — real-time pricing via the Finnhub API
- **Historical charts** — intraday and daily candle charts via Yahoo Finance
- **Portfolio tracking** — live holdings, weighted-average cost basis, unrealized gain/loss per position
- **Performance analytics** — portfolio value over time, allocation breakdown, transaction history
- **Portfolio health score** — a computed score summarizing diversification and performance
- **Market news** — general market news and per-symbol company news
- **Learning Hub** — 12 structured lessons (beginner → advanced) with interactive quizzes and custom financial infographics
- **Watchlist** — track symbols without holding a position
- **Responsive design** — dedicated mobile layouts across every page, not just reflowed desktop views

---

## Security Highlights

- **Authentication** — stateless JWT Bearer tokens verified against the database on every protected request; passwords hashed with bcrypt and never returned by any query
- **Trade integrity** — execution price is fetched live from the server and never trusted from the client; every trade's balance update, holding update, and record commit atomically via race-safe conditional updates (e.g. `quantity: { $gte: qty }`), so concurrent requests can't double-sell shares or double-credit a balance
- **Request safety** — input validation on every write endpoint, request body size limits, and every query scoped to the authenticated user's own ID

---

## Installation

### Prerequisites

Node.js ≥ 18, npm, and a MongoDB instance (local or [Atlas free tier](https://www.mongodb.com/atlas))

### Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in the values below
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

### Environment Variables

**`backend/.env`**

| Variable | Required | Description |
|---|---|---|
| `PORT` | No (default `5001`) | Server port |
| `NODE_ENV` | No (default `development`) | Environment mode |
| `MONGO_URI` | **Yes** | MongoDB connection string (local or Atlas) |
| `JWT_SECRET` | **Yes** | Secret used to sign auth tokens |
| `JWT_EXPIRE` | No (default `7d`) | Token lifetime |
| `FINNHUB_API_KEY` | **Yes** | [Free Finnhub API key](https://finnhub.io/) |
| `CORS_ORIGIN` | No (default: all origins) | Comma-separated allowed origins in production |
| `REDIS_URL` | No | Caches quotes/candles/news to reduce Finnhub calls. Omit to run without a cache — the app degrades gracefully |

**`frontend/.env`**

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | **Yes** | Backend API base URL, e.g. `http://localhost:5001/api` |

---

## Running with Docker

An alternative to the native setup above — runs the whole stack without installing Node, Redis, or MongoDB directly. Render and Vercel still deploy directly from source either way; this is purely for local development.

### Prerequisites

[Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Compose) — nothing else to install.

### Quick start

```bash
cp backend/.env.example backend/.env   # then fill in JWT_SECRET and FINNHUB_API_KEY
docker compose up --build
```

Starts four containers — no MongoDB Atlas account needed:

| Service | URL | Notes |
|---|---|---|
| `frontend` | `http://localhost:3000` | Vite dev server, hot-reloads on change |
| `backend` | `http://localhost:5001` | nodemon, restarts on change |
| `mongo` | _(internal only)_ | Data persists in the `mongo-data` volume |
| `redis` | _(internal only)_ | Cache — no persistence needed |

Both `frontend/` and `backend/` are bind-mounted, so edits take effect immediately; a rebuild is only needed when dependencies change.

Prefer MongoDB Atlas over the local container? Replace `MONGO_URI` in `backend/.env` with your Atlas connection string — nothing else to change. The `mongo` container keeps running but simply goes unused.

### Rebuilding & stopping

```bash
docker compose up --build       # after changing package.json in either service
docker compose down              # stop and remove containers
docker compose down -v           # also reset the Mongo volume (fresh database next start)
```

### Standalone production images

Each `Dockerfile` has a `production` target — smaller, non-root, minimal dependencies — for self-hosting outside of Compose. Not used by the current Render/Vercel deployment:

```bash
docker build --target production -t finsphere-backend ./backend
docker run -p 5001:5001 --env-file backend/.env finsphere-backend

# VITE_API_URL must be provided at build time — Vite bakes it into the static bundle
docker build --target production --build-arg VITE_API_URL=https://your-api.example.com/api -t finsphere-frontend ./frontend
docker run -p 3000:3000 finsphere-frontend
```

### Troubleshooting

- **Port already allocated** — stop native `npm run dev` processes and any local Redis/MongoDB services first, or edit the `ports:` mappings.
- **Frontend can't reach the backend** — confirm `VITE_API_URL` in `docker-compose.yml` still points to `http://localhost:5001/api` (must be host-reachable, not the internal service name).
- **Dependency changes not picked up** — bind mounts don't trigger a re-install; run `docker compose up --build`.
- **Stale `node_modules` after switching branches** — `docker compose down -v && docker compose up --build` (also resets the Mongo volume, which is fine for dev data).

---

## Deployment

- **Frontend** — Vercel, deployed from `frontend/` (`vercel.json` handles SPA routing); `VITE_API_URL` set as a build-time environment variable
- **Backend** — Render, defined by `render.yaml`; secrets (`MONGO_URI`, `JWT_SECRET`, `FINNHUB_API_KEY`, `CORS_ORIGIN`) set in the dashboard
- **Database** — MongoDB Atlas
- **Cache** — Redis (optional); any provider that gives a connection string works (Render Key Value, Upstash, Redis Cloud). Set `REDIS_URL` in the dashboard — omit it and the backend runs uncached

---

## Performance

Public market-data endpoints (quotes, historical candles, market news) are cached in Redis using the **cache-aside** pattern: a request is served straight from Redis on a hit, and only falls through to the Finnhub/Yahoo API on a miss, storing the result before returning it. If Redis is unavailable the app degrades gracefully and calls the upstream API directly, exactly as it did before caching.

Measured over 30 Postman Runner iterations per endpoint (first iteration = cache miss, remainder = cache hits):

| Endpoint | Cache miss (live API) | Cache hit (Redis) | Reduction |
|---|---|---|---|
| Stock quote | 431 ms | 51 ms | **88.1%** |
| Historical candles | 538 ms | 37 ms | **93.1%** |
| Market news | 429 ms | 37.3 ms | **91.3%** |

Each data type uses a TTL tuned to how fast it changes:

| Data | TTL | Rationale |
|---|---|---|
| Quotes | 10 seconds | Prices move fast; a short TTL keeps them fresh while collapsing bursts of duplicate lookups (e.g. the dashboard re-pricing every holding on load) into a single API call |
| Historical candles | 5 minutes | Closed historical bars barely change within a session |
| Market news | 2 minutes | Headlines don't update second to second |

**Trade execution intentionally bypasses Redis** — every buy and sell fetches a fresh, live Finnhub price at execution time, so an order is never filled against a cached (potentially stale) price. Caching is applied only to read-only market data displayed in the UI.

---

## Folder Structure

```text
finsphere/
├── render.yaml                     # Render deployment manifest
├── docker-compose.yml              # Local dev stack: frontend + backend + mongo + redis
├── backend/
│   ├── Dockerfile
│   ├── app.js               # Express app (routes, middleware) — no listen/DB connect
│   ├── server.js             # Boots app.js: connects DB, starts listening
│   ├── config/               # Database and Redis connections
│   ├── controllers/          # Request handlers / business logic
│   ├── middleware/           # Auth, validation, error handling
│   ├── models/                # Mongoose schemas
│   ├── routes/                 # Express route definitions
│   ├── services/               # External API adapters (Finnhub, Yahoo Finance)
│   └── docs/                    # Setup guide, API docs, development roadmap
└── frontend/
    ├── Dockerfile
    ├── vercel.json          # Vercel SPA rewrite config
    └── src/
        ├── components/       # Reusable UI components
        ├── context/           # Auth context/state
        ├── hooks/             # Custom hooks
        ├── layouts/           # Page layout wrappers
        ├── pages/             # Route-level pages
        ├── routes/            # Routing + protected-route guard
        ├── services/          # API client layer
        └── utils/             # Constants and helpers
```

---

## Future Improvements

- **CI/CD** — automated linting, tests, and build verification on every push
- **Paper trading competitions** — leaderboards and time-boxed trading challenges between users
- **Portfolio snapshots** — richer historical performance tracking beyond the current daily snapshot
