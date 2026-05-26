import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "../../context/AuthContext";
import { CartProvider } from "../../context/CartContext";
import { NotificationsProvider } from "../../context/NotificationsContext";
import { OrdersProvider } from "../../context/OrdersContext";
import { ProfileProvider } from "../../context/ProfileContext";
import { WishlistProvider } from "../../context/WishlistContext";
import { CatalogProvider } from "../../context/CatalogContext.jsx";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

export function AppProviders({ children }) {
  const tree = (
    <CatalogProvider>
      <AuthProvider>
        <OrdersProvider>
          <WishlistProvider>
            <NotificationsProvider>
              <CartProvider>
                <ProfileProvider>{children}</ProfileProvider>
              </CartProvider>
            </NotificationsProvider>
          </WishlistProvider>
        </OrdersProvider>
      </AuthProvider>
    </CatalogProvider>
  );

  if (googleClientId) {
    return <GoogleOAuthProvider clientId={googleClientId}>{tree}</GoogleOAuthProvider>;
  }

  return tree;
}
