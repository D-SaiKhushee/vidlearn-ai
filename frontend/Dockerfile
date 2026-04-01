# ── Frontend Dockerfile ─────────────────────────────────────────────────────
# Builds the React/Vite frontend and serves it via nginx
# ────────────────────────────────────────────────────────────────────────────

FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# VITE_API_URL is injected at build time via Azure App Settings / pipeline env
ARG VITE_API_URL=https://vidlearn-backend.azurewebsites.net/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ── Serve with nginx ─────────────────────────────────────────────────────────
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
