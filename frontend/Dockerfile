# Front Angular — build statique servi par nginx (multi-stage)
FROM node:22-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# Profil "docker" : build statique sans SSR (le prerender émet des
# erreurs non bloquantes car l'API n'est pas joignable pendant le build)
RUN npx ng build --configuration production,docker

# ---- Image finale : nginx sert le front ET proxifie /api vers le backend
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80
