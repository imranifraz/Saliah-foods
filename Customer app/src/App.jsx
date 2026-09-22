import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { StructuredData } from "./components/seo/StructuredData";
import { AnalyticsRouteListener } from "./components/analytics/AnalyticsRouteListener";
import { RequireAuth } from "./components/auth/RequireAuth";
import { AppProviders } from "./components/auth/AppProviders";
import { HomePage } from "./pages/HomePage";

const ProductListingPage = lazy(() =>
  import("./pages/ProductListingPage").then((m) => ({ default: m.ProductListingPage }))
);
const ProductDetailRoute = lazy(() =>
  import("./pages/ProductDetailRoute").then((m) => ({ default: m.ProductDetailRoute }))
);
const SourcingQualityPage = lazy(() =>
  import("./pages/SourcingQualityPage").then((m) => ({ default: m.SourcingQualityPage }))
);
const OurLegacyPage = lazy(() =>
  import("./pages/OurLegacyPage").then((m) => ({ default: m.OurLegacyPage }))
);
const FaqPage = lazy(() => import("./pages/FaqPage").then((m) => ({ default: m.FaqPage })));
const ContactUsPage = lazy(() =>
  import("./pages/ContactUsPage").then((m) => ({ default: m.ContactUsPage }))
);
const BlogPage = lazy(() => import("./pages/BlogPage").then((m) => ({ default: m.BlogPage })));
const BlogPostPage = lazy(() =>
  import("./pages/BlogPostPage").then((m) => ({ default: m.BlogPostPage }))
);
const CheckoutPage = lazy(() =>
  import("./pages/CheckoutPage").then((m) => ({ default: m.CheckoutPage }))
);
const OrderConfirmationPage = lazy(() =>
  import("./pages/OrderConfirmationPage").then((m) => ({ default: m.OrderConfirmationPage }))
);
const AccountPage = lazy(() =>
  import("./pages/AccountPage").then((m) => ({ default: m.AccountPage }))
);
const LoginPage = lazy(() => import("./pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const ForgotPasswordPage = lazy(() =>
  import("./pages/ForgotPasswordPage").then((m) => ({ default: m.ForgotPasswordPage }))
);
const RegisterPage = lazy(() =>
  import("./pages/RegisterPage").then((m) => ({ default: m.RegisterPage }))
);
const VerifyEmailPage = lazy(() =>
  import("./pages/VerifyEmailPage").then((m) => ({ default: m.VerifyEmailPage }))
);
const NotFoundPage = lazy(() =>
  import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage }))
);

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4" aria-busy="true">
      <p className="font-body text-sm text-emerald-900/50">Loading…</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <StructuredData />
        <AnalyticsRouteListener />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-emerald-800 focus:px-4 focus:py-2 focus:text-cream-50"
        >
          Skip to content
        </a>

        <Header />

        <main id="main" className="overflow-x-clip">
          <Suspense fallback={<RouteFallback />}>
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
          </Suspense>
        </main>

        <Footer />
      </AppProviders>
    </BrowserRouter>
  );
}
