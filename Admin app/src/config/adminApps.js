import {
  IconBlog,
  IconCategory,
  IconCms,
  IconDashboard,
  IconExternal,
  IconOrders,
  IconProducts,
  IconStorefront,
} from "../components/icons/AdminIcons.jsx";

export function getCustomerStoreUrl() {
  const configured = import.meta.env.VITE_CUSTOMER_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  if (import.meta.env.DEV) return "http://localhost:5173";
  return "";
}

export const adminAppSections = [
  {
    label: "Admin",
    items: [
      { type: "internal", to: "/", label: "Dashboard", description: "Overview & analytics", icon: IconDashboard, end: true },
      { type: "internal", to: "/orders", label: "Orders", description: "Track customer orders", icon: IconOrders },
      { type: "internal", to: "/products", label: "Products", description: "Manage catalog", icon: IconProducts },
      { type: "internal", to: "/categories", label: "Categories", description: "Shop menu groups", icon: IconCategory },
    ],
  },
  {
    label: "CMS",
    items: [
      { type: "internal", to: "/cms/home", label: "Homepage", description: "Hero, story & banners", icon: IconCms },
      { type: "internal", to: "/cms/pages", label: "Web content", description: "About, FAQ & pages", icon: IconCms },
      { type: "internal", to: "/cms/blog", label: "Blog", description: "Articles & updates", icon: IconBlog },
    ],
  },
  {
    label: "External",
    items: [
      {
        type: "external",
        href: getCustomerStoreUrl(),
        label: "Customer site",
        description: "Open live storefront",
        icon: IconStorefront,
        trailingIcon: IconExternal,
      },
    ],
  },
];

export function getAdminAppSections() {
  return adminAppSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.type !== "external" || item.href),
    }))
    .filter((section) => section.items.length > 0);
}
