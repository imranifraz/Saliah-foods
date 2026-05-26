import { Router } from "express";
import authRoutes from "./auth.js";
import dashboardRoutes from "./dashboard.js";
import orderRoutes from "./orders.js";
import productRoutes from "./products.js";
import inventoryRoutes from "./inventory.js";
import userRoutes from "./users.js";
import categoryRoutes from "./categories.js";
import cmsRoutes from "./cms.js";
import paymentRoutes from "./payments.js";
import reviewRoutes from "./reviews.js";
import { requireAdmin } from "../../middleware/admin.js";
import { toSessionUser } from "../../lib/auth.js";

const router = Router();

router.use("/auth", authRoutes);
router.get("/me", requireAdmin, (req, res) => {
  res.json({ ok: true, user: toSessionUser(req.user) });
});
router.use("/dashboard", dashboardRoutes);
router.use("/orders", orderRoutes);
router.use("/products", productRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/cms", cmsRoutes);
router.use("/payments", paymentRoutes);
router.use("/reviews", reviewRoutes);

export default router;
