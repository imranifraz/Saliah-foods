import {
  IconDashboard,
  IconOrders,
  IconProducts,
  IconPackage,
  IconUsers,
  IconCategory,
  IconBlog,
  IconCms,
  IconPayment,
  IconReview,
} from "../components/icons/AdminIcons.jsx";

export const adminMenuGroups = [
  {
    label: "Overview",
    items: [{ to: "/", label: "Overview", icon: IconDashboard, end: true }],
  },
  {
    label: "Store Management",
    items: [
      { to: "/categories", label: "Category Management", icon: IconCategory },
      { to: "/products", label: "Product Management", icon: IconProducts },
      { to: "/inventory", label: "Inventory Management", icon: IconPackage },
      { to: "/orders", label: "Order Management", icon: IconOrders },
      { to: "/transactions", label: "Transactions", icon: IconPayment },
    ],
  },
  {
    label: "Customers",
    items: [
      { to: "/users", label: "User Management", icon: IconUsers },
      { to: "/reviews", label: "Review Moderation", icon: IconReview },
    ],
  },
  {
    label: "CMS",
    items: [
      { to: "/cms/blog", label: "Blog Posts", icon: IconBlog },
      { to: "/cms/pages", label: "Web Content", icon: IconCms },
    ],
  },
  {
    label: "Settings",
    items: [{ to: "/payments", label: "Payments & Shipping", icon: IconPayment }],
  },
];
