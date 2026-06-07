import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { StructuredData } from "./components/seo/StructuredData";
import { RequireAuth } from "./components/auth/RequireAuth";
import { AppProviders } from "./components/auth/AppProviders";
import { HomePage } from "./pages/HomePage";
import { ProductListingPage } from "./pages/ProductListingPage";
import { ProductDetailRoute } from "./pages/ProductDetailRoute";
import { SourcingQualityPage } from "./pages/SourcingQualityPage";
import { OurLegacyPage } from "./pages/OurLegacyPage";
import { FaqPage } from "./pages/FaqPage";
import { ContactUsPage } from "./pages/ContactUsPage";
import { BlogPage } from "./pages/BlogPage";
import { BlogPostPage } from "./pages/BlogPostPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrderConfirmationPage } from "./pages/OrderConfirmationPage";
import { AccountPage } from "./pages/AccountPage";
import { LoginPage } from "./pages/LoginPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { RegisterPage } from "./pages/RegisterPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <AppProviders>
            <StructuredData />
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-emerald-800 focus:px-4 focus:py-2 focus:text-cream-50"
            >
              Skip to content
            </a>

            <Header />

            <main id="main" className="overflow-x-clip">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/product/:productSlug" element={<ProductDetailRoute />} />
                <Route path="/products" element={<ProductListingPage />} />
                <Route path="/products/all" element={<Navigate to="/products" replace />} />
                <Route path="/products/:categoryId" element={<ProductListingPage />} />
                <Route path="/sourcing-and-quality" element={<SourcingQualityPage />} />
                <Route path="/our-legacy" element={<OurLegacyPage />} />
                <Route path="/about-us" element={<OurLegacyPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/login/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route
                  path="/checkout"
                  element={
                    <RequireAuth>
                      <CheckoutPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/order-confirmation"
                  element={
                    <RequireAuth>
                      <OrderConfirmationPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/account"
                  element={
                    <RequireAuth>
                      <AccountPage />
                    </RequireAuth>
                  }
                />
                <Route path="/contact" element={<ContactUsPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>

            <Footer />
      </AppProviders>
    </BrowserRouter>
  );
}
