import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { AdminThemeProvider } from "./context/AdminThemeContext.jsx";
import { RequireAdmin } from "./components/RequireAdmin.jsx";
import { AdminLayout } from "./components/AdminLayout.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage.jsx";
import { AdminProfilePage } from "./pages/AdminProfilePage.jsx";
import { AdminDetailPage } from "./pages/AdminDetailPage.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { OrdersPage } from "./pages/OrdersPage.jsx";
import { OrderDetailPage } from "./pages/OrderDetailPage.jsx";
import { ProductsPage } from "./pages/ProductsPage.jsx";
import { InventoryPage } from "./pages/InventoryPage.jsx";
import { UsersPage, AdminsPage } from "./pages/UsersPage.jsx";
import { UserDetailPage } from "./pages/UserDetailPage.jsx";
import { ReviewsPage } from "./pages/ReviewsPage.jsx";
import { CategoriesPage } from "./pages/CategoriesPage.jsx";
import { CmsPagesPage } from "./pages/CmsPagesPage.jsx";
import { CmsPageEditPage } from "./pages/CmsPageEditPage.jsx";
import { CmsHomePage } from "./pages/CmsHomePage.jsx";
import { BlogPostsPage } from "./pages/BlogPostsPage.jsx";
import { BlogEditPage } from "./pages/BlogEditPage.jsx";
import { PaymentsPage } from "./pages/PaymentsPage.jsx";
import { TransactionsPage } from "./pages/TransactionsPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AdminThemeProvider>
        <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="categories/new" element={<Navigate to="/categories" replace />} />
            <Route path="categories/:id/edit" element={<Navigate to="/categories" replace />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="admins" element={<AdminsPage />} />
            <Route path="admins/:id" element={<AdminDetailPage />} />
            <Route path="users/:id" element={<UserDetailPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="cms/pages" element={<CmsPagesPage />} />
            <Route path="cms/home" element={<CmsHomePage />} />
            <Route path="cms/pages/homepage" element={<CmsHomePage />} />
            <Route path="cms/pages/:slug" element={<CmsPageEditPage />} />
            <Route path="cms/blog" element={<BlogPostsPage />} />
            <Route path="cms/blog/:id" element={<BlogEditPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="account/profile" element={<AdminProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </AuthProvider>
      </AdminThemeProvider>
    </BrowserRouter>
  );
}
