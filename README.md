# JPO Hub

JPO Hub is a web application built for Ynov Campus Sophia Antipolis to support Open Day (JPO) events. Candidates go through a short orientation quiz, get matched against the available programs (`Filiere`), and staff can manage workshops, monitor statistics and follow up on registrations from an admin back-office.

## Tech stack

**Backend** (`/backend`) — NestJS 11 REST API
- Prisma 7 (`@prisma/client`, `@prisma/adapter-pg`) on PostgreSQL
- JWT authentication (`@nestjs/jwt`, `passport-jwt`) with bcrypt password hashing
- File storage on S3 (`@aws-sdk/client-s3`)
- API documentation generated with Swagger, served at `/api/docs`
- Global `/api` prefix so the same origin can serve the API and the front-end behind a single reverse proxy

**Frontend** (`/frontend`) — Angular 21 with Server-Side Rendering
- Angular SSR (Express server, `server.ts` / `main.server.ts`)
- `lucide-angular` icon set, `ngx-cookie-service` for session handling

**Infrastructure**
- Docker / docker-compose: `frontend` (nginx, public), `backend` (NestJS, internal only), `db` (PostgreSQL, internal network, no exposed port, healthcheck-gated startup)
- Environment variables documented in `.env.example`

## Backend modules

`candidats` · `filieres` · `questions` · `answers` · `ateliers` · `scoring` · `stats` · `admins` · `auth` · `audit` (audit log fed by PostgreSQL triggers)

## Testing

- Unit and e2e tests with Jest (`npm run test`, `npm run test:e2e`, `npm run test:cov`)
- Load testing with [k6](https://k6.io) (`backend/test/perf/quiz-flow.k6.js`), simulating a realistic JPO rush (ramping up to 60 concurrent virtual users). Results are archived in `last-run-summary.json`; `cleanup.sql` resets the data generated during a run.

## Getting started

```bash
git clone https://github.com/jpo-hub/jpo-hub-web-app.git
cd jpo-hub-web-app
cp .env.example .env   # fill in POSTGRES_*, JWT_SECRET, HTTP_PORT

docker compose up -d --build
docker compose exec backend npx prisma db seed   # first run only
```

The API is then available at `http://localhost:<HTTP_PORT>/api`, with interactive documentation at `/api/docs`.

## Project structure

```
/backend
  /prisma        Prisma schema and migrations
  /src/module     One folder per domain module (candidats, scoring, audit...)
  /test/perf      k6 load test and its cleanup script
/frontend
  /src/app        Angular application (candidate quiz + admin interface)
```

## Author

Kantin FAGNIART — Ynov Campus Sophia Antipolis, B3 IA & Data (CDAN, RNCP 36463).