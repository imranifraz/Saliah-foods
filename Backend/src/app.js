import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "node:path";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import addressRoutes from "./routes/addresses.js";
import wishlistRoutes from "./routes/wishlist.js";
import blogRoutes from "./routes/blog.js";
import cmsPublicRoutes from "./routes/cms.js";
import categoryPublicRoutes from "./routes/categories.js";
import paymentPublicRoutes from "./routes/payments.js";
import notificationRoutes from "./routes/notifications.js";
import reviewRoutes from "./routes/reviews.js";
import contactRoutes from "./routes/contact.js";
import newsletterRoutes from "./routes/newsletter.js";
import adminRoutes from "./routes/admin/index.js";
import { errorHandler, notFound } from "./middleware/error.js";
import { customerPublicAssetsDirs } from "./lib/paths.js";

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean)
  : ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
// Serve every known customer assets folder (e.g. public/assets + public/assets-1)
for (const assetsDir of customerPublicAssetsDirs()) {
  app.use("/assets", express.static(assetsDir));
}

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "saliah-dates-api",
    health: "/api/health",
    hint: "API routes live under /api. Open the Admin or Customer app in the browser, not this URL alone.",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "saliah-dates-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/cms", cmsPublicRoutes);
app.use("/api/categories", categoryPublicRoutes);
app.use("/api/payments", paymentPublicRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
