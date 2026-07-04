FROM node:24-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./

# Full install (incl. devDependencies), used by the dev stage below
FROM base AS deps
RUN npm ci

# Production dependencies only, for the final runtime image
FROM base AS prod-deps
RUN npm ci --omit=dev

# Used by docker-compose for local development — source is bind-mounted over
# this at runtime, so nodemon (a devDependency) picks up changes directly.
FROM deps AS dev
COPY . .
EXPOSE 5001
CMD ["npm", "run", "dev"]

# Lean runtime image. Not used by Render (which deploys from source via
# render.yaml) — available for any environment that runs containers directly.
FROM node:24-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .

# Alpine's node image ships a non-root "node" user (uid 1000) — reuse it.
USER node

EXPOSE 5001

# Exec form so node is PID 1 and receives SIGTERM directly — required for
# server.js's graceful-shutdown handler to run at all.
CMD ["node", "server.js"]
