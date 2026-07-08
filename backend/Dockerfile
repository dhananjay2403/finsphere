FROM node:24-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./

# Full install (incl. devDependencies), used by the dev stage below
FROM base AS deps
RUN npm ci

# Production dependencies only, for the final runtime image
FROM base AS prod-deps
RUN npm ci --omit=dev

# Used by docker-compose locally — source is bind-mounted over this, so nodemon picks up changes directly.
FROM deps AS dev
COPY . .
EXPOSE 5001
CMD ["npm", "run", "dev"]

# Lean runtime image — not used by Render (deploys from source via render.yaml), available for self-hosting.
FROM node:24-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .

# Alpine's node image ships a non-root "node" user (uid 1000) — reuse it.
USER node

EXPOSE 5001

# Exec form so node is PID 1 and receives SIGTERM directly — required for server.js's graceful shutdown.
CMD ["node", "server.js"]
