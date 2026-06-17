# AGENTS.md

## Cursor Cloud specific instructions

This is a monorepo for **Брикет-Бери** (Briket-Berry), a B2B charcoal-briquette shop.

- `backend/` — Node.js + Express + TypeScript API using Prisma + PostgreSQL. Dev server: `npm run dev` (port **5000**, `nodemon` + `ts-node`). In production it also serves the built frontend from `frontend/dist`; in dev it runs API-only (logs `⚠️ Frontend dist not found, API-only mode`).
- `frontend/` — React 19 + Vite. Dev server: `npm run dev` (port **3000**). Vite proxies `/api` → `http://localhost:5000`, so run the backend too for a working app.

Standard commands live in each `package.json` (`backend/package.json`, `frontend/package.json`). Quick start docs are in `docs/README.md`.

### Services / how to run

| Service  | Dir         | Run (dev)                    | Port | Notes |
|----------|-------------|------------------------------|------|-------|
| Backend  | `backend/`  | `npm run dev`                | 5000 | Needs PostgreSQL + `backend/.env` |
| Frontend | `frontend/` | `npm run dev`                | 3000 | Proxies `/api` to backend |

### PostgreSQL (required, not auto-started on a fresh boot)

PostgreSQL 16 is installed. If it is not running, start the cluster:

```bash
sudo pg_ctlcluster 16 main start
```

The dev database/user used by `backend/.env`: db `briket_berry`, user `postgres`, password `postgres` on `localhost:5432`. To recreate from scratch:

```bash
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
sudo -u postgres psql -c "CREATE DATABASE briket_berry;"
```

### Backend `.env` (required, git-ignored)

`backend/.env` is git-ignored and must exist for the backend to start. If missing, copy `backend/.env.example` and set `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/briket_berry` (and a 32+ char `JWT_SECRET`, plus `ADMIN_PASSWORD`). External integrations (YooKassa payment, SMTP email, DeepSeek/OpenAI AI consultant) are optional for local dev — placeholders are fine; those features just won't work.

### Database schema + seed

Apply the schema and seed data:

```bash
cd backend
npx prisma migrate deploy          # or: npx prisma migrate dev
TS_NODE_COMPILER_OPTIONS='{"types":["node"]}' npx ts-node prisma/seed.ts
```

**Gotcha:** `npm run prisma:seed` fails with `TS2584: Cannot find name 'console'` because `prisma/seed.ts` is outside the `tsconfig.json` `include` (`src/**/*`), so `@types/node` globals aren't loaded. Run the seed with the `TS_NODE_COMPILER_OPTIONS='{"types":["node"]}'` prefix shown above.

### Known non-fatal startup noise

On startup the backend logs a Prisma error from `initDefaultProducts` (`Unknown argument 'wholesaleMin'. Did you mean 'wholesaleMinQty'?`). This is a pre-existing bug in `backend/src/index.ts`; it is caught and harmless — products come from the seed (`prisma/seed.ts`), and admin bootstrap + the server itself start fine.

### Lint / test / build

- Frontend lint: `cd frontend && npm run lint` — uses ESLint `json-with-metadata` format, so it **always exits 0**; check `errorCount`/`warningCount` in the JSON to judge pass/fail.
- Frontend unit test: `cd frontend && npm run test:order-pricing`.
- Frontend build: `cd frontend && npm run build`.
- Backend has no automated test suite; verify by running `npm run dev` and hitting `GET http://localhost:5000/api/health`.
