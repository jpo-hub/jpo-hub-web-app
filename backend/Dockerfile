# API NestJS — image de production
FROM node:22-slim

WORKDIR /app

# Dépendances d'abord (couche mise en cache tant que package*.json ne change pas)
COPY package*.json ./
RUN npm ci

# Schéma + migrations Prisma, config et sources
COPY prisma.config.ts nest-cli.json tsconfig.json tsconfig.build.json ./
COPY prisma ./prisma
COPY src ./src

# Génère le client Prisma puis compile l'application.
# prisma.config.ts exige DATABASE_URL dès son chargement : on fournit une
# URL factice — `generate` ne se connecte jamais à la base.
RUN DATABASE_URL="postgres://build:build@localhost:5432/build" npx prisma generate \
  && npm run build

ENV NODE_ENV=production
EXPOSE 3000

# Applique les migrations en attente puis démarre l'API.
# La base n'étant joignable que depuis le réseau interne Docker,
# c'est le conteneur lui-même qui migre sa base.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
