# FinSphere Frontend

Frontend application for **FinSphere**, a financial literacy and paper trading platform designed to help users learn investing concepts, track virtual portfolios, and practice investment decisions in a risk-free environment.

## Features

* JWT-based authentication flow
* Protected routes
* Responsive dashboard
* Paper trading interface
* Portfolio tracking and analytics
* Watchlist management
* Market news integration
* Financial Learning Hub
* Interactive educational modules
* SVG-based financial infographics
* Mobile-first responsive design

## Quick Start

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:5173
```

## Environment Variables

Create a `.env` file in the frontend root:

```env
VITE_API_URL=http://localhost:5000/api
```

A sample configuration is provided in:

```text
.env.example
```

## Tech Stack

* **React 18** — Component-based UI
* **Vite** — Build tool and development server
* **Material UI 5** — UI component library
* **React Router 6** — Client-side routing
* **Axios** — API communication
* **Recharts** — Data visualization
* **Context API** — Global authentication state

## Project Structure

```text
src/
├── components/     # Reusable UI components
├── context/        # React Context providers
├── hooks/          # Custom hooks
├── layouts/        # Layout wrappers
├── pages/          # Application pages
├── routes/         # Routing and route guards
├── services/       # API service layer
├── utils/          # Helpers and constants
├── theme.js        # Material UI theme
└── index.css       # Global styles
```

## Learning Hub

The Learning Hub provides structured financial education through interactive lessons and SVG-based visualizations.

### Beginner

* Investing Basics
* Understanding ETFs
* Stocks vs Bonds
* Power of Compounding

### Intermediate

* Diversification
* Risk Management
* Technical Analysis
* Market Psychology

### Advanced

* Fundamental Analysis
* Portfolio Construction
* Global Investing
* Cryptocurrency Basics

## Build

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Planned Enhancements

### Backend Integration

* Express.js API
* MongoDB database
* JWT authentication
* Portfolio management APIs
* Trading APIs

### Redis Caching

* Stock price caching
* News caching
* Session management
* Rate limiting support

### Docker

* Multi-stage frontend build
* Docker Compose setup
* Environment-based configuration

### CI/CD

* ESLint checks
* Automated testing
* Build verification
* Deployment workflows

## License

This project is developed for educational and portfolio purposes.
