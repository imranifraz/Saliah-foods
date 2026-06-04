# Explore Admin app structure
_Exported on 6/4/2026 at 11:31:54 GMT+5:30 from Cursor (3.5.17)_

---

**User**

Analyze the Admin application at c:\Users\nniha\OneDrive\Documents\GitHub\Saliah-foods\Admin app thoroughly (READ ONLY - do not modify files).

Return a detailed report covering:
1. Folder structure
2. package.json, vite config, env files
3. ALL routes/pages from router config
4. For EACH page/module: route path, main components, whether it calls real APIs or uses mock/hardcoded data
5. API service files - list all API functions and which endpoints they hit
6. Auth context/login flow - token storage, protected routes
7. Dashboard - real data or mock?
8. Product/Category/Order/Customer/User management status
9. Any UI-only pages (buttons that don't work)
10. Components inventory

Read actual source files. Confirm API integration by checking fetch/axios calls vs mock data imports.

Format as structured bullet points with file paths and implementation status (Fully Implemented / Partially / UI Only / Missing Backend).

---

**Cursor**

I'll map the Admin app structure and read router, API, and auth source files to build the report.


# Saliah Admin App — Implementation Report

**Stack:** React 19, React Router 7, Vite 6, Tailwind CSS 4  
**Location:** `c:\Users\nniha\OneDrive\Documents\GitHub\Saliah-foods\Admin app`  
**Data strategy:** All pages use real API calls via `apiFetch` in `src/lib/api.js`. **No mock data files or mock imports** were found in `src/`.

---

## 1. Folder Structure

```
Admin app/
├── index.html
├── package.json
├── vite.config.js
├── .env / .env.example
├── .gitignore
├── dist/                          # build output
├── node_modules/
└── src/
    ├── main.jsx                   # entry
    ├── App.jsx                    # router
    ├── index.css                  # global styles + design tokens
    ├── config/
    │   └── adminMenu.js           # sidebar nav config
    ├── context/
    │   ├── AuthContext.jsx
    │   └── AdminThemeContext.jsx
    ├── lib/
    │   ├── api.js                 # fetch wrapper + token storage
    │   ├── notificationsApi.js
    │   ├── cmsUpload.js
    │   └── mediaUrl.js
    ├── utils/
    │   └── paymentRefund.js       # client-side refund display helpers
    ├── pages/                     # 19 route pages (see §3)
    └── components/
        ├── AdminLayout.jsx
        ├── RequireAdmin.jsx
        ├── AdminLogo.jsx
        ├── AdminNotificationsBell.jsx
        ├── AdminThemeToggle.jsx
        ├── icons/AdminIcons.jsx
        └── ui/                    # 11 reusable UI components
```

**Source file count:** 45 files under `src/` (excluding `node_modules`).

---

## 2. Configuration Files

### `package.json`
- **Name:** `saliah-admin` v0.0.1
- **Scripts:** `dev`, `build`, `preview`
- **Dependencies:** `react`, `react-dom`, `react-router-dom`, `@fontsource/inter`, `@fontsource/playfair-display`
- **Dev:** `vite`, `@vitejs/plugin-react`, `tailwindcss`, `@tailwindcss/vite`
- **No axios** — uses native `fetch` only

### `vite.config.js`
- Dev server port: **5174**
- Proxies to backend `http://127.0.0.1:3001`:
  - `/api`
  - `/uploads`
  - `/assets`

### Environment files

| File | Content |
|------|---------|
| `.env.example` | `VITE_API_URL=` (empty = use Vite proxy in dev) |
| `.env` | Same — empty, proxy mode |

**API base resolution** (`src/lib/api.js`):
- Dev + empty env → relative URLs (proxy)
- Production + empty env → `http://127.0.0.1:3001`
- Set `VITE_API_URL` for production deployments

---

## 3. All Routes (from `src/App.jsx`)

| Route | Page Component | Protected |
|-------|----------------|-----------|
| `/login` | `LoginPage` | No |
| `/` (index) | `DashboardPage` | Yes |
| `/categories` | `CategoriesPage` | Yes |
| `/categories/new` | `CategoryFormPage` | Yes |
| `/categories/:id/edit` | `CategoryFormPage` | Yes |
| `/products` | `ProductsPage` | Yes |
| `/inventory` | `InventoryPage` | Yes |
| `/orders` | `OrdersPage` | Yes |
| `/orders/:id` | `OrderDetailPage` | Yes |
| `/users` | `UsersPage` | Yes |
| `/users/:id` | `UserDetailPage` | Yes |
| `/reviews` | `ReviewsPage` | Yes |
| `/cms/pages` | `CmsPagesPage` | Yes |
| `/cms/home` | `CmsHomePage` | Yes |
| `/cms/pages/homepage` | `CmsHomePage` (alias) | Yes |
| `/cms/pages/:slug` | `CmsPageEditPage` | Yes |
| `/cms/blog` | `BlogPostsPage` | Yes |


