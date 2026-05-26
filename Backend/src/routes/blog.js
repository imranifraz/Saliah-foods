import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { category } = req.query;
    const where =
      category && category !== "All"
        ? { category: String(category) }
        : undefined;

    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: { dateISO: "desc" },
    });
    res.json({ ok: true, posts });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const post = await prisma.blogPost.findUnique({ where: { id: req.params.id } });
    if (!post) return res.status(404).json({ ok: false, error: "Post not found" });
    res.json({ ok: true, post });
  } catch (err) {
    next(err);
  }
});

export default router;
