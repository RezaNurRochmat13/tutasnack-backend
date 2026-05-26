# TutaSnack Backend

API backend untuk TutaSnack, dibangun dengan [Hono](https://hono.dev/) dan di-deploy ke [Cloudflare Workers](https://workers.cloudflare.com/). Menggunakan [Neon](https://neon.tech/) sebagai database PostgreSQL serverless dengan [Prisma](https://www.prisma.io/) sebagai ORM.

## Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| Runtime | Cloudflare Workers (Edge) |
| Framework | Hono |
| ORM | Prisma + driver adapter Neon |
| Database | Neon (PostgreSQL serverless) |
| Validation | Zod |
| Bahasa | TypeScript |

## Struktur Project

```
src/
├── config/env.ts          # Validasi environment variables dengan Zod
├── db/prisma.ts           # Prisma client (Neon adapter)
├── repositories/          # Data access layer (query ke database)
│   ├── index.ts
│   └── user.repository.ts
├── services/              # Business logic layer
│   ├── index.ts
│   └── user.service.ts
├── routes/                # HTTP handlers (routes)
│   ├── index.ts
│   └── user.route.ts
└── index.ts               # Entry point worker
```

### Pattern: Service-Repository

```
Route (HTTP handler)
  └── Service (business logic, validasi, error handling)
        └── Repository (query ke database via Prisma)
```

- **Repository** — tanggung jawabnya cuma ngomong sama database (CRUD). Gak ada logic bisnis.
- **Service** — logic bisnis ada di sini (validasi email unik, cek user exists, dll).
- **Route** — cuma jembatan HTTP, parsing request/response.

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (otomatis terinstall)
- Akun [Neon](https://neon.tech/) (free tier cukup)
- Akun [Cloudflare](https://dash.cloudflare.com/)

## Setup

### 1. Clone & Install

```bash
npm install
```

### 2. Setup Database (Neon)

Buat project di [Neon Dashboard](https://console.neon.tech/), lalu salin 2 connection string:

| Tipe | Format | Fungsi |
|------|--------|--------|
| **Pooled** | `postgres://user:pass@ep-xxx-pooler.us-east-2.aws.neon.tech/db?sslmode=require` | Runtime query (via Neon adapter) |
| **Direct** | `postgres://user:pass@ep-xxx.us-east-2.aws.neon.tech/db?sslmode=require` | Prisma Migrate & Studio |

Isi ke file `.env` dan `.dev.vars`:

```env
DATABASE_URL="postgres://user:pass@ep-xxx-pooler.us-east-2.aws.neon.tech/db?sslmode=require"
DIRECT_URL="postgres://user:pass@ep-xxx.us-east-2.aws.neon.tech/db?sslmode=require"
```

> **Kenapa ada 2 URL?** — Pooled URL dipakai buat query dari Cloudflare Workers (via Neon WebSocket proxy). Direct URL dipakai Prisma Migrate/Studio yang butuh koneksi TCP langsung.

### 3. Migrate Database

```bash
npx prisma migrate dev --name init
```

Ini bakal bikin tabel sesuai schema di `prisma/schema.prisma` dan generate Prisma Client.

### 4. Jalankan Development

```bash
npm run dev
```

Akses di `http://localhost:8787`.

## Scripts

| Script | Fungsi |
|--------|--------|
| `npm run dev` | Jalankan dev server (`wrangler dev`) |
| `npm run deploy` | Deploy ke Cloudflare Workers |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Jalankan Prisma Migrate (dev) |
| `npm run db:push` | Push schema ke database tanpa migrasi |
| `npm run db:studio` | Buka Prisma Studio (GUI database) |
| `npm run db:seed` | Seed database |
| `npm run docker:up` | Start PostgreSQL via Docker (opsional) |
| `npm run docker:down` | Stop Docker PostgreSQL |
| `npm run typecheck` | Cek tipe TypeScript |

## API Endpoints

### Health Check

```
GET /
→ { "message": "TutaSnack API", "version": "1.0.0" }
```

### Users

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/users` | Ambil semua users |
| `GET` | `/users/:id` | Ambil user by ID |
| `POST` | `/users` | Buat user baru |
| `PUT` | `/users/:id` | Update user |
| `DELETE` | `/users/:id` | Hapus user |

**POST /users**

```json
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

## Deployment

### 1. Set Secret di Cloudflare

Database URL jangan dihardcode di `wrangler.toml`. Set sebagai secret:

```bash
echo "$DATABASE_URL" | npx wrangler secret put DATABASE_URL
```

### 2. Deploy

```bash
npm run deploy
```

## Local Development dengan Docker (Alternatif)

Kalau mau develop offline tanpa Neon, bisa pake Docker PostgreSQL:

```bash
# Start database
npm run docker:up

# Ganti .dev.vars ke localhost
DATABASE_URL="postgresql://tutasnack:tutasnack@localhost:5432/tutasnack"
DIRECT_URL="postgresql://tutasnack:tutasnack@localhost:5432/tutasnack"

# Migrate
npx prisma migrate dev --name init

# Run
npm run dev
```

> **Catatan:** ini cuma buat dev. Untuk production di Cloudflare Workers tetap perlu Neon (atau Prisma Accelerate) karena regular PrismaClient gak bisa jalan di edge runtime.
