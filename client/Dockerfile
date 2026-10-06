# Build context is the repo root (npm workspaces): build with
#   docker build -f client/Dockerfile .
# ---- build ----
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/
RUN npm ci

COPY client ./client

# Vite inlines VITE_* at build time. CapRover passes app env vars as build args.
# The API is proxied on the same domain, so /api is the production default.
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build --workspace client

# ---- serve ----
FROM nginx:alpine
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/client/dist /usr/share/nginx/html
EXPOSE 80
