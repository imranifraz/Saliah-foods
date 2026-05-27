import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "../../context/AuthContext";
import { CartProvider } from "../../context/CartContext";
import { NotificationsProvider } from "../../context/NotificationsContext";
import { OrdersProvider } from "../../context/OrdersContext";
import { ProfileProvider } from "../../context/ProfileContext";
import { WishlistProvider } from "../../context/WishlistContext";
import { CatalogProvider } from "../../context/CatalogContext.jsx";
import { HomeContentProvider } from "../../context/HomeContentContext.jsx";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

export function AppProviders({ children }) {
  const tree = (
    <HomeContentProvider>
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
    </HomeContentProvider>
  );

  if (googleClientId) {
    return <GoogleOAuthProvider clientId={googleClientId}>{tree}</GoogleOAuthProvider>;
  }

  return tree;
}
