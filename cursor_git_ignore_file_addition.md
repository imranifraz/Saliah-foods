# Git ignore file addition
_Exported on 6/4/2026 at 11:28:13 GMT+5:30 from Cursor (3.5.17)_

---

**User**

add git ignore to each file

---

**Cursor**

I'll explore the repo layout and any existing `.gitignore` files so we can add the right ones in each app folder.


Admin app is missing a `.gitignore`, which is why `node_modules` and `.env` are tracked. Adding `.gitignore` files at the repo root and in each app, aligned with their stack.


Added `.gitignore` files across the monorepo:

| Location | What it ignores |
|---|---|
| **Root** `.gitignore` | OS files, editor folders, log files |
| **Admin app** `.gitignore` | `node_modules/`, `dist/`, `.env*`, `.vite/`, etc. |
| **Customer app** `.gitignore` | Same Vite/React patterns (updated; was missing `.env`) |
| **Backend** `.gitignore` | `node_modules/`, `.env*`, `dist/`, `uploads/`, logs |

**Important:** `.gitignore` only affects untracked files. Some paths are already in git, so they will still show up until you remove them from the index:

- `Admin app/node_modules/` (entire folder is tracked)
- `Admin app/.env` and `Customer app/.env`
- `Backend/uploads/` (uploaded images)

To stop tracking those without deleting them locally, run:

```powershell
cd "c:\Users\nniha\OneDrive\Documents\GitHub\Saliah-foods"
git rm -r --cached "Admin app/node_modules"
git rm --cached "Admin app/.env" "Customer app/.env"
git rm -r --cached "Backend/uploads"
```

I can run those commands and commit the changes if you want.

---

**User**

I have an existing eCommerce application codebase with three main parts:

1. Admin application
2. Backend application
3. Customer/front-facing application

I want you to analyze the complete existing codebase carefully and understand what is already implemented and what is missing.

Important instructions:

* Do not modify any code.
* Do not create new files unless I ask.
* First, scan the folder structure and identify the technology stack used in each part.
* Understand the routing, pages, components, APIs, database models, authentication, role management, and business logic.
* Identify how Admin, Backend, and Customer applications are connected.
* Check environment files, package files, API services, database configuration, and deployment-related files if available.
* Do not assume features are completed only because a page or button exists. Confirm whether the actual functionality/API integration is implemented.
* Clearly separate UI-only implementation, partially implemented functionality, and fully working functionality.

Give me a detailed codebase understanding report in the following format:

# Existing eCommerce Codebase Understanding Report

## 1. Project Overview

Explain what this application appears to do based on the codebase.

## 2. Folder Structure Summary

Explain the purpose of each major folder and sub-folder.

## 3. Technology Stack

Create a table with:

* Application Part
* Technology / Framework
* Main Libraries
* Purpose

Cover:

* Admin
* Backend
* Customer application
* Database
* Authentication
* Payment / Shipping integrations if present

## 4. Admin Application Analysis

For the Admin side, identify all available modules and pages.

For each module, provide:

* Module Name
* Route / Path
* Components used
* API integration available or not
* Current status: Fully Implemented / Partially Implemented / UI Only / Missing Backend
* Notes

Check for common Admin modules such as:

* Dashboard
* Product Management
* Category Management
* Brand Management
* Inventory / Stock
* Order Management
* Customer Management
* User / Role Management
* Coupon / Offers
* Banner Management
* Reports / Analytics
* Settings
* Login / Authentication

## 5. Customer Application Analysis

For the Customer side, identify all available modules and pages.

For each module, provide:

* Module Name
* Route / Path
* Components used
* API integration available or not
* Current status: Fully Implemented / Partially Implemented / UI Only / Missing Backend
* Notes

Check for common Customer modules such as:

* Home Page
* Product Listing
* Product Details
* Search
* Filters
* Cart
* Wishlist
* Login / Registration
* Forgot Password
* Customer Profile
* Address Management
* Checkout
* Payment
* Order Placement
* Order History
* Order Tracking
* Reviews / Ratings

## 6. Backend Application Analysis

Analyze the backend and identify:

* Main server entry file
* API route files
* Controllers
* Services
* Middleware
* Models / Database schemas
* Authentication method
* Role-based access control
* File upload handling
* Error handling
* Validation handling

Create an API summary table with:

* API Endpoint
* HTTP Method
* Purpose
* Controller / File
* Authentication Required
* Used By Admin / Customer / Both
* Status

## 7. Database / Models Analysis

List all database tables/models found in the codebase.

For each model/table, mention:

* Model/Table Name
* Fields
* Relationships
* Used in which module
* Any missing or unclear relationship

## 8. Authentication and Authorization

Explain:

* Login flow
* Registration flow
* Token/session handling
* Password hashing
* Role-based access
* Protected routes
* Admin vs Customer authentication separation
* Any security gaps

## 9. Third-Party Integrations

Check whether the codebase has any integrations such as:

* Payment gateway
* Shipping API
* Email/SMS
* Cloud storage
* Maps
* Analytics
* Tax/GST
* Notification service

For each integration, mention:

* Integration Name
* Purpose
* Existing status
* Files where it is used
* Missing configuration if any

## 10. Feature Completion Matrix

Create a detailed table with these columns:

* Feature Area
* Feature
* Admin Side Status
* Customer Side Status
* Backend/API Status
* Database Status
* Overall Status
* Remarks

Use these status values only:

* Completed
* Partially Completed
* UI Only
* Backend Only
* Missing
* Needs Verification

## 11. Missing Features

List all important eCommerce features that are not found in the current codebase.

Group them under:

* Admin Missing Features
* Customer Missing Features
* Backend Missing Features
* Database Missing Items
* Integration Missing Items

## 12. Bugs / Risks / Code Quality Issues

Identify:

* Broken routes
* Unused components
* Duplicate code
* Hardcoded data
* Missing error handling
* Missing loading states
* Missing validations
* Security risks
* Performance concerns
* Incomplete API calls
* Missing environment variables

## 13. Setup and Run Instructions

Based on the codebase, explain:

* How to install dependencies
* How to run Admin
* How to run Customer app
* How to run Backend
* Required environment variables
* Database setup steps
* Any expected issues while running

## 14. Final Summary

Give a simple conclusion:

* What is already usable
* What is only UI
* What requires backend work
* What needs fixing before production
* Recommended next steps

After completing the analysis, ask me before making any code changes.


---

**Cursor**

Analyzing the full codebase without modifying anything. Exploring structure, routes, APIs, models, and integrations across all three apps.


Verifying key integration points and filling gaps the initial scan may have missed.


# Existing eCommerce Codebase Understanding Report

## 1. Project Overview

**Saliah Foods** is a premium dates and wellness foods eCommerce platform aimed at the Indian market (INR pricing, GST breakdown, Indian states, 10-digit mobile validation).

The repo is a **three-app monorepo**:

| App | Role | Dev port |
|-----|------|----------|
| **Customer app** | Public storefront | 5173 |
| **Admin app** | Back-office dashboard | 5174 |
| **Backend** | REST API + PostgreSQL | 3001 |

All three connect through a shared API at `/api/*`, with Vite dev proxies forwarding `/api`, `/uploads`, and `/assets` to the backend.

**What works end-to-end today:** customer registration/login, product catalog (when backend is up), Razorpay checkout, order placement with stock decrement, order history/cancellation, review submission/moderation, admin CRUD for products/categories/orders/users/inventory/CMS/blog, and dashboard analytics.

**What is split or incomplete:** cart, wishlist, and addresses stay in **localStorage** on the customer side even though backend APIs exist for wishlist and addresses. Several content pages (FAQ, blog, contact form, newsletter) are **static/UI-only** despite CMS/blog APIs on the backend. COD/UPI payment methods are seeded and editable in admin but **orders only accept Razorpay**.

---

## 2. Folder Structure Summary

```
Saliah-foods/
├── .gitattributes
├── .gitignore                    # Root OS/editor ignores
├── Admin app/
│   ├── src/
│   │   ├── App.jsx               # Router (19 routes)
│   │   ├── config/adminMenu.js   # Sidebar navigation
│   │   ├── context/              # Auth, theme
│   │   ├── lib/                  # apiFetch, notifications, CMS upload
│   │   ├── pages/                # 18 admin pages
│   │   └── components/           # Layout, UI kit, icons
│   ├── vite.config.js            # Port 5174, API proxy
│   └── package.json
├── Backend/
│   ├── src/
│   │   ├── index.js              # Server bootstrap
│   │   ├── app.js                # Express app + route mounting
│   │   ├── lib/                  # Auth, Razorpay, products, notifications, etc.
│   │   ├── middleware/           # auth, admin, error
│   │   └── routes/               # Public + admin route modules
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   └── seed.js               # Seed data
│   ├── scripts/                  # Backfill, admin check utilities
│   └── uploads/                  # Runtime product/CMS images (git-tracked today)
└── Customer app/
    ├── assets/                   # Static images
    ├── public/                   # sitemap.xml
    ├── scripts/                  # Image optimization, build helpers
    └── src/
        ├── App.jsx               # Router (16 routes)
        ├── components/           # UI by feature (home, cart, checkout, account, etc.)
        ├── context/              # Auth, cart, catalog, orders, wishlist, profile, CMS
        ├── data/                 # Static fallbacks (catalog, blog, pages, pricing)
        ├── services/             # API client modules (8 files)
        ├── pages/                # 16 page components (1 unused)
        └── lib/api.js            # Shared fetch wrapper
```

There is **no root `package.json`**, **no Docker/CI config**, and **no Prisma migrations folder** (schema is applied via `db:push`).

---

## 3. Technology Stack

| Application Part | Technology / Framework | Main Libraries | Purpose |
|-----------------|------------------------|----------------|---------|
| **Admin** | React 19 + Vite 6 + Tailwind CSS 4 | React Router 7, native `fetch` | Back-office dashboard |
| **Customer** | React 19 + Vite 6 + Tailwind CSS 4 | React Router 7, Framer Motion, `@react-oauth/google`, jsPDF | Storefront |
| **Backend** | Node.js (ESM) + Express 5 | Prisma 6, bcryptjs, jsonwebtoken, multer, Razorpay SDK | REST API |
| **Database** | PostgreSQL | Prisma ORM | Persistent data |
| **Authentication** | JWT (7-day expiry) | bcryptjs (cost 10) | Customer + admin sessions |
| **Payment** | Razorpay | `razorpay` npm package | Online checkout + refunds |
| **File storage** | Local disk | multer | Product & CMS image uploads |
| **Shipping** | Rule-based (no carrier API) | Store settings in DB | Free shipping threshold + flat fee |

---

## 4. Admin Application Analysis

All admin pages use real API calls via `apiFetch` in `src/lib/api.js`. **No mock data** was found in admin source.

| Module Name | Route / Path | Components Used | API Integration | Status | Notes |
|-------------|--------------|-----------------|-----------------|--------|-------|
| **Login / Authentication** | `/login` | `LoginPage`, `AuthContext`, `RequireAdmin` | `POST /api/admin/auth/login`, `GET /api/admin/me` | **Fully Implemented** | JWT in `localStorage` (`saliah-admin-token`) |
| **Dashboard / Analytics** | `/` | `DashboardPage`, KPI cards, charts, recent orders table | `GET /api/admin/dashboard`, `GET /api/admin/analytics` | **Fully Implemented** | Analytics embedded in dashboard (no separate analytics page) |
| **Category Management** | `/categories`, `/categories/new`, `/categories/:id/edit` | `CategoriesPage`, `CategoryFormPage` | Full CRUD on `/api/admin/categories` | **Fully Implemented** | Supports `featuredPromo` JSON; rename cascades to products |
| **Product Management** | `/products` | `ProductsPage` (inline create/edit modal) | CRUD + multipart upload on `/api/admin/products` | **Fully Implemented** | Up to 8 images; variant/SKU management; best-seller sync endpoint exists |
| **Inventory / Stock** | `/inventory` | `InventoryPage` | `GET/PATCH /api/admin/inventory` | **Fully Implemented** | Filter by stock status and search |
| **Order Management** | `/orders`, `/orders/:id` | `OrdersPage`, `OrderDetailPage` | `GET/PATCH /api/admin/orders` | **Fully Implemented** | Status updates, tracking notes, admin cancel (no auto-refund) |
| **Transactions** | `/transactions` | `TransactionsPage` | `GET /api/admin/transactions` | **Fully Implemented** | Derived from orders |
| **User / Customer Management** | `/users`, `/users/:id` | `UsersPage`, `UserDetailPage` | CRUD on `/api/admin/users` | **Fully Implemented** | Create customer/admin; cannot delete self or admins |
| **Review Moderation** | `/reviews` | `ReviewsPage` | `GET/PATCH /api/admin/reviews` | **Fully Implemented** | Approve/reject pending reviews |
| **CMS — Homepage** | `/cms/home`, `/cms/pages/homepage` | `CmsHomePage` | `GET/PUT /api/admin/cms/home`, `POST /api/admin/cms/upload` | **Fully Implemented** | Logo, hero banners, story, testimonials |
| **CMS — Static Pages** | `/cms/pages`, `/cms/pages/:slug` | `CmsPagesPage`, `CmsPageEditPage` | `GET/PUT /api/admin/cms/pages/:slug` | **Fully Implemented** | JSON body editor; customer app does **not** consume most of these yet |
| **Blog Management** | `/cms/blog`, `/cms/blog/:id` | `BlogPostsPage`, `BlogEditPage` | CRUD on `/api/admin/cms/blog` | **Fully Implemented** | Customer blog still uses static `data/blog.js` |
| **Payments & Shipping Settings** | `/payments` | `PaymentsPage` | `GET/PATCH /api/admin/payments` | **Partially Implemented** | Admin can edit shipping/COD settings; customer checkout ignores DB shipping values; orders reject COD |
| **Notifications** | Header bell | `AdminNotificationsBell` | `/api/admin/notifications/*` | **Fully Implemented** | Polls admin notification feed |
| **Brand Management** | — | — | — | **Missing** | No brand model or module |
| **Coupon / Offers** | — | — | — | **Missing** | No coupon system |
| **Banner Management** | Part of CMS Home | `HeroBannersEditor` in `CmsHomePage` | Via homepage CMS | **Fully Implemented** | Not a standalone module |
| **Settings (general)** | `/payments` only | — | Partial | **Partially Implemented** | Only payment/shipping settings |
| **Header Search** | Global header | `AdminLayout` search input | None | **UI Only** | Input has no handler |
| **Apps Grid Button** | Global header | `AdminLayout` | None | **UI Only** | Button does nothing |

---

## 5. Customer Application Analysis

| Module Name | Route / Path | Components Used | API Integration | Status | Notes |
|-------------|--------------|-----------------|-----------------|--------|-------|
| **Home Page** | `/` | `Hero`, `TrustStrip`, `ShopByCategory`, `PremiumDates`, `WellnessProducts`, `CustomerFavourites`, `BrandLegacy`, `Testimonials`, `BlogPosts`, `Newsletter` | Partial: `GET /api/cms/home`, catalog APIs | **Partially Implemented** | Hero/story/testimonials from CMS API with fallback; PremiumDates/Wellness/BlogPosts static; newsletter UI-only |
| **Product Listing** | `/products/:categoryId` | `ProductListingPage`, `ProductCard`, filters | `GET /api/categories`, `/api/products` (via `CatalogContext`) | **Partially Implemented** | API catalog with static fallback; search/filters/sort are **client-side only** |
| **Product Details** | `/product/:productSlug` | `ProductDetailPage`, gallery, reviews, wishlist button | Catalog + `GET /api/products/slug/:slug/reviews` | **Fully Implemented** | Pack/variant selection; add to cart |
| **Search** | Header + PLP | Header search UI, PLP filter bar | None (client-side string match) | **Partially Implemented** | No dedicated search API |
| **Filters** | PLP | `ProductListingFilterBar` | Client-side only | **Partially Implemented** | Price, benefits, packaging, availability |
| **Cart** | Drawer (global) | `CartContext`, `CartDrawer` | None — `localStorage` (`saliah-cart`) | **Partially Implemented** | Persists locally; order created at checkout via API |
| **Wishlist** | Account tab + PDP button | `WishlistContext`, `AccountWishlistSection` | None — `localStorage` per user | **UI Only** | Backend `/api/wishlist` exists but is **not wired** |
| **Login** | `/login` | `LoginPage`, `SocialAuthButtons` | `POST /api/auth/login`, `/api/auth/social` | **Fully Implemented** | Google/Facebook need env keys for production |
| **Registration** | `/register` | `RegisterPage` | `POST /api/auth/register`, `GET /api/health` | **Fully Implemented** | Offline banner if backend down |
| **Forgot Password** | — | — | — | **Missing** | No route or API |
| **Customer Profile** | `/account?tab=personal` | `AccountPersonalSection` | `PATCH /api/auth/profile`, `DELETE /api/auth/account` | **Fully Implemented** | |
| **Password Change** | `/account?tab=password` | `AccountPasswordSection` | `PATCH /api/auth/password` | **Fully Implemented** | Supports social-only users setting first password |
| **Address Management** | `/account?tab=addresses` | `AccountAddressesSection`, `ProfileContext` | None — `localStorage` | **UI Only** | Backend `/api/addresses` CRUD exists but **not wired** |
| **Checkout** | `/checkout` | `CheckoutPage`, address/summary sections | Razorpay + `POST /api/orders` | **Fully Implemented** | Requires auth; Razorpay or test payment mode |
| **Payment** | Checkout flow | Razorpay checkout.js | `POST /api/payments/razorpay/*`, test verify | **Fully Implemented** | Hardcoded `paymentMethod = "razorpay"` |
| **Order Placement** | Checkout → confirmation | `OrdersContext`, `OrderSuccessPopup` | `POST /api/orders` | **Fully Implemented** | Stock decremented server-side |
| **Order History** | `/account?tab=orders` | `AccountOrdersSection` | `GET /api/orders`, `PATCH /api/orders/:id/cancel` | **Fully Implemented** | PDF invoice generated client-side (jsPDF) |
| **Order Tracking** | Order detail modal | `OrderTrackingTimeline` | Displays `order.status` from API | **Partially Implemented** | Status-based timeline only; no carrier/shipment API |
| **Reviews / Ratings** | PDP + account | Review sections | `GET/POST /api/reviews/*`, product reviews API | **Fully Implemented** | Moderation workflow; only delivered orders |
| **Notifications** | `/account?tab=notifications` | `AccountNotificationsSection` | Full notifications API | **Fully Implemented** | Polls every 60s |
| **FAQ** | `/faq` | `FaqPage`, `FaqAccordion` | Static `data/pages.js` | **UI Only** | CMS page `faq` exists in DB but not consumed |
| **About / Legacy** | `/our-legacy`, `/about-us` | `OurLegacyPage` | Hardcoded JSX | **UI Only** | `AboutUsPage.jsx` exists but is **not routed** |
| **Sourcing & Quality** | `/sourcing-and-quality` | `SourcingQualityPage` | Static `data/pages.js` | **UI Only** | CMS page exists in seed |
| **Contact** | `/contact` | `ContactUsPage`, `ContactMap` | Static info; form is local state only | **Partially Implemented** | Map uses env or hardcoded embed URL |
| **Blog** | `/blog`, `/blog/:slug` | `BlogPage`, `BlogPostPage` | Static `data/blog.js` | **UI Only** | Backend blog API + admin CRUD exist |
| **Newsletter** | Home + blog | `Newsletter`, `BlogNewsletterCta` | None | **UI Only** | `preventDefault` only |

---

## 6. Backend Application Analysis

### Architecture

| Layer | Location | Notes |
|-------|----------|-------|
| **Entry** | `src/index.js` | Loads dotenv, connects Prisma, listens on `0.0.0.0:PORT` |
| **App setup** | `src/app.js` | CORS, JSON parser, static `/uploads` + `/assets`, route mounting, 404 + error handlers |
| **Routes** | `src/routes/*` + `src/routes/admin/*` | ~70+ endpoints |
| **Controllers** | Inline in route files | No separate controller layer |
| **Services/Libs** | `src/lib/*` | Business logic (products, reviews, Razorpay, notifications, CMS normalization) |
| **Middleware** | `src/middleware/auth.js`, `admin.js`, `error.js` | JWT auth, admin gate, global errors |
| **Models** | `prisma/schema.prisma` | 14 models, 6 enums |
| **Validation** | Inline in routes | Manual checks; no Zod/Joi |
| **File uploads** | multer in admin products + CMS routes | `uploads/products/`, `uploads/cms/` |
| **Error handling** | `notFound` + `errorHandler` | Returns `{ ok: false, error }`; logs 500s |

### API Summary (grouped)

#### Health & Auth

| API Endpoint | Method | Purpose | File | Auth | Used By | Status |
|--------------|--------|---------|------|------|---------|--------|
| `/api/health` | GET | Health check | `app.js` | No | Both | Completed |
| `/api/auth/register` | POST | Customer registration | `routes/auth.js` | No | Customer | Completed |
| `/api/auth/login` | POST | Customer login | `routes/auth.js` | No | Customer | Completed |
| `/api/auth/social` | POST | OAuth-style login/register | `routes/auth.js` | No | Customer | Partially Completed (no server-side OAuth verify) |
| `/api/auth/me` | GET | Current user | `routes/auth.js` | Bearer | Customer | Completed |
| `/api/auth/profile` | PATCH | Update profile | `routes/auth.js` | Bearer | Customer | Completed |
| `/api/auth/password` | PATCH | Change/set password | `routes/auth.js` | Bearer | Customer | Completed |
| `/api/auth/account` | DELETE | Delete account | `routes/auth.js` | Bearer | Customer | Completed |
| `/api/admin/auth/login` | POST | Admin login | `routes/admin/auth.js` | No | Admin | Completed |
| `/api/admin/me` | GET | Admin session | `routes/admin/index.js` | Admin | Admin | Completed |

#### Catalog

| API Endpoint | Method | Purpose | File | Auth | Used By | Status |
|--------------|--------|---------|------|------|---------|--------|
| `/api/products` | GET | List products (`?category=`) | `routes/products.js` | No | Customer | Completed |
| `/api/products/slug/:slug` | GET | Product by slug | `routes/products.js` | No | Customer | Completed |
| `/api/products/slug/:slug/reviews` | GET | Approved reviews | `routes/products.js` | No | Customer | Completed |
| `/api/products/:slug/related` | GET | Related products | `routes/products.js` | No | Customer | Needs Verification (customer may use catalog only) |
| `/api/categories` | GET | Active categories | `routes/categories.js` | No | Customer | Completed |
| `/api/admin/products` | GET/POST | List/create products | `routes/admin/products.js` | Admin | Admin | Completed |
| `/api/admin/products/:id` | GET/PATCH/DELETE | Product CRUD | `routes/admin/products.js` | Admin | Admin | Completed |
| `/api/admin/products/sync-best-sellers` | POST | Sync best sellers | `routes/admin/products.js` | Admin | Admin | Completed |
| `/api/admin/categories` | GET/POST | Category CRUD | `routes/admin/categories.js` | Admin | Admin | Completed |
| `/api/admin/categories/:id` | GET/PATCH/DELETE | Category CRUD | `routes/admin/categories.js` | Admin | Admin | Completed |
| `/api/admin/inventory` | GET | Inventory list | `routes/admin/inventory.js` | Admin | Admin | Completed |
| `/api/admin/inventory/:id` | PATCH | Update stock qty | `routes/admin/inventory.js` | Admin | Admin | Completed |

#### Orders & Payments

| API Endpoint | Method | Purpose | File | Auth | Used By | Status |
|--------------|--------|---------|------|------|---------|--------|
| `/api/orders` | GET/POST | List/create orders | `routes/orders.js` | Bearer | Customer | Completed |
| `/api/orders/:id` | GET | Order detail | `routes/orders.js` | Bearer | Customer | Completed |
| `/api/orders/:id/cancel` | PATCH | Cancel + refund | `routes/orders.js` | Bearer | Customer | Completed |
| `/api/admin/orders` | GET | All orders | `routes/admin/orders.js` | Admin | Admin | Completed |
| `/api/admin/orders/:id` | GET/PATCH | Detail/update | `routes/admin/orders.js` | Admin | Admin | Completed |
| `/api/payments/methods` | GET | Payment + shipping config | `routes/payments.js` | No | Customer | Partially Completed (shipping not used by customer) |
| `/api/payments/razorpay/order` | POST | Create Razorpay order | `routes/payments.js` | Bearer | Customer | Completed |
| `/api/payments/razorpay/verify` | POST | Verify payment signature | `routes/payments.js` | Bearer | Customer | Completed |
| `/api/payments/test/verify` | POST | Mock payment (dev) | `routes/payments.js` | Bearer | Customer | Completed |
| `/api/admin/payments` | GET | Payment settings | `routes/admin/payments.js` | Admin | Admin | Completed |
| `/api/admin/payments/methods/:id` | PATCH | Update method | `routes/admin/payments.js` | Admin | Admin | Completed |
| `/api/admin/payments/store` | PUT | Shipping/checkout settings | `routes/admin/payments.js` | Admin | Admin | Completed |
| `/api/admin/transactions` | GET | Transaction list | `routes/admin/transactions.js` | Admin | Admin | Completed |

#### Users, Reviews, Wishlist, Addresses

| API Endpoint | Method | Purpose | File | Auth | Used By | Status |
|--------------|--------|---------|------|------|---------|--------|
| `/api/addresses` | GET/POST | Address CRUD | `routes/addresses.js` | Bearer | — | Backend Only (customer not wired) |
| `/api/addresses/:id` | PATCH/DELETE | Address CRUD | `routes/addresses.js` | Bearer | — | Backend Only |
| `/api/wishlist` | GET/POST | Wishlist CRUD | `routes/wishlist.js` | Bearer | — | Backend Only (customer not wired) |
| `/api/wishlist/:identifier` | DELETE | Remove item | `routes/wishlist.js` | Bearer | — | Backend Only |
| `/api/reviews/mine` | GET | Reviewable items | `routes/reviews.js` | Bearer | Customer | Completed |
| `/api/reviews` | POST | Submit review | `routes/reviews.js` | Bearer | Customer | Completed |
| `/api/admin/reviews` | GET/PATCH | Moderate reviews | `routes/admin/reviews.js` | Admin | Admin | Completed |
| `/api/admin/users` | GET/POST | User management | `routes/admin/users.js` | Admin | Admin | Completed |
| `/api/admin/users/:id` | GET/PATCH/DELETE | User detail | `routes/admin/users.js` | Admin | Admin | Completed |

#### CMS, Blog, Notifications, Analytics

| API Endpoint | Method | Purpose | File | Auth | Used By | Status |
|--------------|--------|---------|------|------|---------|--------|
| `/api/cms/home` | GET | Homepage CMS | `routes/cms.js` | No | Customer | Completed |
| `/api/cms/pages` | GET | Published pages list | `routes/cms.js` | No | — | Backend Only |
| `/api/cms/pages/:slug` | GET | Published page | `routes/cms.js` | No | — | Backend Only |
| `/api/blog` | GET | Blog posts | `routes/blog.js` | No | — | Backend Only |
| `/api/blog/:id` | GET | Blog post | `routes/blog.js` | No | — | Backend Only |
| `/api/admin/cms/home` | GET/PUT | Edit homepage CMS | `routes/admin/cms.js` | Admin | Admin | Completed |
| `/api/admin/cms/upload` | POST | CMS image upload | `routes/admin/cms.js` | Admin | Admin | Completed |
| `/api/admin/cms/pages` | GET | All CMS pages | `routes/admin/cms.js` | Admin | Admin | Completed |
| `/api/admin/cms/pages/:slug` | GET/PUT | Edit CMS page | `routes/admin/cms.js` | Admin | Admin | Completed |
| `/api/admin/cms/blog` | GET/POST | Blog CRUD | `routes/admin/cms.js` | Admin | Admin | Completed |
| `/api/admin/cms/blog/:id` | GET/PATCH/DELETE | Blog CRUD | `routes/admin/cms.js` | Admin | Admin | Completed |
| `/api/notifications/*` | Various | Customer notifications | `routes/notifications.js` | Bearer | Customer | Completed |
| `/api/admin/notifications/*` | Various | Admin notifications | `routes/admin/notifications.js` | Admin | Admin | Completed |
| `/api/admin/dashboard` | GET | Dashboard stats | `routes/admin/dashboard.js` | Admin | Admin | Completed |
| `/api/admin/analytics` | GET | Revenue/analytics | `routes/admin/analytics.js` | Admin | Admin | Completed |

---

## 7. Database / Models Analysis

| Model/Table | Key Fields | Relationships | Used In | Notes |
|-------------|-----------|---------------|---------|-------|
| **User** | email, phone, passwordHash, role, provider | addresses, orders, reviews, wishlist, notifications | Auth, orders, admin users | Social users may have no password |
| **Address** | label, fullName, address lines, pincode, isDefault | → User (cascade) | Backend only today | Customer uses localStorage instead |
| **Product** | slug, catalogId, pricing, categoryId (string), images, flags | variants[], reviews[] | Catalog, admin products | **No FK to Category** — categoryId is a string |
| **ProductVariant** | sku, weight, price, stockQuantity, stockStatus | → Product (cascade) | Inventory, checkout, orders | Unique SKU; stock decremented on order |
| **Category** | id (string PK), label, featuredPromo JSON | None (loose link via Product.categoryId) | Categories, PLP | featuredPromo for category promos |
| **Order** | custom id (SAL-…), status, totals, customer JSON, statusHistory JSON | → User?, items[], reviews[] | Orders, admin, analytics | Payment details stored in customer JSON |
| **OrderItem** | product/variant refs, qty, price | → Order; optional review | Orders, reviews | |
| **Review** | rating, comment, status (pending/approved/rejected) | → User, Order, OrderItem, Product, Variant | PDP, account, admin moderation | One review per order item |
| **WishlistItem** | slug, variantId, product snapshot fields | → User | Backend only | Customer not wired |
| **BlogPost** | title, content JSON, category, featured | Standalone | Admin blog; seed data | Customer uses static data |
| **CmsPage** | slug PK, body JSON, published | Standalone | Admin CMS; partial customer use | FAQ/about/contact seeded but not fetched by customer |
| **PaymentMethod** | id, label, enabled | Standalone | Admin payments | COD/UPI seeded but orders reject non-Razorpay |
| **StoreSetting** | key, value JSON | Standalone | Shipping (`shipping`), checkout (`checkout`) | Customer ignores shipping from API |
| **NotificationPrefs** | orderTracking, deliveryUpdates, etc. | → User (1:1) | Customer notifications | `orderSms` pref exists but no SMS sender |
| **Notification** | audience, type, title, message, dedupeKey | → User? | Both apps | In-app notifications only |

**Missing / unclear relationships:**
- Product ↔ Category has no foreign key (orphan categoryIds possible)
- WishlistItem has optional productId/variantId but no Prisma relations to Product
- No Brand, Coupon, Shipment, or Cart tables (cart is client-side)

---

## 8. Authentication and Authorization

### Login flows

**Customer:**
1. Email/password → `POST /api/auth/login` → JWT (7 days) stored in `localStorage` (`saliah-token`)
2. Register → `POST /api/auth/register` with validation (email, 10-digit phone, password ≥ 6)
3. Social → client decodes Google JWT or Facebook response → `POST /api/auth/social` with email/name/providerId
4. On mount → `GET /api/auth/me` validates token; cached user in `saliah-session`

**Admin:**
1. `POST /api/admin/auth/login` → separate token key (`saliah-admin-token`)
2. Session via `GET /api/admin/me`
3. `RequireAdmin` guards all dashboard routes

### Token / session
- Same `JWT_SECRET` for customer tokens, payment verification tokens (30 min), and admin tokens
- No refresh token mechanism
- No server-side session revocation

### Password hashing
- bcryptjs, cost factor 10

### Role-based access
- Roles: `customer`, `admin` (Prisma enum)
- Admin gate: `role === "admin"` **OR** email matches `ADMIN_EMAIL` env var
- Customer data scoped to `req.user.id` on protected routes
- Admin cannot delete self or other admins

### Separation
- Separate login endpoints and localStorage keys for admin vs customer
- Same JWT secret and User table for both roles

### Security gaps
| Issue | Severity |
|-------|----------|
| Social auth trusts client-provided email without OAuth token verification | High |
| `JWT_SECRET` defaults to `"dev-secret"` if unset | High |
| `.env` files may be git-tracked (Admin app `.env` is tracked) | High |
| No forgot-password / email verification | Medium |
| No rate limiting on auth endpoints | Medium |
| `optionalAuth` middleware exported but unused | Low |
| Admin cancel does not trigger Razorpay refund (customer cancel does) | Medium (business logic) |

---

## 9. Third-Party Integrations

| Integration | Purpose | Status | Files | Missing Config |
|-------------|---------|--------|-------|----------------|
| **Razorpay** | Online payments + refunds | **Implemented** (test mode fallback) | `Backend/src/lib/razorpay.js`, `razorpayRefund.js`, `routes/payments.js`, Customer `paymentApi.js` | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` in Backend `.env` |
| **Google OAuth** | Social login | **Partially Implemented** | Customer `SocialAuthButtons.jsx`, `AppProviders.jsx` | `VITE_GOOGLE_CLIENT_ID`; dev demo user without it |
| **Facebook Login** | Social login | **Partially Implemented** | Customer `SocialAuthButtons.jsx` | `VITE_FACEBOOK_APP_ID`; dev demo without it |
| **Google Maps Embed** | Contact page map | **Partially Implemented** | `data/contactMap.js`, `ContactMap.jsx` | `VITE_GOOGLE_MAPS_EMBED_URL` or API key |
| **jsPDF** | Order invoice PDF | **Client-only** | Customer `accountUtils.js` | `VITE_SALIAH_GST_NUMBER` for GST on invoice |
| **Email/SMS** | Notifications, contact form | **Missing** | Notification prefs include `orderSms` but no sender | SMTP/SMS provider not integrated |
| **Cloud storage** | Image hosting | **Missing** | Local `uploads/` only | S3/CDN not configured |
| **Shipping carrier** | Tracking | **Missing** | Status timeline only | Shiprocket/Delhivery etc. not present |
| **Analytics (web)** | GA/Meta pixel | **Missing** | — | — |
| **Tax/GST** | Checkout breakdown | **Client-calculated** | `data/pricing.js` | Hardcoded GST logic on frontend |

---

## 10. Feature Completion Matrix

| Feature Area | Feature | Admin | Customer | Backend/API | Database | Overall | Remarks |
|-------------|---------|-------|----------|-------------|----------|---------|---------|
| Auth | Email/password login | Completed | Completed | Completed | Completed | **Completed** | |
| Auth | Registration | — | Completed | Completed | Completed | **Completed** | |
| Auth | Social login | — | Partially Completed | Partially Completed | Completed | **Partially Completed** | No server OAuth verify |
| Auth | Forgot password | Missing | Missing | Missing | Missing | **Missing** | |
| Auth | Admin login | Completed | — | Completed | Completed | **Completed** | |
| Catalog | Product listing | Completed | Partially Completed | Completed | Completed | **Partially Completed** | Static fallback if API down |
| Catalog | Product detail | Completed | Completed | Completed | Completed | **Completed** | |
| Catalog | Categories | Completed | Completed | Completed | Completed | **Completed** | |
| Catalog | Search | UI Only | Partially Completed | Missing | — | **Partially Completed** | Client-side only |
| Catalog | Filters/sort | — | Partially Completed | Missing | — | **Partially Completed** | Client-side only |
| Catalog | Brand management | Missing | Missing | Missing | Missing | **Missing** | |
| Cart | Add/update/remove | — | Partially Completed | Missing | Missing | **Partially Completed** | localStorage only |
| Wishlist | Save items | — | UI Only | Completed | Completed | **Partially Completed** | Backend ready, not wired |
| Inventory | Stock management | Completed | — | Completed | Completed | **Completed** | Decrements on order |
| Orders | Place order | — | Completed | Completed | Completed | **Completed** | Razorpay only |
| Orders | Order history | Completed | Completed | Completed | Completed | **Completed** | |
| Orders | Cancel order | Completed | Completed | Completed | Completed | **Partially Completed** | Admin cancel no refund |
| Orders | Tracking | Partially Completed | Partially Completed | Partially Completed | Completed | **Partially Completed** | Status timeline only |
| Payments | Razorpay | Completed | Completed | Completed | — | **Completed** | |
| Payments | COD/UPI | Partially Completed | Missing | Backend Only | Completed | **Partially Completed** | Seeded but orders reject COD |
| Addresses | CRUD | — | UI Only | Completed | Completed | **Partially Completed** | Backend ready, not wired |
| Reviews | Submit/view | Completed | Completed | Completed | Completed | **Completed** | Moderation workflow |
| CMS | Homepage | Completed | Partially Completed | Completed | Completed | **Partially Completed** | Some sections still static |
| CMS | Static pages (FAQ, etc.) | Completed | UI Only | Completed | Completed | **Partially Completed** | Admin edits don't reach customer |
| CMS | Blog | Completed | UI Only | Completed | Completed | **Partially Completed** | Customer uses static data |
| CMS | Hero banners | Completed | Completed | Completed | Completed | **Completed** | Via homepage CMS |
| Users | Customer management | Completed | — | Completed | Completed | **Completed** | |
| Users | Role management | Completed | — | Completed | Completed | **Completed** | customer/admin only |
| Notifications | In-app | Completed | Completed | Completed | Completed | **Completed** | |
| Notifications | Email/SMS | Missing | Missing | Missing | Partially Completed | **Missing** | Prefs exist, no sender |
| Analytics | Dashboard/reports | Completed | — | Completed | Completed | **Completed** | Embedded in dashboard |
| Marketing | Coupons/offers | Missing | Missing | Missing | Missing | **Missing** | |
| Marketing | Newsletter | — | UI Only | Missing | Missing | **Missing** | |
| Contact | Contact form | — | UI Only | Missing | Missing | **Missing** | |
| Shipping | Fee rules | Completed | Partially Completed | Completed | Completed | **Partially Completed** | Customer hardcodes ₹999/₹99 |
| Invoices | PDF download | — | Completed | Missing | — | **Partially Completed** | Client-generated |

---

## 11. Missing Features

### Admin Missing Features
- Brand management module
- Coupon / discount / promo code management
- Dedicated analytics page (currently embedded in dashboard)
- Email/SMS campaign tools
- Shipping carrier integration panel
- General site settings (SEO, tax rules, email templates)
- Functional global search
- Audit logs / activity history

### Customer Missing Features
- Forgot / reset password
- Backend-synced addresses and wishlist
- Backend-driven blog and static CMS pages (FAQ, about, sourcing)
- Working contact form and newsletter signup
- Coupon application at checkout
- COD / UPI offline payment (despite admin config)
- Live shipment tracking
- Server-side product search with pagination
- Dedicated order detail route (orders shown in account tab only)

### Backend Missing Features
- Password reset / email verification endpoints
- Email/SMS notification delivery
- Coupon/discount engine
- Brand entity and APIs
- Server-side search/filter/pagination for products
- Contact form / newsletter subscription endpoints
- OAuth token verification for social login
- Rate limiting and request validation library
- Prisma migration history (uses `db:push` only)
- Cart persistence API

### Database Missing Items
- Brand table
- Coupon / promotion tables
- Cart table
- Shipment / tracking table
- Contact inquiry / newsletter subscriber tables
- Password reset token table
- Audit log table
- FK constraint between Product.categoryId and Category.id

### Integration Missing Items
- Email provider (SendGrid, SES, etc.)
- SMS provider (Twilio, MSG91, etc.)
- Cloud storage (S3, Cloudinary)
- Shipping API (Shiprocket, Delhivery, etc.)
- Web analytics (GA4, etc.)
- Production deployment config (Docker, CI/CD)

---

## 12. Bugs / Risks / Code Quality Issues

### Broken / unused routes & components
- `AboutUsPage.jsx` exists but `/about-us` routes to `OurLegacyPage`
- Legacy `placeOrder()` in `CartContext` is never called (dead code)
- Legacy `data/orders.js` localStorage helpers unused
- Admin header search and Apps button are non-functional

### Frontend–backend mismatches
- **Wishlist & addresses:** Backend APIs built; customer still uses localStorage
- **Blog & CMS pages:** Admin can edit; customer reads static files
- **Shipping settings:** Admin saves to DB; customer hardcodes `FREE_SHIPPING_THRESHOLD = 999`, `SHIPPING_FEE = 99`
- **COD/UPI:** Seeded and editable in admin; `POST /api/orders` rejects anything except `razorpay`

### Hardcoded data
- Static catalog fallback in `Customer app/src/data/productCatalog.js`
- Static blog in `data/blog.js`
- Static FAQ/contact/sourcing in `data/pages.js`
- Homepage sections (PremiumDates, WellnessProducts, TrustStrip) in `data/homepage.js`

### Security risks
- Default `JWT_SECRET = "dev-secret"`
- Social login accepts unverified client claims
- `.env` files may be committed (Admin `.env` is tracked)
- `node_modules` tracked in Admin app git history
- Uploaded images in `Backend/uploads/` committed to git
- No rate limiting, CSRF protection, or input schema validation library

### Missing error / loading states
- Customer `RequireAuth` does not wait for `authReady` (possible redirect flash)
- Some customer CMS sections fail silently to static fallback
- Checkout `fetchPaymentMethodsApi` errors are swallowed (`.catch(() => {})`)

### Environment variables
| Variable | App | In `.env.example`? |
|----------|-----|-------------------|
| `DATABASE_URL`, `JWT_SECRET`, `RAZORPAY_*`, `ADMIN_*`, `CORS_ORIGIN` | Backend | Yes |
| `ALLOW_TEST_PAYMENTS`, `CUSTOMER_ASSETS_DIR` | Backend | **No** (used in code) |
| `VITE_API_URL` | Admin, Customer | Yes |
| `VITE_GOOGLE_CLIENT_ID`, `VITE_FACEBOOK_APP_ID` | Customer | Yes |
| `VITE_SALIAH_GST_NUMBER`, `VITE_GOOGLE_MAPS_*` | Customer | Yes |

### Performance concerns
- Full product catalog fetched on every customer page load (no pagination)
- Customer catalog re-fetches on window focus/visibility
- No CDN for images; local disk + git-tracked uploads
- Admin product list loads all products at once

### Code quality
- No shared TypeScript types across apps
- Business logic duplicated between route handlers and lib files
- Backend README notes "Frontend still uses localStorage" — partially outdated but still true for cart/wishlist/addresses
- No automated tests found

---

## 13. Setup and Run Instructions

### Prerequisites
- Node.js (ESM support)
- PostgreSQL running locally
- Ports **3001**, **5173**, **5174** available

### 1. Backend

```bash
cd Backend
npm install
```

Create `.env` from `.env.example`:

```
DATABASE_URL="postgresql://postgres:root@localhost:5432/saliahdates?schema=public"
PORT=3001
JWT_SECRET="change-me-in-production"
CORS_ORIGIN="http://localhost:5173,http://localhost:5174"
ADMIN_EMAIL="admin@saliahfoods.com"
ADMIN_PASSWORD="admin123"
RAZORPAY_KEY_ID="rzp_test_your_key_id"
RAZORPAY_KEY_SECRET="your_key_secret"
```

Database setup:

```sql
CREATE DATABASE saliahdates;
```

```bash
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

API: `http://localhost:3001`  
Default admin (from seed): `admin@saliahfoods.com` / `admin123`

### 2. Customer app

```bash
cd "Customer app"
npm install
npm run dev
```

Storefront: `http://localhost:5173`  
Leave `VITE_API_URL` empty in dev (Vite proxies to backend).  
For Google/Facebook login in production, set `VITE_GOOGLE_CLIENT_ID` and `VITE_FACEBOOK_APP_ID`.

### 3. Admin app

```bash
cd "Admin app"
npm install
npm run dev
```

Admin: `http://localhost:5174`

### Expected issues
| Issue | Cause | Workaround |
|-------|-------|------------|
| Catalog shows stale/static products | Backend not running | Start backend; catalog falls back to `data/productCatalog.js` |
| Checkout fails | Razorpay keys missing | Set keys in Backend `.env`, or use test payment mode (`ALLOW_TEST_PAYMENTS` not `"false"`) |
| Social login demo users only | OAuth env vars unset | Set `VITE_GOOGLE_CLIENT_ID` / `VITE_FACEBOOK_APP_ID` |
| CORS errors in production | Wrong origins | Set `CORS_ORIGIN` and `VITE_API_URL` for deployed URLs |
| PostgreSQL connection refused | DB not running / wrong URL | Verify `DATABASE_URL` |
| Admin/customer `.env` in git | Previously committed | Rotate secrets; use `git rm --cached` |

---

## 14. Final Summary

### What is already usable
- **Admin dashboard** is largely production-ready: products, categories, inventory, orders, users, reviews, CMS (homepage + pages + blog), payments settings, transactions, and analytics all talk to real APIs.
- **Customer core commerce** works: auth, catalog (API-driven), PDP with reviews, Razorpay checkout, order history/cancellation, profile/password, in-app notifications, and review submission.
- **Backend** is a cohesive Express + Prisma API with JWT auth, RBAC, stock management, Razorpay integration, review moderation, and notification system.

### What is only UI
- Customer blog, FAQ, sourcing/legacy pages, contact form, newsletter
- Admin header search and Apps button
- Customer wishlist and addresses (UI works via localStorage, not synced)
- Order tracking timeline (visual only, no carrier data)

### What requires backend work (or wiring existing APIs)
- Connect customer app to existing **wishlist** and **addresses** APIs
- Wire customer to **blog** and **CMS page** public APIs
- Implement **forgot password** and email delivery
- Resolve **COD/UPI vs Razorpay-only** inconsistency
- Use admin **shipping settings** on customer checkout instead of hardcoded values
- Add **contact form** and **newsletter** backend endpoints

### What needs fixing before production
1. Rotate secrets; stop tracking `.env`, `node_modules`, and `uploads/` in git
2. Set strong `JWT_SECRET` and production Razorpay keys
3. Verify Google/Facebook OAuth server-side
4. Set `VITE_API_URL` and `CORS_ORIGIN` for deployed domains
5. Replace `db:push` with proper Prisma migrations
6. Add email/SMS for transactional notifications
7. Add cloud storage for uploads
8. Add rate limiting and input validation

### Recommended next steps
1. **Wire existing APIs:** wishlist, addresses, blog, CMS pages on customer app (highest ROI — backend already exists)
2. **Fix payment/shipping inconsistency:** either enable COD in order creation or remove COD from admin/seed
3. **Dynamic shipping:** read shipping threshold/fee from `GET /api/payments/methods`
4. **Security hardening:** secrets, gitignore cleanup, OAuth verification, forgot-password flow
5. **Deployment setup:** Docker, env docs, CDN for uploads, Prisma migrations
6. **Missing commerce features:** coupons, server-side search, email notifications

---

This report is based on a read-only scan of the codebase. I have not modified any files.

Would you like me to start on any of these next steps — for example wiring the customer app to the existing wishlist/addresses/blog APIs, or fixing the COD/shipping inconsistencies?

---

**User**

Now based on the codebase understanding report, create a clear pending work list.

Format it as:

1. Completed Features
2. Partially Completed Features
3. UI Only Features
4. Backend Missing Features
5. Database Missing Items
6. API Integration Pending
7. Bugs / Issues to Fix
8. Priority-wise Development Plan

For the priority plan, divide it as:

* High Priority: Required to make the application functional
* Medium Priority: Required for proper business flow
* Low Priority: Enhancements and polish

Do not modify the code yet. Just give me the analysis and pending work list.


---

**Cursor**

# Pending Work List — Saliah Foods eCommerce

Based on the codebase analysis. No code changes included.

---

## 1. Completed Features

### Admin Application
- Admin login and JWT session (`/api/admin/auth/login`, `/api/admin/me`)
- Protected routes via `RequireAdmin`
- Dashboard with KPIs, recent orders, and analytics charts
- Category management (CRUD, featured promo, rename with cascade)
- Product management (CRUD, variants, SKU, multipart image upload up to 8 files)
- Inventory management (stock quantity updates, filters)
- Order management (list, detail, status updates, tracking notes, admin cancel)
- Transaction listing (derived from orders)
- User/customer management (CRUD, role assignment, delete protections)
- Review moderation (approve/reject pending reviews)
- Homepage CMS (logo, hero banners, story, testimonials)
- CMS static pages editor (FAQ, about, contact, etc.)
- Blog post management (CRUD)
- Payments & shipping settings UI (methods + store settings)
- Admin in-app notifications (bell, read/dismiss)
- Dark/light theme toggle

### Customer Application
- Email/password registration and login
- Social login flow (Google/Facebook → backend; needs production env keys)
- Session restore via `/api/auth/me`
- Product catalog from API (with static fallback when backend is down)
- Product listing page with client-side search, filters, and sort
- Product detail page with variants, pack selection, related products
- Product reviews on PDP (approved reviews from API)
- Cart (add/update/remove, localStorage persistence)
- Checkout with Razorpay (or test payment mode when keys absent)
- Order placement with stock decrement
- Order history and cancellation
- Order tracking timeline (status-based UI)
- Account profile update and account deletion
- Password change / first-password set for social users
- Review submission from account (delivered orders only)
- In-app notifications and preference management
- Partial homepage CMS (hero banners, story, testimonials, site logo)
- PDF invoice generation (client-side via jsPDF)
- SEO basics (PageMeta, structured data, sitemap)

### Backend
- Express 5 REST API with CORS, JSON parsing, static file serving
- PostgreSQL + Prisma schema (14 models)
- Customer auth (register, login, social, profile, password, delete)
- Admin auth and RBAC (role + `ADMIN_EMAIL` bypass)
- Product/catalog public APIs
- Order creation, listing, cancellation with Razorpay verification
- Razorpay order creation, signature verification, refunds on customer cancel
- Test payment mode for development
- Address CRUD API
- Wishlist CRUD API
- Review submission and moderation with product aggregate sync
- Public and admin CMS APIs
- Blog public and admin APIs
- Notification system (customer + admin, in-app)
- Analytics and dashboard APIs
- File uploads (product images, CMS images via multer)
- Database seed (categories, products, blog, CMS pages, admin user, payment methods)
- Best-seller sync from sales data

---

## 2. Partially Completed Features

| Feature | What Works | What's Missing |
|---------|------------|----------------|
| **Homepage** | Hero, story, testimonials from CMS API; shop-by-category from catalog API | TrustStrip, PremiumDates, WellnessProducts, BlogPosts sections still static |
| **Product catalog** | Full API fetch when backend is up | Static fallback masks outages; no server pagination; re-fetches on every focus |
| **Search & filters** | Client-side search/filter/sort on PLP | No backend search API; no URL-persisted filters |
| **Cart** | Full UI + localStorage | Not synced to backend; no cross-device persistence |
| **Checkout** | Razorpay flow, order creation | Shipping fee hardcoded (₹999 free / ₹99 fee) — ignores admin DB settings |
| **Payments** | Razorpay fully working | COD/UPI seeded and editable in admin but orders reject non-Razorpay |
| **Social login** | End-to-end flow with backend user creation | No server-side OAuth token verification; dev demo users without env keys |
| **Order tracking** | Status timeline from backend status | No carrier/shipment integration; admin `trackingNote` only |
| **CMS static pages** | Admin can edit FAQ, about, contact, sourcing in DB | Customer app reads hardcoded `data/pages.js` instead of API |
| **Blog** | Admin CRUD + backend public API | Customer app reads static `data/blog.js` |
| **Addresses** | Full UI in account + checkout | Backend API exists; customer uses localStorage only |
| **Wishlist** | Full UI on PDP and account | Backend API exists; customer uses localStorage only |
| **Contact page** | Static info + map embed | Form submits locally only — no backend |
| **Shipping settings** | Admin can save threshold/fee to DB | Customer checkout ignores API values |
| **Admin cancel order** | Status update works | Does not trigger Razorpay refund (customer cancel does) |
| **Analytics** | Dashboard charts and KPIs | No dedicated analytics page; header search not connected |
| **GST/invoicing** | Client-side GST breakdown on checkout and PDF | GST logic hardcoded on frontend; not validated server-side |
| **Product discounts** | MRP vs selling price display | No coupon/promo system; discount is display-only from MRP |

---

## 3. UI Only Features

| Feature | Location | Current Behavior |
|---------|----------|------------------|
| **Newsletter signup** | Home (`Newsletter.jsx`), Blog (`BlogNewsletterCta.jsx`) | `preventDefault` only — no API call |
| **Contact form** | `ContactUsPage.jsx` | Sets local `submitted` state — no email/backend |
| **FAQ page** | `FaqPage.jsx` | Static `data/pages.js` — CMS page in DB unused |
| **Our Legacy / About Us** | `OurLegacyPage.jsx` | Hardcoded JSX — CMS `about-us` page unused |
| **Sourcing & Quality** | `SourcingQualityPage.jsx` | Static `data/pages.js` — CMS page unused |
| **Blog (customer-facing)** | `BlogPage.jsx`, `BlogPostPage.jsx` | Static `data/blog.js` — backend blog API unused |
| **Homepage static sections** | TrustStrip, PremiumDates, WellnessProducts, BlogPosts | Hardcoded in `data/homepage.js` / `data/blog.js` |
| **Admin header search** | `AdminLayout.jsx` | Input with no handler |
| **Admin Apps grid button** | `AdminLayout.jsx` | Button with no action |
| **Wishlist (persistence)** | `WishlistContext.jsx` | UI works; data in localStorage only |
| **Addresses (persistence)** | `ProfileContext.jsx` | UI works; data in localStorage only |
| **Unused AboutUsPage** | `AboutUsPage.jsx` | Component exists but not routed |

---

## 4. Backend Missing Features

| Item | Description |
|------|-------------|
| **Forgot / reset password** | No endpoints, no email flow |
| **Email verification** | No verify-email on registration |
| **OAuth token verification** | Social login trusts client-provided email/providerId |
| **Email delivery** | No SMTP/SendGrid integration for transactional email |
| **SMS delivery** | `orderSms` preference exists but no SMS sender |
| **Contact form API** | No endpoint to receive contact inquiries |
| **Newsletter subscription API** | No endpoint to store subscribers |
| **Coupon / discount engine** | No promo code validation or application |
| **Brand management** | No brand model or APIs |
| **Server-side product search** | No search/filter/pagination API |
| **Cart persistence API** | No server-side cart |
| **COD / UPI order acceptance** | Payment methods seeded but order route rejects non-Razorpay |
| **Shipping carrier integration** | No Shiprocket/Delhivery or similar |
| **Rate limiting** | No throttling on auth or public endpoints |
| **Input validation library** | Manual checks only — no Zod/Joi/express-validator |
| **Prisma migrations** | Uses `db:push` only — no migration history |
| **Refresh tokens / session revocation** | 7-day JWT only; no logout invalidation |
| **Audit logs** | No admin activity tracking |
| **Cloud storage** | Images on local disk only |
| **Webhook handlers** | No Razorpay webhook endpoint (relies on client verify flow) |

---

## 5. Database Missing Items

| Item | Why Needed |
|------|------------|
| **Brand table** | Brand management module |
| **Coupon / Promotion tables** | Discount codes, campaigns, usage limits |
| **Cart table** | Cross-device cart persistence |
| **PasswordResetToken table** | Forgot-password flow |
| **EmailVerificationToken table** | Registration verification |
| **ContactInquiry / NewsletterSubscriber tables** | Contact form and newsletter |
| **Shipment / Tracking table** | Carrier AWB, tracking URL, delivery ETA |
| **AuditLog table** | Admin action history |
| **Product ↔ Category FK** | Currently loose string `categoryId` — orphan risk |
| **WishlistItem → Product relation** | Optional FK exists in fields but no Prisma relation |

---

## 6. API Integration Pending

These backend APIs exist but are **not wired on the customer frontend**:

| Backend API | Customer Status | Action Needed |
|-------------|-----------------|---------------|
| `GET/POST/PATCH/DELETE /api/addresses` | Not used | Replace `ProfileContext` localStorage with API calls |
| `GET/POST/DELETE /api/wishlist` | Not used | Replace `WishlistContext` localStorage with API calls |
| `GET /api/blog` | Not used | Replace `data/blog.js` with blog service |
| `GET /api/blog/:id` | Not used | Wire `BlogPostPage` to API |
| `GET /api/cms/pages` | Not used | Dynamic page list for navigation |
| `GET /api/cms/pages/:slug` | Not used | Wire FAQ, about, sourcing, contact content from CMS |
| `GET /api/payments/methods` → `shipping` | Partially used | Use `shipping.freeShippingThreshold` and `shippingFee` in checkout instead of hardcoded values |
| `GET /api/products/:slug/related` | Needs verification | Confirm PDP uses this or only catalog context |

These features need **new backend APIs** before customer integration:

| Feature | APIs Needed |
|---------|-------------|
| Contact form | `POST /api/contact` or similar |
| Newsletter | `POST /api/newsletter/subscribe` |
| Forgot password | `POST /api/auth/forgot-password`, `POST /api/auth/reset-password` |
| Coupons | `POST /api/coupons/validate`, apply at checkout |

---

## 7. Bugs / Issues to Fix

### Critical / Security
| Issue | Impact |
|-------|--------|
| `JWT_SECRET` defaults to `"dev-secret"` if unset | Token forgery risk in production |
| Social auth accepts unverified client claims | Account impersonation risk |
| `.env` files may be git-tracked | Secret exposure |
| `node_modules` tracked in Admin app git | Bloated repo, accidental commits |
| `Backend/uploads/` images committed to git | Repo bloat; not suitable for production |

### Functional Bugs / Inconsistencies
| Issue | Impact |
|-------|--------|
| COD/UPI enabled in admin/seed but orders reject non-Razorpay | Misleading admin config; broken if COD UI added |
| Customer shipping hardcoded; admin shipping settings ignored | Admin changes have no effect on checkout |
| Admin order cancel does not refund; customer cancel does | Inconsistent refund behavior |
| `AboutUsPage.jsx` unused; `/about-us` serves different page | Dead code; confusing content management |
| Legacy `placeOrder()` in `CartContext` never called | Dead code |
| Legacy `data/orders.js` localStorage helpers unused | Dead code |

### UX / Reliability
| Issue | Impact |
|-------|--------|
| `RequireAuth` does not wait for `authReady` | Brief redirect flash on page reload |
| Catalog static fallback hides backend failures | Stale/wrong products shown silently |
| Checkout swallows `fetchPaymentMethodsApi` errors | User may not know payment config is broken |
| Full catalog fetched on every focus/visibility change | Unnecessary load |
| No server pagination on product list | Performance at scale |

### DevOps / Production Readiness
| Issue | Impact |
|-------|--------|
| No Docker / CI/CD config | Manual deployment only |
| No Prisma migrations folder | Schema drift risk across environments |
| Production API URL falls back to `127.0.0.1:3001` | Broken if `VITE_API_URL` not set |
| Backend README partially outdated | Says "frontend uses localStorage" — still true for cart/wishlist/addresses |
| No automated tests | Regression risk |

---

## 8. Priority-wise Development Plan

### High Priority — Required to make the application functional

These items block a reliable production launch or cause data loss / security risk.

| # | Task | Rationale |
|---|------|-----------|
| H1 | **Security hardening** — strong `JWT_SECRET`, gitignore cleanup (`.env`, `node_modules`, `uploads`), rotate exposed secrets | Prevents credential leaks and token forgery |
| H2 | **Wire addresses API to customer app** — replace `ProfileContext` localStorage with `/api/addresses` | Checkout addresses lost on device change; backend already built |
| H3 | **Wire wishlist API to customer app** — replace `WishlistContext` localStorage with `/api/wishlist` | Same cross-device gap; backend already built |
| H4 | **Fix shipping settings integration** — customer checkout reads `GET /api/payments/methods` shipping values | Admin-configured shipping currently has no effect |
| H5 | **Resolve payment method inconsistency** — either enable COD/UPI in order creation or remove from admin/seed | Prevents misleading config and future bugs |
| H6 | **Production env configuration** — document and enforce `VITE_API_URL`, `CORS_ORIGIN`, Razorpay keys for all three apps | Apps break or fall back to localhost without this |
| H7 | **OAuth production setup** — configure `VITE_GOOGLE_CLIENT_ID` / `VITE_FACEBOOK_APP_ID`; add server-side token verification | Social login insecure without this |
| H8 | **Prisma migrations** — replace `db:push`-only workflow with versioned migrations | Required for safe production DB updates |
| H9 | **Cloud/local upload strategy** — stop committing uploads; serve via CDN or persistent volume | Images won't survive redeploys as-is |

---

### Medium Priority — Required for proper business flow

These complete core eCommerce operations and align admin content with the storefront.

| # | Task | Rationale |
|---|------|-----------|
| M1 | **Wire CMS pages to customer app** — FAQ, about, sourcing, contact content from `GET /api/cms/pages/:slug` | Admin edits currently don't reach customers |
| M2 | **Wire blog API to customer app** — replace `data/blog.js` with `GET /api/blog` | Admin blog management is wasted effort today |
| M3 | **Forgot / reset password** — backend endpoints + customer UI + email delivery | Standard eCommerce requirement |
| M4 | **Email notifications** — order confirmation, status updates, password reset (SMTP/SendGrid) | `orderSms`/notification prefs imply this; in-app only today |
| M5 | **Contact form backend** — store inquiries + email admin | Contact page is UI-only |
| M6 | **Admin cancel → Razorpay refund** — align with customer cancel behavior | Refund inconsistency |
| M7 | **Razorpay webhooks** — server-side payment confirmation fallback | Client-only verify is fragile if user closes browser |
| M8 | **Server-side order/shipping validation** — validate totals, GST, shipping on backend at order creation | Client-calculated pricing can be tampered with |
| M9 | **Homepage CMS completion** — move PremiumDates, WellnessProducts, TrustStrip, BlogPosts to CMS or API | Reduces static/hardcoded content |
| M10 | **Remove dead code** — `AboutUsPage`, legacy cart order helpers, unused static data paths | Reduces confusion for future work |
| M11 | **Input validation library** — Zod/Joi on backend routes | Reduces bad data and security issues |
| M12 | **Rate limiting on auth endpoints** | Brute-force protection |

---

### Low Priority — Enhancements and polish

Nice-to-have improvements after core flows are stable.

| # | Task | Rationale |
|---|------|-----------|
| L1 | **Coupon / discount system** — DB, backend, admin UI, checkout apply | Common eCommerce feature; not started |
| L2 | **Brand management module** | No brand entity today |
| L3 | **Server-side product search & pagination** | Client-side search won't scale |
| L4 | **Newsletter subscription API + integration** | Marketing; currently UI-only |
| L5 | **SMS notifications** (MSG91/Twilio) | Pref exists; no sender |
| L6 | **Shipping carrier integration** (Shiprocket, Delhivery) | Real tracking beyond status enum |
| L7 | **Admin header search** — connect to orders/products/users | UI exists; no logic |
| L8 | **Dedicated analytics page** | Analytics already on dashboard |
| L9 | **Cart backend persistence** | localStorage works for MVP |
| L10 | **Audit logs for admin actions** | Compliance/accountability |
| L11 | **Automated tests** — API integration tests, critical checkout flow | No tests found |
| L12 | **Docker + CI/CD pipeline** | Deployment automation |
| L13 | **Web analytics** (GA4, Meta Pixel) | Marketing insight |
| L14 | **Performance** — catalog caching, pagination, reduce focus-refetch | Optimization at scale |
| L15 | **TypeScript or shared types** across apps | Type safety across monorepo |
| L16 | **Dedicated order detail route** on customer (`/orders/:id`) | Currently account tab only |
| L17 | **Email verification on registration** | Trust/spam reduction |

---

### Suggested execution order (summary)

```
Phase 1 (High)     → Security + env + wire addresses/wishlist/shipping + payment consistency + migrations
Phase 2 (Medium)   → CMS/blog on customer + email + contact form + server validation + webhooks
Phase 3 (Low)      → Coupons, search, carriers, newsletter, tests, DevOps polish
```

---

I have not modified any code. When you're ready, say which phase or task you'd like to tackle first — wiring the existing wishlist/addresses APIs is usually the fastest win since the backend is already done.

