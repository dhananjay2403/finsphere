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

**`frontend/.env`**

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | **Yes** | Backend API base URL, e.g. `http://localhost:5001/api` |

---

## Deployment

- **Frontend** — Vercel, deployed from `frontend/` (`vercel.json` handles SPA routing); `VITE_API_URL` set as a build-time environment variable
- **Backend** — Render, defined by `render.yaml`; secrets (`MONGO_URI`, `JWT_SECRET`, `FINNHUB_API_KEY`, `CORS_ORIGIN`) set in the dashboard
- **Database** — MongoDB Atlas

---

## Folder Structure

```text
finsphere/
├── render.yaml            # Render deployment manifest
├── backend/
│   ├── app.js               # Express app (routes, middleware) — no listen/DB connect
│   ├── server.js             # Boots app.js: connects DB, starts listening
│   ├── config/               # Database connection
│   ├── controllers/          # Request handlers / business logic
│   ├── middleware/           # Auth, validation, error handling
│   ├── models/                # Mongoose schemas
│   ├── routes/                 # Express route definitions
│   ├── services/               # External API adapters (Finnhub, Yahoo Finance)
│   └── docs/                    # Setup guide, API docs, development roadmap
└── frontend/
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

- **Redis caching** — cache live quote lookups to reduce external API calls and improve response time under load
- **Docker** — containerize both services for consistent local and CI environments
- **CI/CD** — automated linting, tests, and build verification on every push
- **Paper trading competitions** — leaderboards and time-boxed trading challenges between users
- **Portfolio snapshots** — richer historical performance tracking beyond the current daily snapshot
