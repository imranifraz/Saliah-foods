# Explore Customer app structure
_Exported on 6/4/2026 at 11:32:30 GMT+5:30 from Cursor (3.5.17)_

---

**User**

Analyze the Customer/front-facing application at c:\Users\nniha\OneDrive\Documents\GitHub\Saliah-foods\Customer app thoroughly (READ ONLY - do not modify files).

Return a detailed report covering:
1. Folder structure
2. package.json, vite config, env files
3. ALL routes/pages from router config
4. For EACH page: route path, components, API integration vs mock/hardcoded data
5. Cart, wishlist, checkout, payment flow - what's real vs UI only
6. Auth (login, register, Google OAuth) - real backend integration?
7. Product listing, search, filters - API connected?
8. Order history, tracking, reviews
9. Account/profile, address management
10. API service files - all functions and endpoints
11. CMS/content pages - static or API?

Read actual source files. Don't assume features work from UI alone.

Format as structured bullet points with file paths and status (Fully Implemented / Partially / UI Only / Missing Backend).

---

**Cursor**

I'll analyze the Customer app systematically—starting with its structure, config, and router, then tracing each page to real API usage vs mock data.


# Customer App — Implementation Audit

**Stack:** React 19, React Router 7, Vite 6, Tailwind 4, Framer Motion  
**Backend target:** `http://127.0.0.1:3001` (dev proxy in `vite.config.js`)  
**Router file:** `Customer app/src/App.jsx`

---

## 1. Folder Structure

```
Customer app/
├── assets/                    # Static image assets
├── public/                    # sitemap.xml
├── scripts/                   # Build helpers (webp, mega-menu, etc.)
├── src/
│   ├── components/
│   │   ├── account/           # Account tabs, orders, addresses, wishlist
│   │   ├── auth/              # Login/register layout, OAuth, RequireAuth
│   │   ├── blog/              # Blog UI components
│   │   ├── cart/              # CartDrawer
│   │   ├── checkout/          # Checkout sections, success popup
│   │   ├── contact/           # ContactMap
│   │   ├── effects/           # Threads shader (Hero)
│   │   ├── home/              # Homepage sections
│   │   ├── layout/            # Header, Footer, ProductMegaMenu
│   │   ├── pages/             # PageShell, FaqAccordion, PageMeta
│   │   ├── products/          # PLP/PDP components
│   │   ├── seo/               # StructuredData
│   │   └── ui/                # ProductCard, Reveal, OptimizedImage, etc.
│   ├── context/               # 8 React contexts (auth, cart, catalog, etc.)
│   ├── data/                  # Static/fallback data modules
│   ├── lib/api.js             # apiFetch, token, media URL resolver
│   ├── pages/                 # Route page components
│   ├── services/              # API service modules (8 files)
│   └── utils/                 # paymentRefund helpers
├── index.html
├── package.json
├── vite.config.js
├── .env
└── .env.example
```

---

## 2. package.json, Vite Config, Env Files

### `Customer app/package.json`
- **Scripts:** `dev`, `build` (runs image optimization first), `preview`, `optimize:images`
- **Key deps:** `react`, `react-router-dom`, `@react-oauth/google`, `framer-motion`, `jspdf` (invoices)
- **Dev:** Vite 6, Tailwind 4, `@vitejs/plugin-react`, image optimizer

### `Customer app/vite.config.js`
- Dev server port **5173** (strict)
- **Proxy:** `/api`, `/uploads`, `/assets` → `http://127.0.0.1:3001`
- Build code-splitting: `motion`, `router`, `vendor` chunks

### Env files
| Variable | Purpose | Current state |
|----------|---------|---------------|
| `VITE_API_URL` | Production API base | Empty in `.env` → dev uses proxy; prod falls back to `http://127.0.0.1:3001` per `lib/api.js` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth | Documented in `.env.example`; if unset, dev-only demo Google login |
| `VITE_FACEBOOK_APP_ID` | Facebook OAuth | Documented; if unset, dev-only demo Facebook login |
| `VITE_GOOGLE_MAPS_EMBED_URL` | Contact map iframe | Optional; hardcoded fallback in `data/contactMap.js` |
| `VITE_SALIAH_GST_NUMBER` | GST on invoices | Documented; used in account invoice utils |

---

## 3. All Routes (from `App.jsx`)

| Path | Page | Auth |
|------|------|------|
| `/` | `HomePage` | Public |
| `/product/:productSlug` | `ProductDetailRoute` → `ProductDetailPage` | Public |
| `/products/:categoryId` | `ProductListingPage` | Public |
| `/sourcing-and-quality` | `SourcingQualityPage` | Public |
| `/our-legacy` | `OurLegacyPage` | Public |
| `/about-us` | `OurLegacyPage` (alias) | Public |
| `/faq` | `FaqPage` | Public |
| `/login` | `LoginPage` | Public |
| `/register` | `RegisterPage` | Public |
| `/checkout` | `CheckoutPage` | **RequireAuth** |
| `/order-confirmation` | `OrderConfirmationPage` | **RequireAuth** |
| `/contact` | `ContactUsPage` | Public |
| `/blog` | `BlogPage` | Public |
| `/blog/:slug` | `BlogPostPage` | Public |
| `/account` | `AccountPage` → `AccountShell` | **RequireAuth** |

**Not routed:** `AboutUsPage.jsx` exists but is never registered ( `/about-us` serves `OurLegacyPage` instead).

---

## 4. Per-Page Breakdown

### `/` — `HomePage.jsx`
- **Components:** `Hero`, `TrustStrip`, `ShopByCategory`, lazy `PremiumDates`, `WellnessProducts`, `CustomerFavourites`, `BrandLegacy`, `Testimonials`, `BlogPosts`, `Newsletter`
- **Data sources (mixed):**
  - **API + fallback:** Hero, BrandLegacy, Testimonials → `HomeContentContext` → `GET /api/cms/home` (`HomeContentContext.jsx`, `homeCmsApi.js`)
  - **API + static fallback:** ShopByCategory, CustomerFavourites → `CatalogContext` → `GET /api/categories` + `/api/products`
  - **Static only:** TrustStrip, PremiumDates, WellnessProducts → `data/homepage.js`
  - **Static only:** BlogPosts → `data/blog.js`
  - **UI only:** Newsletter form (`preventDefault`, no submit handler) — `Newsletter.jsx`
- **Status:** **Partially Implemented** (CMS + catalog wired; several sections still hardcoded; newsletter UI-only)

### `/products/:categoryId` — `ProductListingPage.jsx`
- **Components:** `ProductListingHero`, `ProductListingFilterBar`, `ProductCard`, `ProductListingFeatured`
- **Data:** `CatalogContext` (API or static fallback)
- **Search/filters:** Client-side only (`matchesSearch`, `filterProducts`, `sortProducts` from `data/productCatalog.js`) — no search API
- **Status:** **Partially Implemented** (products from API when backend up; filtering/search is front-end only)

### `/product/:productSlug` — `ProductDetailPage.jsx`
- **Components:** Gallery, purchase panel, pack selector, reviews, related products, sticky bar, `WishlistButton`
- **Data:** Product from `CatalogContext.getProductBySlug()`; reviews from `GET /api/products/slug/:slug/reviews`
- **Cart/wishlist:** Local context actions
- **Status:** **Fully Implemented** for PDP + reviews API (catalog depends on backend or fallback)

### `/checkout` — `CheckoutPage.jsx`
- **Components:** `CheckoutAddressSection`, `CheckoutOrderSummary`, `OrderSuccessPopup`
- **Flow:** Address (saved or new) → Razorpay or test payment → `createOrderApi` → clear cart
- **APIs:** `fetchPaymentMethodsApi`, `createRazorpayOrderApi`, `verifyRazorpayPaymentApi`, `verifyTestPaymentApi`, `createOrderApi`
- **Status:** **Fully Implemented** (requires backend + payment config; no COD)

### `/order-confirmation` — `OrderConfirmationPage.jsx`
- **Data:** `location.state.order` or `sessionStorage` via `loadLastOrder()` — no API fetch
- **Status:** **Partially Implemented** (display-only fallback route)

### `/account` — `AccountPage.jsx` → `AccountShell.jsx`
- **Tabs (query `?tab=`):** personal, password, orders, addresses, wishlist, notifications
- **Status:** **Partially Implemented** (see sections 5–9)

### `/login`, `/register`
- **Components:** `AuthSplitLayout`, `SocialAuthButtons`, form fields
- **API:** `loginAccount`, `registerAccount`, `socialLogin`, `checkApiHealth` (register page)
- **Status:** **Fully Implemented** (backend-dependent; OAuth needs env keys for production)

### `/faq` — `FaqPage.jsx`
- **Data:** `faqItems` from `data/pages.js`
- **Status:** **UI Only / Static**

### `/sourcing-and-quality` — `SourcingQualityPage.jsx`
- **Data:** `sourcingQuality` from `data/pages.js`
- **Status:** **UI Only / Static**

### `/our-legacy`, `/about-us` — `OurLegacyPage.jsx`
- **Data:** Hardcoded JSX content + static assets
- **Status:** **UI Only / Static** (`AboutUsPage.jsx` with different content is unused)

### `/contact` — `ContactUsPage.jsx`
- **Data:** `contactInfo` from `data/pages.js`; map from `data/contactMap.js`
- **Form:** Sets `submitted=true` locally — **no API**
- **Status:** **Partially Implemented** (info + map real; form UI-only)

### `/blog`, `/blog/:slug`
- **Data:** `data/blog.js` exclusively
- **Status:** **UI Only / Static** (no blog CMS API)

---

## 5. Cart, Wishlist, Checkout, Payment

### Cart — `CartContext.jsx` + `CartDrawer.jsx`
- **Storage:** `localStorage` key `saliah-cart`
- **Operations:** add/remove/update qty, subtotal — all client-side
- **Checkout:** Navigates to `/checkout` (auth required)
- **Legacy:** `placeOrder()` in `CartContext` generates local order IDs — **never called** anywhere; real orders go through `CheckoutPage` → `createOrderApi`
- **Status:** **Partially Implemented** (cart is local; order persistence is backend at checkout)

### Wishlist — `WishlistContext.jsx`
- **Storage:** `localStorage` per user (`saliah-wishlist-{userId}`)
- **No backend API**
- **Status:** **UI Only** (client persistence only)

### Checkout — `CheckoutPage.jsx`
- **Addresses:** From `ProfileContext` (localStorage) or inline new address
- **Payment:** Hardcoded `paymentMethod = "razorpay"`; probes backend via `fetchPaymentMethodsApi`
- **Real path:** Razorpay checkout.js → verify → `createOrderApi` with `paymentVerificationToken`
- **Dev fallback:** `verifyTestPaymentApi` when `testPaymentsAllowed`
- **Pricing:** Client-side GST/shipping via `data/pricing.js`, `getShippingFee()` (free over ₹999)
- **Status:** **Fully Implemented** when backend + Razorpay (or test mode) configured

### Payment service — `paymentApi.js`
| Function | Endpoint |
|----------|----------|
| `createRazorpayOrderApi` | `POST /api/payments/razorpay/order` |
| `verifyRazorpayPaymentApi` | `POST /api/payments/razorpay/verify` |
| `fetchPaymentMethodsApi` | `GET /api/payments/methods` |
| `verifyTestPaymentApi` | `POST /api/payments/test/verify` |

---

## 6. Auth (Login, Register, Google OAuth)

### Backend integration — **Fully Implemented**
All auth flows use `services/authApi.js` → PostgreSQL-backed API:

| Action | Endpoint | Context method |
|--------|----------|----------------|
| Register | `POST /api/auth/register` | `register()` |
| Login | `POST /api/auth/login` | `login()` |
| Social login | `POST /api/auth/social` | `loginWithSocial()` |
| Session restore | `GET /api/auth/me` | `AuthContext` on mount |
| Update profile | `PATCH /api/auth/profile` | `updateProfile()` |
| Change password | `PATCH /api/auth/password` | `changePassword()` |
| Delete account | `DELETE /api/auth/account` | `deleteAccount()` |
| Health check | `GET /api/health` | `RegisterPage` offline banner |

- **Token:** JWT in `localStorage` (`saliah-token`); sent as `Authorization: Bearer`
- **Session cache:** User snapshot also in `localStorage` (`saliah-session`) for quick display; validated against `/api/auth/me`
- **Legacy cleanup:** `purgeLegacyLocalUsers()` removes old demo `saliah-users` key

### Google OAuth — `SocialAuthButtons.jsx`
- **Production:** `@react-oauth/google` → JWT decoded client-side → `POST /api/auth/social` with `{ provider: "google", fullName, email, providerId }`
- **Requires:** `VITE_GOOGLE_CLIENT_ID` + `GoogleOAuthProvider` in `AppProviders.jsx`
- **Without client ID:** Dev-only fake Google user (`google.demo.*@saliah.local`)
- **Status:** **Fully Implemented** with env config; **Partially** without it (dev demo only)

### Facebook OAuth
- Same backend endpoint with `provider: "facebook"`
- **Requires:** `VITE_FACEBOOK_APP_ID` + FB SDK
- **Without app ID:** Dev-only demo user
- **Status:** **Partially Implemented**

### Route protection — `RequireAuth.jsx`
- Redirects to `/login?redirect=...` if not authenticated
- Does **not** wait for `authReady` (possible brief redirect flash on reload)

---

## 7. Product Listing, Search, Filters

- **Product source:** `CatalogContext` → `fetchCatalog()` → `GET /api/categories` + `GET /api/products`
- **On API failure:** Falls back to `data/productMenu.js` + `data/productCatalog.js` static catalog
- **Refresh:** Re-fetches on window focus and tab visibility
- **Search:** Client-side string match on name/tagline/categoryLabel (`ProductListingPage.jsx`)
- **Filters:** Price, benefits, packaging, availability — all client-side (`filterProducts` in `productCatalog.js`)
- **Sort:** Client-side (`sortProducts`)
- **Pagination:** "Load more" slices visible count — no server pagination
- **Status:** **Partially Implemented** (API for catalog; search/filters are front-end only, no dedicated search API)

---

## 8. Order History, Tracking, Reviews

### Order history — `OrdersContext.jsx` + `AccountOrdersSection.jsx`
- **Fetch:** `GET /api/orders` on login
- **Create:** `POST /api/orders` at checkout
- **Cancel:** `PATCH /api/orders/:id/cancel` — **Fully Implemented**
- **Reorder:** Adds items back to local cart — client only
- **Invoice:** PDF generated client-side (`accountUtils.js` + jspdf) — no download API
- **Legacy:** `data/orders.js` has `loadUserOrders`/`saveUserOrders` — **unused** by current context

### Tracking — `OrderTrackingTimeline.jsx`
- **UI timeline** driven by `order.status` string from backend (`placed` → `delivered`)
- **No carrier/shipment API** — purely status-based visual steps
- **Status:** **Partially Implemented** (displays backend status; not live logistics)

### Reviews
| Surface | API | Status |
|---------|-----|--------|
| PDP reviews | `GET /api/products/slug/:slug/reviews` | **Fully Implemented** |
| Account "rate product" | `GET /api/reviews/mine`, `POST /api/reviews` | **Fully Implemented** |
| Moderation states | pending/approved/rejected shown in UI | Backend-driven |

---

## 9. Account / Profile / Addresses

### Personal details — `AccountPersonalSection.jsx`
- **API:** `PATCH /api/auth/profile` (name, email, phone, DOB, note)
- **Delete account:** `DELETE /api/auth/account`
- **Status:** **Fully Implemented**

### Password — `AccountPasswordSection.jsx`
- **API:** `PATCH /api/auth/password`
- Supports social-only users setting first password (`hasPassword` from `/api/auth/me`)
- **Status:** **Fully Implemented**

### Addresses — `AccountAddressesSection.jsx` + `ProfileContext.jsx`
- **Storage:** `localStorage` (`saliah-profile-addresses-{userId}`)
- **No backend sync**
- Used at checkout; optional save-from-checkout also writes here
- **Status:** **UI Only / Missing Backend**

### Notifications — `AccountNotificationsSection.jsx`
- **API:** Full CRUD via `notificationApi.js` (list, prefs, mark read, dismiss)
- Polls every 60s when logged in
- **Status:** **Fully Implemented**

---

## 10. API Service Files — All Functions & Endpoints

### `src/lib/api.js`
- `resolveApiBase()`, `resolveMediaUrl()`, `getAuthToken()`, `setAuthToken()`, `apiFetch(path, options)`

### `src/services/authApi.js`
| Function | Method | Endpoint |
|----------|--------|----------|
| `checkApiHealth()` | GET | `/api/health` |
| `registerAccount(body)` | POST | `/api/auth/register` |
| `loginAccount(body)` | POST | `/api/auth/login` |
| `socialLogin(body)` | POST | `/api/auth/social` |
| `fetchMe()` | GET | `/api/auth/me` |
| `updateProfileApi(body)` | PATCH | `/api/auth/profile` |
| `changePasswordApi(body)` | PATCH | `/api/auth/password` |
| `deleteAccountApi()` | DELETE | `/api/auth/account` |
| `clearAuthToken()` | — | local only |

### `src/services/catalogApi.js`
| Function | Method | Endpoint |
|----------|--------|----------|
| `fetchCatalog()` | GET | `/api/categories` + `/api/products` (parallel) |
| `normalizeApiProduct()`, `buildMenuCategories()`, etc. | — | client transforms |

### `src/services/orderApi.js`
| Function | Method | Endpoint |
|----------|--------|----------|
| `fetchOrdersApi()` | GET | `/api/orders` |
| `createOrderApi(body)` | POST | `/api/orders` |
| `cancelOrderApi(orderId, reason)` | PATCH | `/api/orders/:orderId/cancel` |

### `src/services/paymentApi.js`
| Function | Method | Endpoint |
|----------|--------|----------|
| `loadRazorpayCheckout()` | — | loads Razorpay script |
| `createRazorpayOrderApi(body)` | POST | `/api/payments/razorpay/order` |
| `verifyRazorpayPaymentApi(body)` | POST | `/api/payments/razorpay/verify` |
| `fetchPaymentMethodsApi()` | GET | `/api/payments/methods` |
| `verifyTestPaymentApi(body)` | POST | `/api/payments/test/verify` |

### `src/services/homeCmsApi.js`
| Function | Method | Endpoint |
|----------|--------|----------|
| `fetchHomeCmsApi()` | GET | `/api/cms/home` |

### `src/services/notificationApi.js`
| Function | Method | Endpoint |
|----------|--------|----------|
| `fetchNotificationsApi()` | GET | `/api/notifications` |
| `fetchNotificationPrefsApi()` | GET | `/api/notifications/prefs` |
| `updateNotificationPrefsApi(prefs)` | PUT | `/api/notifications/prefs` |
| `markNotificationsReadApi({ ids, all })` | POST | `/api/notifications/read` |
| `dismissNotificationsApi({ ids, all })` | POST | `/api/notifications/dismiss` |

### `src/services/productReviewApi.js`
| Function | Method | Endpoint |
|----------|--------|----------|
| `fetchProductReviewsApi(slug)` | GET | `/api/products/slug/:slug/reviews` |

### `src/services/reviewApi.js`
| Function | Method | Endpoint |
|----------|--------|----------|
| `fetchMyReviewItemsApi()` | GET | `/api/reviews/mine` |
| `submitReviewApi(body)` | POST | `/api/reviews` |

---

## 11. CMS / Content Pages

| Content | Source | Status |
|---------|--------|--------|
| Homepage hero, story, testimonials | `GET /api/cms/home` with hardcoded `FALLBACK` in `HomeContentContext.jsx` | **Partially Implemented** |
| Homepage product grids (Premium Dates, Wellness) | `data/homepage.js` static | **Static** |
| Shop by category / favourites | Catalog API | **Partially Implemented** |
| FAQ | `data/pages.js` | **Static** |
| Sourcing & Quality | `data/pages.js` | **Static** |
| Our Legacy / About Us route | Hardcoded in `OurLegacyPage.jsx` | **Static** |
| About Us page component | `AboutUsPage.jsx` — **not routed** | **Unused** |
| Blog | `data/blog.js` | **Static** |
| Contact info | `data/pages.js` | **Static** |
| Contact form | Local state only | **UI Only** |
| Newsletter (home + blog) | `preventDefault`, no API | **UI Only** |
| Navigation / mega menu | `data/navigation.js` + live catalog categories | **Mixed** |
| Site logo (header) | CMS `siteLogo` via `HomeContentContext` | **Partially Implemented** |

---

## Summary Matrix

| Feature | Status |
|---------|--------|
| Email/password auth | **Fully Implemented** |
| Google/Facebook OAuth | **Fully Implemented** (needs env; dev demo fallback) |
| Product catalog (PLP/PDP) | **Partially** (API + static fallback; client filters) |
| Cart | **Partially** (localStorage; backend at checkout) |
| Wishlist | **UI Only** (localStorage) |
| Checkout + Razorpay | **Fully Implemented** (backend required) |
| Orders list/cancel | **Fully Implemented** |
| Order tracking UI | **Partially** (status-based, no carrier API) |
| Product reviews | **Fully Implemented** |
| Profile/password/delete | **Fully Implemented** |
| Addresses | **UI Only / Missing Backend** |
| Notifications | **Fully Implemented** |
| Home CMS (partial) | **Partially Implemented** |
| Blog, FAQ, legacy pages | **Static / UI Only** |
| Contact form, newsletter | **UI Only** |

**Key architectural split:** Core commerce (auth, catalog, orders, payments, reviews, notifications) is wired to the backend at `Customer app/src/services/*`. Session-adjacent data (cart, wishlist, addresses) and marketing content (blog, FAQ, contact form, newsletter, parts of homepage) remain client-side or static unless the backend is explicitly called.

