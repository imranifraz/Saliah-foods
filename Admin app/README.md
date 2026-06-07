# Saliah Admin App

Back-office for Saliah Foods (orders, products, dashboard).

## Setup

1. Backend running on port 3001 with admin APIs enabled.
2. Run database migration and seed (creates admin user):

```bash
cd Backend
npx prisma db push
npm run seed
```

3. Install and run admin app:

```bash
cd "Admin app"
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5174

**If you see "port connection failed" or cannot reach server:**

1. Start **Backend first** (`cd Backend` → `npm run dev`) — must show port **3001**
2. Then start **Admin app** (`cd "Admin app"` → `npm run dev`) — port **5174**
3. Restart both after pulling changes (API uses Vite proxy in dev; no direct `:3001` calls needed)

## Default admin login

- Email: `admin@saliahfoods.com`
- Password: `admin123`

These credentials are created by `npm run seed` in the Backend (dev only). Change the admin password after first login in production.
