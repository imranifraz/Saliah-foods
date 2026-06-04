# Explore Backend structure/APIs
_Exported on 6/4/2026 at 11:31:07 GMT+5:30 from Cursor (3.5.17)_

---

**User**

Analyze the Backend application at c:\Users\nniha\OneDrive\Documents\GitHub\Saliah-foods\Backend thoroughly (READ ONLY - do not modify files).

Return a detailed report covering:
1. Folder structure
2. package.json scripts and dependencies
3. Main entry file (src/index.js or similar) - how server starts, middleware, CORS, etc.
4. ALL API routes - list every route file, every endpoint (method + path), auth requirements
5. Prisma schema - all models, fields, relationships
6. Authentication (JWT, bcrypt, middleware)
7. Role-based access control
8. File upload handling
9. Error handling, validation
10. Third-party integrations (Razorpay, etc.)
11. .env.example variables
12. Seed data if any

Read actual source files to confirm functionality - don't assume from file names alone.

Format as structured bullet points with file paths.

---

**Cursor**

I'll map the Backend layout and read core config and entry files first, then trace routes, Prisma, and auth.


# Saliah Backend — Technical Analysis Report

**Location:** `c:\Users\nniha\OneDrive\Documents\GitHub\Saliah-foods\Backend`  
**Stack:** Node.js (ES modules) · Express 5 · Prisma 6 · PostgreSQL · JWT · bcryptjs · Razorpay · multer

---

## 1. Folder Structure

```
Backend/
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── scripts/
│   ├── backfill-product-variants.js
│   ├── backfill-review-aggregates.js
│   ├── check-admin.mjs
│   ├── list-tables.js
│   └── list-users.mjs
└── src/
    ├── index.js              # Server bootstrap
    ├── app.js                # Express app + route mounting
    ├── lib/
    │   ├── auth.js           # JWT sign/verify, session user shape
    │   ├── best-sellers.js
    │   ├── home-cms.js
    │   ├── notifications.js
    │   ├── orderCancel.js
    │   ├── paths.js          # Static asset path resolution
    │   ├── prisma.js         # Prisma client singleton
    │   ├── product-response.js
    │   ├── products.js
    │   ├── razorpay.js
    │   ├── razorpayRefund.js
    │   └── reviews.js
    ├── middleware/
    │   ├── auth.js           # requireAuth, optionalAuth
    │   ├── admin.js          # requireAdmin
    │   └── error.js          # notFound, errorHandler
    └── routes/
        ├── auth.js
        ├── products.js
        ├── orders.js
        ├── addresses.js
        ├── wishlist.js
        ├── blog.js
        ├── cms.js
        ├── categories.js
        ├── payments.js
        ├── notifications.js
        ├── reviews.js
        └── admin/
            ├── index.js
            ├── auth.js
            ├── dashboard.js
            ├── orders.js
            ├── products.js
            ├── inventory.js
            ├── users.js
            ├── categories.js
            ├── cms.js
            ├── payments.js
            ├── transactions.js
            ├── analytics.js
            ├── reviews.js
            └── notifications.js
```

**Runtime directories (not in repo):**
- `uploads/products/` — product images (`Backend/.gitignore`)
- `uploads/cms/` — CMS images

---

## 2. `package.json` — Scripts & Dependencies

**File:** `Backend/package.json`

### Scripts
| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `node --watch src/index.js` | Dev server with auto-reload |
| `start` | `node src/index.js` | Production start |
| `db:generate` | `prisma generate` | Generate Prisma client |
| `db:migrate` | `prisma migrate dev` | Run migrations |
| `db:push` | `prisma db push` | Push schema to DB |
| `db:seed` | `node prisma/seed.js` | Seed database |
| `db:backfill:variants` | `node scripts/backfill-product-variants.js` | Backfill variants |
| `db:backfill:reviews` | `node scripts/backfill-review-aggregates.js` | Backfill review aggregates |
| `db:studio` | `prisma studio` | Prisma Studio UI |

### Dependencies
- `@prisma/client` ^6.8.2
- `bcryptjs` ^3.0.2
- `cors` ^2.8.5
- `dotenv` ^16.5.0
- `express` ^5.1.0
- `jsonwebtoken` ^9.0.2
- `multer` ^2.1.1
- `razorpay` ^2.9.6

### Dev dependencies
- `prisma` ^6.8.2

---

## 3. Main Entry & Server Setup

### Bootstrap — `Backend/src/index.js`
- Loads `dotenv/config`
- Connects Prisma (`prisma.$connect()`)
- Listens on `0.0.0.0` at `PORT` (default **3001**)
- Exits with code 1 on startup failure

### Express app — `Backend/src/app.js`

**Middleware (in order):**
1. **CORS** — origins from `CORS_ORIGIN` (comma-separated) or defaults `http://localhost:5173`, `http://localhost:5174`; `credentials: true`
2. **`express.json()`** — JSON body parsing
3. **Static files:**
   - `/uploads` → `uploads/` (runtime uploads)
   - `/assets` → customer storefront assets via `customerPublicAssetsDir()` (`Backend/src/lib/paths.js`)

**Health check:**
- `GET /api/health` → `{ ok: true, service: "saliah-dates-api" }`

**Route mounting:** all API routes under `/api/*` (see section 4)

**Error handling (last):**
- `notFound` → 404 JSON
- `errorHandler` → logs error, returns `{ ok: false, error }` with `err.status ?? 500`

---

## 4. ALL API Routes

Auth legend:
- **Public** — no token
- **Bearer** — `Authorization: Bearer <JWT>` via `requireAuth`
- **Admin** — Bearer + admin check via `requireAdmin`

### Root
| Method | Path | Auth | File |
|--------|------|------|------|
| GET | `/api/health` | Public | `src/app.js` |

---

### Customer Auth — mount: `/api/auth` (`src/routes/auth.js`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/api/auth/register` | Public | Email/phone/password validation; bcrypt hash; creates `NotificationPrefs` |
| POST | `/api/auth/login` | Public | Local email/password |
| POST | `/api/auth/social` | Public | OAuth-style sign-in; creates user if new |
| GET | `/api/auth/me` | Bearer | Current user session |
| PATCH | `/api/auth/profile` | Bearer | Update name, email, phone, DOB, profileNote |
| PATCH | `/api/auth/password` | Bearer | Set/change password (min 6 chars) |
| DELETE | `/api/auth/account` | Bearer | Hard delete user |

---

### Products — mount: `/api/products` (`src/routes/products.js`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/products` | Public | Query: `?category=` (or `best-sellers`); active products only |
| GET | `/api/products/slug/:slug` | Public | Single product by slug |
| GET | `/api/products/slug/:slug/reviews` | Public | Approved reviews + summary |
| GET | `/api/products/:slug/related` | Public | Up to 4 same-category products |

---

### Orders — mount: `/api/orders` (`src/routes/orders.js`)

**All routes use `requireAuth` (router-level).**

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/orders` | Bearer | User's orders |
| GET | `/api/orders/:id` | Bearer | Single order (owner only) |
| POST | `/api/orders` | Bearer | Place order; **Razorpay only**; requires `paymentVerificationToken`; decrements stock |
| PATCH | `/api/orders/:id/cancel` | Bearer | Cancel if status `placed` or `confirmed`; triggers Razorpay refund |

---

### Addresses — mount: `/api/addresses` (`src/routes/addresses.js`)

**All routes: Bearer**

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/addresses` | List user addresses |
| POST | `/api/addresses` | Create; first address auto-default |
| PATCH | `/api/addresses/:id/default` | Set default |
| PATCH | `/api/addresses/:id` | Update fields |
| DELETE | `/api/addresses/:id` | Delete; reassigns default if needed |

---

### Wishlist — mount: `/api/wishlist` (`src/routes/wishlist.js`)

**All routes: Bearer**

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/wishlist` | List items |
| POST | `/api/wishlist` | Add/upsert by `variantId` or `slug+packSize` |
| DELETE | `/api/wishlist/:identifier` | Delete by `variantId` or query `?slug=&packSize=` |

---

### Blog — mount: `/api/blog` (`src/routes/blog.js`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/blog` | Public | Query: `?category=` |
| GET | `/api/blog/:id` | Public | Single post |

---

### CMS (public) — mount: `/api/cms` (`src/routes/cms.js`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/cms/home` | Public | Homepage CMS (published only) |
| GET | `/api/cms/pages` | Public | Published page list |
| GET | `/api/cms/pages/:slug` | Public | Published page by slug |

---

### Categories (public) — mount: `/api/categories` (`src/routes/categories.js`)

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/categories` | Public — active categories only |

---

### Payments — mount: `/api/payments` (`src/routes/payments.js`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/payments/methods` | Public | Enabled methods, shipping settings, Razorpay flags |
| POST | `/api/payments/test/verify` | Bearer | Mock payment when Razorpay not configured |
| POST | `/api/payments/razorpay/order` | Bearer | Create Razorpay order |
| POST | `/api/payments/razorpay/verify` | Bearer | Verify signature; returns JWT verification token |

---

### Notifications (customer) — mount: `/api/notifications` (`src/routes/notifications.js`)

**All routes: Bearer**

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/notifications` | Last 50 customer notifications |
| POST | `/api/notifications/read` | Mark read (`ids[]` or `all`) |
| POST | `/api/notifications/dismiss` | Dismiss (`ids[]` or `all`) |
| GET | `/api/notifications/prefs` | Get/create notification preferences |
| PUT | `/api/notifications/prefs` | Update prefs |

---

### Reviews (customer) — mount: `/api/reviews` (`src/routes/reviews.js`)

**All routes: Bearer**

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/reviews/mine` | Reviewable items from delivered orders |
| POST | `/api/reviews` | Submit/resubmit review (pending moderation) |

---

### Admin — mount: `/api/admin` (`src/routes/admin/index.js`)

#### Admin Auth — `/api/admin/auth` (`src/routes/admin/auth.js`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/api/admin/auth/login` | Public | Admin-only login (role or `ADMIN_EMAIL`) |

#### Admin session

| Method | Path | Auth | File |
|--------|------|------|------|
| GET | `/api/admin/me` | Admin | `src/routes/admin/index.js` |

#### Dashboard — `/api/admin/dashboard` (`src/routes/admin/dashboard.js`)

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/admin/dashboard` | Admin — stats + 5 recent orders |

#### Admin Orders — `/api/admin/orders` (`src/routes/admin/orders.js`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/admin/orders` | Admin | Query: `?status=` |
| GET | `/api/admin/orders/:id` | Admin | Order detail |
| PATCH | `/api/admin/orders/:id` | Admin | Update status/tracking; cancel (before packed) |

#### Admin Products — `/api/admin/products` (`src/routes/admin/products.js`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/api/admin/products/sync-best-sellers` | Admin | Sync from sales |
| GET | `/api/admin/products` | Admin | All products |
| GET | `/api/admin/products/:id` | Admin | Single product |
| POST | `/api/admin/products` | Admin | Create (multipart, up to 8 images) |
| PATCH | `/api/admin/products/:id` | Admin | Update (multipart) or quick `inStock` toggle |
| DELETE | `/api/admin/products/:id` | Admin | Delete product |

#### Admin Inventory — `/api/admin/inventory` (`src/routes/admin/inventory.js`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/admin/inventory` | Admin | Query: `?stock=`, `?q=` |
| PATCH | `/api/admin/inventory/:id` | Admin | Update variant stock quantity |

#### Admin Users — `/api/admin/users` (`src/routes/admin/users.js`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/admin/users` | Admin | Query: `?role=`, `?q=` |
| GET | `/api/admin/users/:id` | Admin | User + recent orders |
| POST | `/api/admin/users` | Admin | Create user (customer/admin) |
| PATCH | `/api/admin/users/:id` | Admin | Update role/profile |
| DELETE | `/api/admin/users/:id` | Admin | Cannot delete self or admins |

#### Admin Categories — `/api/admin/categories` (`src/routes/admin/categories.js`)

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/admin/categories` | Admin |
| POST | `/api/admin/categories` | Admin |
| GET | `/api/admin/categories/:id` | Admin |
| PATCH | `/api/admin/categories/:id` | Admin — can rename ID (cascades to products) |
| DELETE | `/api/admin/categories/:id` | Admin — blocked if products exist |

#### Admin CMS — `/api/admin/cms` (`src/routes/admin/cms.js`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/admin/cms/home` | Admin | Homepage CMS |
| PUT | `/api/admin/cms/home` | Admin | Update homepage |
| POST | `/api/admin/cms/upload` | Admin | Image upload (single `image` field) |
| GET | `/api/admin/cms/pages` | Admin | All CMS pages |
| GET | `/api/admin/cms/pages/:slug` | Admin | Single page |
| PUT | `/api/admin/cms/pages/:slug` | Admin | Upsert page |
| GET | `/api/admin/cms/blog` | Admin | Blog list |
| GET | `/api/admin/cms/blog/:id` | Admin | Blog post |
| POST | `/api/admin/cms/blog` | Admin | Create post |
| PATCH | `/api/admin/cms/blog/:id` | Admin | Update post |
| DELETE | `/api/admin/cms/blog/:id` | Admin | Delete post |

#### Admin Payments — `/api/admin/payments` (`src/routes/admin/payments.js`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/admin/payments` | Admin | Methods + store settings |
| PATCH | `/api/admin/payments/methods/:id` | Admin | Update payment method |
| POST | `/api/admin/payments/methods` | Admin | Create payment method |
| PUT | `/api/admin/payments/store` | Admin | Shipping/checkout settings |

#### Admin Transactions — `/api/admin/transactions` (`src/routes/admin/transactions.js`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/admin/transactions` | Admin | Query: `?status=`; derived from orders |

#### Admin Analytics — `/api/admin/analytics` (`src/routes/admin/analytics.js`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/admin/analytics` | Admin | Query: `?range=`, `?groupBy=`, `?from=`, `?to=` |

#### Admin Reviews — `/api/admin/reviews` (`src/routes/admin/reviews.js`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/admin/reviews` | Admin | Query: `?status=` (default `pending`) |
| PATCH | `/api/admin/reviews/:id` | Admin | Moderate (pending/approved/rejected) |

#### Admin Notifications — `/api/admin/notifications` (`src/routes/admin/notifications.js`)

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/admin/notifications` | Admin |
| POST | `/api/admin/notifications/read` | Admin |
| POST | `/api/admin/notifications/dismiss` | Admin |

---

## 5. Prisma Schema

**File:** `Backend/prisma/schema.prisma`  
**Database:** PostgreSQL via `DATABASE_URL`

### Enums
| Enum | Values |
|------|--------|
| `UserRole` | `customer`, `admin` |
| `ProductType` | `simple`, `variant` |
| `ProductStatus` | `active`, `draft` |
| `VariantStockStatus` | `in_stock`, `out_of_stock` |
| `ReviewStatus` | `pending`, `approved`, `rejected` |
| `OrderStatus` | `placed`, `confirmed`, `packed`, `shipped`, `out_for_delivery`, `delivered`, `cancelled` |
| `NotificationAudience` | `customer`, `admin` |

### Models & Relationships

**User** (`id` cuid)
- Fields: `fullName`, `email` (unique), `phone`, `passwordHash?`, `role`, `dateOfBirth`, `profileNote`, `provider?`, `providerId?`, timestamps
- Relations: `addresses[]`, `orders[]`, `reviews[]`, `wishlistItems[]`, `notificationPrefs?`, `notifications[]`

**Address** → `User` (Cascade delete)

**Product** (`catalogId`, `slug` unique)
- Pricing/inventory summary fields + `variants[]`, `reviews[]`
- No FK to `Category` (uses string `categoryId` / `categoryLabel`)

**ProductVariant** → `Product` (Cascade); unique `[productId, weight]`, unique `sku`

**Order** (custom string `id`, e.g. `SAL-...`)
- `userId?` → `User` (SetNull); `customer` JSON; `statusHistory` JSON
- Relations: `items[]`, `reviews[]`

**OrderItem** → `Order` (Cascade); optional `review` (1:1)

**Review** → `User`, `Order`, `OrderItem` (unique), `Product`, optional `ProductVariant`

**WishlistItem** → `User`; unique `[userId, variantId]`

**Category** (string `id` as PK)

**BlogPost** (string `id` as PK); `content` JSON

**CmsPage** (`slug` PK); `body` JSON

**PaymentMethod** (string `id` as PK)

**StoreSetting** (`key` PK, `value` JSON)

**NotificationPrefs** → `User` (1:1, userId PK)

**Notification** → optional `User`; indexed by audience/user/date

---

## 6. Authentication

### JWT — `Backend/src/lib/auth.js`
- **Sign:** `jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "7d" })`
- **Verify:** `jwt.verify(token, JWT_SECRET)`
- Secret: `process.env.JWT_SECRET` (fallback `"dev-secret"`)

### bcrypt — used in:
- `src/routes/auth.js` — register, login, password change (cost factor **10**)
- `src/routes/admin/auth.js` — admin login
- `src/routes/admin/users.js` — admin user creation
- `prisma/seed.js` — admin password hash

### Middleware — `Backend/src/middleware/auth.js`
- **`requireAuth`:** Requires `Authorization: Bearer <token>`; loads user from DB; sets `req.user`
- **`optionalAuth`:** Exported but **not used** by any route currently

### Social auth — `POST /api/auth/social`
- Accepts `provider`, `fullName`, `email`, `phone`, `providerId`
- No OAuth token verification server-side; trusts client-provided email
- Creates user without password if new

---

## 7. Role-Based Access Control

### Role storage
- Prisma `UserRole` enum on `User.role` (default `customer`)

### Admin gate — `Backend/src/middleware/admin.js` (`requireAdmin`)
User is admin if **either**:
1. `user.role === "admin"`, **or**
2. `user.email === process.env.ADMIN_EMAIL` (case-insensitive)

Non-admins get **403** `{ error: "Admin access required" }`.

### Admin login — `src/routes/admin/auth.js`
- Same admin check before issuing token
- Returns generic "Invalid admin credentials" for non-admins

### Admin user management protections — `src/routes/admin/users.js`
- Cannot demote self from admin
- Cannot delete self
- Cannot delete admin accounts

### Customer-only data isolation
- Orders, addresses, wishlist, notifications scoped to `req.user.id`
- Reviews validated against order ownership

---

## 8. File Upload Handling

### Product images — `Backend/src/routes/admin/products.js`
- **Library:** multer disk storage
- **Directory:** `uploads/products/` (auto-created)
- **Field:** `images` (array, max **8** files)
- **Limit:** 5 MB per file
- **Filename:** `{slugified-name}-{timestamp}-{random}.{ext}`
- **Served at:** `/uploads/products/{filename}`
- Used on `POST /api/admin/products` and `PATCH /api/admin/products/:id`

### CMS images — `Backend/src/routes/admin/cms.js`
- **Directory:** `uploads/cms/`
- **Field:** single `image`
- **Limit:** 8 MB
- **Filter:** `mimetype` must start with `image/`
- **Allowed extensions:** `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.svg`
- **Endpoint:** `POST /api/admin/cms/upload` → returns `{ url: "/uploads/cms/..." }`

### Static serving — `Backend/src/app.js`
- `app.use("/uploads", express.static(...))` serves all uploads

---

## 9. Error Handling & Validation

### Global error handling — `Backend/src/middleware/error.js`
- **404:** `{ ok: false, error: "Route not found" }`
- **500+:** logs to console; returns `{ ok: false, error: err.message }` with optional `err.status`

### Route-level validation patterns
- **Inline validators** in auth routes (`EMAIL_RE`, `PHONE_RE`, password length)
- **Manual checks** with 400/409 responses (duplicate email, invalid payloads)
- **Prisma error codes:**
  - `P2002` → 409 (unique constraint: slug, SKU, email, etc.)
  - `P2025` → 404 (record not found)
- **Business rule errors** thrown as `Error` with messages (e.g. stock, payment verification) → caught by `next(err)` → 500 unless `err.status` set (categories route sets `err.status = 409`)

### Notable validation rules
| Area | Rules |
|------|-------|
| Registration | Email format, 10-digit Indian mobile, password ≥ 6, confirm match |
| Orders | Items + customer required; Razorpay-only; payment token verified; stock check |
| Reviews | Rating 1–5; comment required; order must be `delivered`; one review per order item |
| Inventory | `stockQuantity >= 0` integer |
| Products (admin) | Valid category, name, ≥1 image, variant weight/SKU uniqueness |

**No schema validation library** (no Zod/Joi/express-validator) — all manual.

---

## 10. Third-Party Integrations

### Razorpay (primary payment gateway)

**Config:** `Backend/src/lib/razorpay.js`
- Keys: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- `isRazorpayConfigured()` — both keys present
- `isTestPaymentsAllowed()` — enabled when Razorpay **not** configured and `ALLOW_TEST_PAYMENTS !== "false"`

**Payment flow:**
1. `POST /api/payments/razorpay/order` — creates Razorpay order (amount in paise)
2. Client completes checkout
3. `POST /api/payments/razorpay/verify` — HMAC-SHA256 signature verification
4. Server returns JWT `verificationToken` (30 min expiry)
5. `POST /api/orders` — verifies token, amount, userId; stores payment in `order.customer.payment` JSON

**Test mode:** `POST /api/payments/test/verify` — mock payment IDs when live keys absent

**Refunds:** `Backend/src/lib/razorpayRefund.js`
- Called on customer order cancellation
- Test refunds: synthetic `rfnd_test_*` IDs
- Live refunds: `client.payments.refund()`

### No other third-party SDKs
- No email/SMS providers wired (notification prefs include `orderSms` but no sender)
- No cloud storage (local disk only)
- Social auth has no Google/Facebook SDK verification

---

## 11. Environment Variables

### Documented in `.env.example` — `Backend/.env.example`

| Variable | Example / Purpose |
|----------|-------------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | `3001` |
| `JWT_SECRET` | JWT signing secret |
| `CORS_ORIGIN` | Comma-separated allowed origins |
| `ADMIN_EMAIL` | Default admin email for seed + admin bypass |
| `ADMIN_PASSWORD` | Default admin password for seed |
| `RAZORPAY_KEY_ID` | Razorpay test/live key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay secret |

### Used in code but NOT in `.env.example`

| Variable | Default / Behavior | File |
|----------|---------------------|------|
| `ALLOW_TEST_PAYMENTS` | `"false"` disables test payments | `src/lib/razorpay.js` |
| `CUSTOMER_ASSETS_DIR` | Override path for `/assets` static files | `src/lib/paths.js` |
| `NODE_ENV` | Prisma logging + global singleton behavior | `src/lib/prisma.js` |

---

## 12. Seed Data

**File:** `Backend/prisma/seed.js`  
**Run via:** `npm run db:seed` or `npx prisma db seed`

### What gets seeded (upserted)

| Data | Count / Details |
|------|-----------------|
| **Categories** | 4: `dates`, `premium-dates`, `wellness-traditional`, `best-sellers` |
| **Products** | 19 products with variants (stock qty 10 each), simple type, active status |
| **Blog posts** | 6 posts with JSON content blocks |
| **CMS pages** | 5: `homepage`, `about-us`, `faq`, `sourcing-quality`, `contact` |
| **Payment methods** | 2: `cod`, `upi` (informational; order API rejects non-Razorpay) |
| **Store settings** | `shipping` (free threshold 999, fee 99), `checkout` (`codEnabled: true`) |
| **Admin user** | From `ADMIN_EMAIL` / `ADMIN_PASSWORD` (default `admin@saliahfoods.com` / `admin123`), role `admin` |
| **Best sellers** | Synced from sales via `syncBestSellersFromSales()` (0 on fresh DB) |

### Seed helpers used
- `syncBestSellersFromSales` — `src/lib/best-sellers.js`
- `stockStatusFromQuantity`, `syncProductSummary` — `src/lib/products.js`
- bcrypt hash for admin password

---

## Additional Notes

- **Payment mismatch:** Seed/config still lists COD/UPI payment methods and `codEnabled: true`, but `POST /api/orders` explicitly rejects anything except `razorpay` (`src/routes/orders.js`).
- **Price storage:** All monetary values stored as **integers** (INR whole rupees, not paise) except Razorpay API calls (paise).
- **Review workflow:** Customer submits → `pending` → admin approves/rejects → product `rating`/`reviewCount` synced on moderation.
- **Order cancellation windows:** Customer and admin can cancel only while status is `placed` or `confirmed` (`src/lib/orderCancel.js`); admin cancellation does not auto-refund (customer cancel does).

