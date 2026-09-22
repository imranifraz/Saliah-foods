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
  IconMail,
  IconAdmin,
  IconProfile,
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
      { to: "/admins", label: "Admin Management", icon: IconAdmin },
      { to: "/reviews", label: "Review Moderation", icon: IconReview },
      { to: "/cms/enquiries", label: "Customer Enquiries", icon: IconMail },
      { to: "/cms/newsletter", label: "Newsletter", icon: IconMail },
    ],
  },
  {
    label: "CMS",
    items: [
      { to: "/cms/pages", label: "Web Content", icon: IconCms },
      { to: "/cms/blog", label: "Blog Posts", icon: IconBlog },
    ],
  },
  {
    label: "Settings",
    items: [
      { to: "/account/profile", label: "My Profile", icon: IconProfile },
      { to: "/payments", label: "Payments & Shipping", icon: IconPayment },
    ],
  },
];
