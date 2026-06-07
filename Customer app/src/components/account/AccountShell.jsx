import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import { AccountHero } from "./AccountHero";
import { AccountSidebar } from "./AccountSidebar";
import { useOrders } from "../../context/OrdersContext";
import { AccountPersonalSection } from "./AccountPersonalSection";
import { AccountPasswordSection } from "./AccountPasswordSection";
import { AccountOrdersSection } from "./AccountOrdersSection";
import { AccountAddressesSection } from "./AccountAddressesSection";
import { AccountWishlistSection } from "./AccountWishlistSection";
import { AccountNotificationsSection } from "./AccountNotificationsSection";
import { EmailVerificationBanner } from "../auth/EmailVerificationBanner";
import { AccountSectionHeader } from "./AccountUI";

const TABS = [
  { id: "personal", label: "Personal details" },
  { id: "password", label: "Password" },
  { id: "orders", label: "Orders" },
  { id: "addresses", label: "Addresses" },
  { id: "wishlist", label: "Wishlist" },
  { id: "notifications", label: "Notifications" },
];

const TAB_TITLES = {
  personal: "Personal details",
  password: "Password & security",
  orders: "Order history",
  addresses: "Saved addresses",
  wishlist: "Wishlist",
  notifications: "Notifications",
};

const TAB_DESCRIPTIONS = {
  personal: "Manage your contact information for orders, delivery updates, and account security.",
  password: "Keep your Saliah account secure with a strong, unique password.",
  passwordSocial: "Create a password to sign in with email in addition to your social account.",
  orders: "Track deliveries, download invoices, and reorder your favourites.",
  ordersEmpty: "View and track your Saliah orders.",
  addresses: "Manage delivery locations for faster checkout across India.",
  wishlist: "Curate the dates, honey, and preserves you love for later.",
  notifications: "Order tracking, delivery updates, and reminders to rate your purchases.",
};

export function AccountShell() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout, emailVerified, resendVerificationEmail, hasPassword } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const { orders, currentOrders } = useOrders();

  const tab = TABS.some((t) => t.id === searchParams.get("tab"))
    ? searchParams.get("tab")
    : "personal";

  const setTab = (id) => {
    setSearchParams(id === "personal" ? {} : { tab: id }, { replace: true });
  };

  const initials = (user?.fullName ?? "S")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSignOut = () => {
    logout();
    navigate("/");
  };

  const sectionDescription =
    tab === "password"
      ? hasPassword
        ? TAB_DESCRIPTIONS.password
        : TAB_DESCRIPTIONS.passwordSocial
      : tab === "orders" && orders.length === 0
        ? TAB_DESCRIPTIONS.ordersEmpty
      : tab === "wishlist" && wishlistCount > 0
        ? `${wishlistCount} saved item${wishlistCount !== 1 ? "s" : ""}`
        : TAB_DESCRIPTIONS[tab] ?? "";

  return (
    <div className="account-page relative pb-20 pt-[calc(var(--site-header)+0.75rem)] md:pb-28">
      <div className="account-page__inner relative">
        <AccountHero
          fullName={user?.fullName}
          email={user?.email}
          phone={user?.phone}
          avatarUrl={user?.avatarUrl}
          initials={initials}
          sectionLabel={TAB_TITLES[tab]}
          ordersCount={orders.length}
          activeOrdersCount={currentOrders.length}
          wishlistCount={wishlistCount}
          onSignOut={handleSignOut}
        />

        {!emailVerified && user?.email ? (
          <EmailVerificationBanner
            email={user.email}
            onResend={resendVerificationEmail}
            className="mb-6 md:mb-8"
            compact
          />
        ) : null}

        <div className="account-layout-block">
          <AccountSectionHeader title={TAB_TITLES[tab]} description={sectionDescription} />

          <div className="account-layout">
            <aside className="account-layout__nav">
              <div className="account-layout__nav-inner">
                <AccountSidebar tabs={TABS} activeTab={tab} onSelect={setTab} wishlistCount={wishlistCount} />
              </div>
            </aside>

            <div className="account-content">
              {tab === "personal" ? <AccountPersonalSection /> : null}
              {tab === "password" ? <AccountPasswordSection /> : null}
              {tab === "orders" ? <AccountOrdersSection /> : null}
              {tab === "addresses" ? <AccountAddressesSection /> : null}
              {tab === "wishlist" ? <AccountWishlistSection /> : null}
              {tab === "notifications" ? <AccountNotificationsSection /> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
