import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "../../context/AuthContext";
import { CartProvider } from "../../context/CartContext";
import { NotificationsProvider } from "../../context/NotificationsContext";
import { OrdersProvider } from "../../context/OrdersContext";
import { ProfileProvider } from "../../context/ProfileContext";
import { WishlistProvider } from "../../context/WishlistContext";
import { CatalogProvider } from "../../context/CatalogContext.jsx";
import { HomeContentProvider } from "../../context/HomeContentContext.jsx";
import { ContactContentProvider } from "../../context/ContactContentContext.jsx";
import { GstSettingsProvider } from "../../context/GstSettingsContext.jsx";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

/**
 * Keep root providers lean for LCP. Page-specific CMS (FAQ / Sourcing / Legacy)
 * is provided on those routes only.
 */
export function AppProviders({ children }) {
  const tree = (
    <HomeContentProvider>
      <ContactContentProvider>
        <GstSettingsProvider>
          <CatalogProvider>
            <AuthProvider>
              <NotificationsProvider>
                <OrdersProvider>
                  <WishlistProvider>
                    <CartProvider>
                      <ProfileProvider>{children}</ProfileProvider>
                    </CartProvider>
                  </WishlistProvider>
                </OrdersProvider>
              </NotificationsProvider>
            </AuthProvider>
          </CatalogProvider>
        </GstSettingsProvider>
      </ContactContentProvider>
    </HomeContentProvider>
  );

  if (googleClientId) {
    return <GoogleOAuthProvider clientId={googleClientId}>{tree}</GoogleOAuthProvider>;
  }

  return tree;
}
