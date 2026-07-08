FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Used by docker-compose locally — source is bind-mounted over this; Vite hot-reloads on change.
FROM deps AS dev
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Vite inlines env vars at build time, so VITE_API_URL must be a build arg, not a runtime env var.
FROM deps AS build
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Static file server for the built bundle — not used by Vercel (builds natively), available for self-hosting.
FROM node:24-alpine AS production
WORKDIR /app
RUN npm install -g serve@14
COPY --from=build --chown=node:node /app/dist ./dist
USER node
EXPOSE 3000

# -s enables SPA fallback (all routes serve index.html), matching vercel.json's rewrite rule.
CMD ["serve", "-s", "dist", "-l", "3000"]
