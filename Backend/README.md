# Saliah Dates — Backend API

Node.js + Express + PostgreSQL + Prisma for the Saliah Foods storefront.

## Setup

1. Create PostgreSQL database:

```sql
CREATE DATABASE saliahdates;
```

2. Install and migrate:

```bash
cd Backend
npm install
npm run db:generate
npm run db:push
npm run db:seed
```

3. Start API:

```bash
npm run dev
```

API: `http://localhost:3001`

## Environment

| Variable | Default |
|----------|---------|
| `DATABASE_URL` | `postgresql://postgres:root@localhost:5432/saliahdates` |
| `PORT` | `3001` |
| `JWT_SECRET` | change in production |
| `CORS_ORIGIN` | `http://localhost:5173` |

## API Routes

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/health` | — |
| POST | `/api/auth/register` | — |
| POST | `/api/auth/login` | — |
| POST | `/api/auth/social` | — |
| GET | `/api/auth/me` | Bearer |
| PATCH | `/api/auth/profile` | Bearer |
| PATCH | `/api/auth/password` | Bearer |
| DELETE | `/api/auth/account` | Bearer |
| GET | `/api/products` | — |
| GET | `/api/products/slug/:slug` | — |
| GET | `/api/orders` | Bearer |
| POST | `/api/orders` | Bearer |
| PATCH | `/api/orders/:id/cancel` | Bearer |
| GET/POST/PATCH/DELETE | `/api/addresses` | Bearer |
| GET/POST/DELETE | `/api/wishlist` | Bearer |
| GET | `/api/blog` | — |
| GET/PUT | `/api/notifications/prefs` | Bearer |

Frontend still uses localStorage; wire it with `VITE_API_URL=http://localhost:3001` when ready.
