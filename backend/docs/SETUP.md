# FinSphere Backend — Setup Guide

## Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) free cluster

---

## Quick Start

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Create your environment file

```bash
cp .env.example .env
```

Edit `.env` and set your MongoDB connection string:

```env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/finsphere
```

### 3. Start the development server

```bash
npm run dev
```

You should see:

```
✓ MongoDB connected: localhost
✓ Server running on port 5001 [development]
```

### 4. Verify it works

```bash
curl http://localhost:5001/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "FinSphere API is running",
  "environment": "development",
  "timestamp": "2026-06-26T..."
}
```

---

## MongoDB Setup

### Option 1: Local MongoDB (recommended for development)

Install MongoDB Community Edition locally:

- **macOS**: `brew tap mongodb/brew && brew install mongodb-community && brew services start mongodb-community`
- **Ubuntu**: Follow [MongoDB install docs](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/)
- **Windows**: Download from [mongodb.com](https://www.mongodb.com/try/download/community)

Your `.env` should use:

```env
MONGO_URI=mongodb://localhost:27017/finsphere
```

The database `finsphere` will be created automatically when the first document is inserted.

### Option 2: MongoDB Atlas (recommended for deployment / team collaboration)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free account
2. Create a **free M0 cluster** (512 MB, shared, no credit card needed)
3. Under **Database Access**, create a database user with a password
4. Under **Network Access**, add your IP address (or `0.0.0.0/0` for development)
5. Click **Connect** → **Connect your application** → Copy the connection string
6. Replace the placeholder values in your `.env`:

```env
MONGO_URI=mongodb+srv://yourUsername:yourPassword@yourCluster.mongodb.net/finsphere?retryWrites=true&w=majority
```

### When to use which?

| Scenario | Use |
|----------|-----|
| Solo development on your machine | Local MongoDB |
| No MongoDB installed, quick start | Atlas free tier |
| Team collaboration (shared database) | Atlas |
| CI/CD pipelines | Atlas or Docker MongoDB |
| Production deployment | Atlas (dedicated cluster) |

### Why credentials must never be committed

The `.env` file contains your database password and other secrets. It is excluded from Git via `.gitignore`. Only `.env.example` (with placeholder values) is committed. Each developer creates their own `.env` locally.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with nodemon (auto-restart on file changes) |
| `npm start` | Start without nodemon (production) |

---

## Project Structure

```
backend/
├── server.js                 # Express app entry point
├── config/
│   └── db.js                 # MongoDB connection + lifecycle events
├── middleware/
│   └── errorHandler.js       # Global error handler
├── models/                   # Mongoose schemas (added in later milestones)
├── routes/                   # Express route files (added in later milestones)
├── controllers/              # Route handlers (added in later milestones)
├── services/                 # External API adapters (added in later milestones)
├── utils/
│   └── constants.js          # Shared constants (INITIAL_BALANCE, etc.)
└── docs/
    ├── SETUP.md              # This file
    └── BACKEND_ROADMAP.md    # Development roadmap and progress
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5001` | Server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `MONGO_URI` | **Yes** | — | MongoDB connection string (local or Atlas) |

