# Build context is the repo root (npm workspaces): build with
#   docker build -f server/Dockerfile .
# ---- build ----
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/
RUN npm ci

COPY server ./server
RUN npm run build --workspace server

# ---- runtime ----
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/
RUN npm ci --omit=dev --workspace server && npm cache clean --force

COPY --from=build /app/server/dist ./server/dist

WORKDIR /app/server
EXPOSE 3001
CMD ["node", "dist/index.js"]
