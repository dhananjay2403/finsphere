# Portfolio API — Reference & Postman Tests

## Overview

All portfolio endpoints are **protected** — every request must include a valid JWT in the `Authorization` header.

```
Authorization: Bearer <token>
```

Base URL: `http://localhost:5001/api`

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/portfolio/holdings` | All holdings with P&L fields |
| GET | `/api/portfolio/summary` | Cash, invested, value, return |
| GET | `/api/portfolio/cash` | Available cash balance only |

---

## GET /api/portfolio/holdings

Returns the authenticated user's current stock positions.

### Response — Empty portfolio (new user)

```json
{
  "success": true,
  "count": 0,
  "data": []
}
```

### Response — Portfolio with holdings

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "664f1a2b3c4d5e6f7a8b9c0d",
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "quantity": 10,
      "avgCostPrice": 182.50,
      "totalInvested": 1825.00,
      "currentPrice": null,
      "currentValue": null,
      "unrealisedPnL": null,
      "unrealisedPnLPct": null
    },
    {
      "_id": "664f1a2b3c4d5e6f7a8b9c0e",
      "symbol": "MSFT",
      "name": "Microsoft Corporation",
      "quantity": 5,
      "avgCostPrice": 415.00,
      "totalInvested": 2075.00,
      "currentPrice": null,
      "currentValue": null,
      "unrealisedPnL": null,
      "unrealisedPnLPct": null
    }
  ]
}
```

> **Note**: `currentPrice`, `currentValue`, `unrealisedPnL`, and `unrealisedPnLPct` are `null`
> until live stock prices are integrated (Milestone 12). The shape is final.

---

## GET /api/portfolio/summary

Returns aggregate portfolio financials for the P&L Summary cards.

### Response

```json
{
  "success": true,
  "data": {
    "cashBalance": 96100.00,
    "totalInvested": 3900.00,
    "currentValue": 3900.00,
    "totalReturn": 0.00,
    "totalReturnPct": 0.00,
    "portfolioValue": 100000.00
  }
}
```

| Field | Description |
|-------|-------------|
| `cashBalance` | Uninvested cash (`user.balance`) |
| `totalInvested` | Sum of `quantity × avgCostPrice` across all holdings |
| `currentValue` | Market value of all holdings — equals `totalInvested` until live prices are available |
| `totalReturn` | `currentValue - totalInvested` (absolute P&L) |
| `totalReturnPct` | `(totalReturn / totalInvested) × 100` |
| `portfolioValue` | `cashBalance + currentValue` |

---

## GET /api/portfolio/cash

Thin endpoint for components that only need the cash figure.

### Response

```json
{
  "success": true,
  "data": {
    "cashBalance": 96100.00
  }
}
```

---

## Error Responses

All errors follow the standard envelope: `{ success: false, message: "..." }`.

| Status | Condition |
|--------|-----------|
| `401` | Missing token, invalid token, expired token |
| `500` | Unexpected server or database error |

---

## Postman Tests

### Prerequisites

1. Register or login to get a token:
   ```
   POST /api/auth/login
   Body: { "email": "...", "password": "..." }
   ```
2. Copy the `token` field from the response.
3. In every portfolio request, set:
   ```
   Header: Authorization: Bearer <paste_token_here>
   ```

---

### Test 1 — Holdings: unauthenticated request returns 401

```
GET http://localhost:5001/api/portfolio/holdings
(No Authorization header)

Expected status: 401
Expected body:
{
  "success": false,
  "message": "Not authorised — no token provided"
}
```

---

### Test 2 — Holdings: authenticated, empty portfolio

```
GET http://localhost:5001/api/portfolio/holdings
Authorization: Bearer <valid_token>

Expected status: 200
Expected body:
{
  "success": true,
  "count": 0,
  "data": []
}
```

---

### Test 3 — Summary: unauthenticated request returns 401

```
GET http://localhost:5001/api/portfolio/summary
(No Authorization header)

Expected status: 401
Expected body:
{
  "success": false,
  "message": "Not authorised — no token provided"
}
```

---

### Test 4 — Summary: authenticated new user (no holdings)

```
GET http://localhost:5001/api/portfolio/summary
Authorization: Bearer <valid_token>

Expected status: 200
Expected body:
{
  "success": true,
  "data": {
    "cashBalance": 100000,
    "totalInvested": 0,
    "currentValue": 0,
    "totalReturn": 0,
    "totalReturnPct": 0,
    "portfolioValue": 100000
  }
}
```

---

### Test 5 — Cash: authenticated

```
GET http://localhost:5001/api/portfolio/cash
Authorization: Bearer <valid_token>

Expected status: 200
Expected body:
{
  "success": true,
  "data": {
    "cashBalance": 100000
  }
}
```

---

### Test 6 — Cash: invalid token

```
GET http://localhost:5001/api/portfolio/cash
Authorization: Bearer this.is.not.a.real.token

Expected status: 401
Expected body:
{
  "success": false,
  "message": "Not authorised — invalid or expired token"
}
```

---

### Test 7 — Holdings: expired token

```
GET http://localhost:5001/api/portfolio/holdings
Authorization: Bearer <expired_jwt>

Expected status: 401
Expected body:
{
  "success": false,
  "message": "Not authorised — invalid or expired token"
}
```

---

### Test 8 — 404: non-existent portfolio sub-route

```
GET http://localhost:5001/api/portfolio/nonexistent
Authorization: Bearer <valid_token>

Expected status: 404
Expected body:
{
  "success": false,
  "message": "Route not found"
}
```

---

## Frontend Integration Notes

These are the API calls `Portfolio.jsx` should make once wired up:

```js
// portfolioService.js (to be created in frontend/src/services/)

import api from './api';

const portfolioService = {
  getHoldings: () => api.get('/portfolio/holdings'),
  getSummary:  () => api.get('/portfolio/summary'),
  getCash:     () => api.get('/portfolio/cash'),
};

export default portfolioService;
```

The `api` instance in `services/api.js` already injects the Bearer token automatically —
no manual header configuration required in the service layer.
