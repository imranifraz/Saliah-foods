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

export function AccountShell() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout } = useAuth();
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

  return (
    <div className="account-page relative pb-20 pt-[calc(var(--site-header)+0.75rem)] md:pb-28">
      <div className="plp-atmosphere pointer-events-none absolute inset-0" aria-hidden />
      <div className="account-page__inner relative">
        <AccountHero
          fullName={user?.fullName}
          email={user?.email}
          initials={initials}
          sectionLabel={TAB_TITLES[tab]}
          ordersCount={orders.length}
          activeOrdersCount={currentOrders.length}
          wishlistCount={wishlistCount}
          onSignOut={handleSignOut}
        />

        <div className="account-layout">
          <AccountSidebar tabs={TABS} activeTab={tab} onSelect={setTab} wishlistCount={wishlistCount} />

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
  );
}
