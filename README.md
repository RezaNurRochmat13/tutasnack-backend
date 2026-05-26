# TutaSnack Backend

API backend untuk TutaSnack, dibangun dengan [Hono](https://hono.dev/) dan di-deploy ke [Cloudflare Workers](https://workers.cloudflare.com/). Menggunakan [Neon](https://neon.tech/) sebagai database PostgreSQL serverless dengan [Prisma](https://www.prisma.io/) sebagai ORM.

## Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| Runtime | Cloudflare Workers (Edge) + Node.js (dev) |
| Framework | Hono |
| ORM | Prisma + Neon adapter (Workers) / standar (Node.js) |
| Database | Neon (PostgreSQL serverless) / lokal PostgreSQL |
| Validation | Zod |
| Auth | JWT (HS256) + Web Crypto API (PBKDF2) |
| Docs | OpenAPI 3.0 + Swagger UI |
| Testing | Vitest (unit + integrasi pake SQLite in-memory) |
| Bahasa | TypeScript |

## Struktur Project

```
src/
├── config/env.ts              # Validasi env variables
├── db/prisma.ts               # Prisma client (conditional: Neon/standar/test)
├── lib/
│   ├── jwt.ts                 # JWT sign/verify
│   └── password.ts            # PBKDF2 hash/verify
├── middleware/
│   └── auth.ts                # JWT auth middleware
├── repositories/              # Data access (CRUD)
│   ├── index.ts
│   ├── user.repository.ts
│   ├── store.repository.ts
│   ├── sales-income.repository.ts
│   ├── expense.repository.ts
│   └── sales-tracker.repository.ts
├── services/                  # Business logic
│   ├── index.ts
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── store.service.ts
│   ├── sales-income.service.ts
│   ├── expense.service.ts
│   └── sales-tracker.service.ts
├── controllers/               # HTTP handlers (route → controller → service)
│   ├── auth.controller.ts
│   ├── user.controller.ts
│   ├── store.controller.ts
│   ├── sales-income.controller.ts
│   ├── expense.controller.ts
│   └── sales-tracker.controller.ts
├── routes/                    # Route definitions
│   ├── index.ts               # Registrasi semua route + auth middleware
│   ├── auth.route.ts
│   ├── user.route.ts
│   ├── store.route.ts
│   ├── sales-income.route.ts
│   ├── expense.route.ts
│   └── sales-tracker.route.ts
├── docs/
│   ├── index.ts               # Swagger UI endpoint
│   └── spec.ts                # OpenAPI 3.0 spec
├── dev-server.ts              # Dev server untuk local (Node.js via tsx)
└── index.ts                   # Entry point Cloudflare Workers
```

### Pattern: Controller → Service → Repository

```
Route (path + validation)
  └── Controller (parse request, handle response)
        └── Service (business logic)
              └── Repository (Prisma queries)
```

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (`npm install -g wrangler`)
- Akun [Neon](https://neon.tech/) (free tier cukup) — untuk production / `wrangler dev`
- Akun [Cloudflare](https://dash.cloudflare.com/)
- PostgreSQL lokal (opsional) — untuk `npm run dev:local`

## Setup

### 1. Clone & Install

```bash
npm install
```

### 2. Setup Database

**Opsi A: Neon (untuk `wrangler dev` & deploy)**

Buat project di [Neon Dashboard](https://console.neon.tech/), salin connection string. Isi ke `.dev.vars`:

```env
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/db?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/db?sslmode=require"
JWT_SECRET="your-secret-key"
USE_NEON_ADAPTER=true
```

**Opsi B: PostgreSQL lokal (untuk `npm run dev:local`)**

Lewat Docker:
```bash
npm run docker:up
```

Atau pake PostgreSQL yg udah terinstall. Isi `.env`:

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/tutasnack"
JWT_SECRET="dev-secret"
```

### 3. Migrate & Seed

```bash
npx prisma migrate dev --name init
npm run db:seed
```

### 4. Generate Prisma Client (untuk test SQLite)

```bash
TEST_DATABASE_URL="file::memory:?cache=shared" npx prisma generate --schema=prisma/schema.test.prisma
```

## Development

| Command | Runtime | Database | Notes |
|---------|---------|----------|-------|
| `npm run dev:local` | Node.js (tsx) | PostgreSQL lokal | Recommended buat daily dev |
| `npm run dev` | Workers (wrangler) | Neon cloud | Butuh `.dev.vars` isi Neon URL |
| `npm run test` | Node.js (vitest) | SQLite in-memory | Gak perlu database external |

### Penting

- **`npm run dev:local`** — jalan di Node.js biasa, make PrismaClient standar, cocok buat开发 lokal pake PostgreSQL docker/lokal.
- **`npm run dev`** — jalan di `wrangler dev` (simulasi Workers), make Neon adapter. **Membutuhkan koneksi ke Neon cloud.**
- **`npm run test`** — pake SQLite in-memory, gak perlu database sama sekali.

## Authentication

Semua endpoint (kecuali `/api/auth/*`) dilindungi **JWT Bearer token**.

### Register

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John"
}
```

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

# Response
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "...", "email": "user@example.com", "name": "John" }
}
```

Token berlaku **7 hari**. Gunakan sebagai Bearer token di header:

```bash
Authorization: Bearer <token>
```

## API Endpoints

### OpenAPI / Swagger
```
GET /docs        → Swagger UI
GET /docs/spec   → OpenAPI spec (JSON)
```

### Auth (tanpa token)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Registrasi user baru |
| `POST` | `/api/auth/login` | Login, return JWT token |

### Users
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/users` | Semua users |
| `GET` | `/api/users/:id` | User by ID |
| `POST` | `/api/users` | Buat user |
| `PUT` | `/api/users/:id` | Update user |
| `DELETE` | `/api/users/:id` | Hapus user |

### Stores
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/stores` | Semua toko |
| `GET` | `/api/stores/:id` | Detail toko |
| `POST` | `/api/stores` | Tambah toko |
| `PUT` | `/api/stores/:id` | Update toko |
| `DELETE` | `/api/stores/:id` | Hapus toko |

### Sales Income
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/sales-income` | Semua pendapatan (opsional `?storeId=`) |
| `GET` | `/api/sales-income/:id` | Detail pendapatan |
| `POST` | `/api/sales-income` | Catat pendapatan |
| `PUT` | `/api/sales-income/:id` | Update pendapatan |
| `DELETE` | `/api/sales-income/:id` | Hapus pendapatan |

### Expenses
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/expenses` | Semua pengeluaran |
| `GET` | `/api/expenses/:id` | Detail pengeluaran |
| `POST` | `/api/expenses` | Catat pengeluaran |
| `PUT` | `/api/expenses/:id` | Update pengeluaran |
| `DELETE` | `/api/expenses/:id` | Hapus pengeluaran |

### Sales Tracker
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/sales-tracker` | Semua tracker (opsional `?storeId=`) |
| `GET` | `/api/sales-tracker/:id` | Detail tracker |
| `POST` | `/api/sales-tracker` | Catat tracker baru |
| `PUT` | `/api/sales-tracker/:id` | Update tracker |
| `DELETE` | `/api/sales-tracker/:id` | Hapus tracker |

## Scripts

| Script | Fungsi |
|--------|--------|
| `npm run dev:local` | Dev server lokal (Node.js, PostgreSQL lokal) |
| `npm run dev` | Dev server (wrangler, Neon cloud) |
| `npm run deploy` | Deploy ke Cloudflare Workers |
| `npm run sync-secrets` | Sync `.dev.vars` ke `wrangler secret put` |
| `npm run test` | Semua test (unit + integrasi) |
| `npm run test:unit` | Unit tests |
| `npm run test:integration` | Integration tests |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Prisma Migrate |
| `npm run db:push` | Push schema tanpa migrasi |
| `npm run db:studio` | Prisma Studio |
| `npm run db:seed` | Seed database |
| `npm run docker:up` | Start Docker PostgreSQL |
| `npm run docker:down` | Stop Docker PostgreSQL |
| `npm run typecheck` | TypeScript check |

## Deployment

### 1. Set Secrets

```bash
npm run sync-secrets
```

Atau manual:

```bash
echo "$DATABASE_URL" | wrangler secret put DATABASE_URL
echo "$JWT_SECRET" | wrangler secret put JWT_SECRET
```

`USE_NEON_ADAPTER` sudah ada di `[vars]` `wrangler.toml`, gak perlu di-secret.

### 2. Deploy

```bash
npm run deploy

# Atau pake environment production
npx wrangler deploy --env production
```

## Testing

### Unit tests — mock repository, test service logic

```bash
npm run test:unit
```

39 tests — auth, password, jwt, store, sales-income, expense, sales-tracker services.

### Integration tests — real HTTP + SQLite in-memory

```bash
npm run test:integration
```

34 tests — full stack (route → controller → service → repository → SQLite).

### Fast feedback tanpa database external

Gak perlu PostgreSQL jalan. Test pake SQLite in-memory, schema di-push otomatis tiap run lewat `tests/setup.ts`.
