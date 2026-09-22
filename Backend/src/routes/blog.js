import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { sanitizeRichHtml, richHtmlHasText } from "../lib/richText.js";

const router = Router();

function normalizeBlogContent(content) {
  if (!Array.isArray(content)) return [];
  return content
    .map((item) => {
      const type = item?.type === "h2" ? "h2" : "p";
      const text =
        type === "h2"
          ? String(item?.text ?? "").trim()
          : sanitizeRichHtml(item?.text ?? "");
      return { type, text };
    })
    .filter((item) => (item.type === "h2" ? item.text : richHtmlHasText(item.text)));
}

function formatPost(post) {
  return {
    ...post,
    content: normalizeBlogContent(post.content),
  };
}

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
    res.json({ ok: true, posts: posts.map(formatPost) });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const post = await prisma.blogPost.findUnique({ where: { id: req.params.id } });
    if (!post) return res.status(404).json({ ok: false, error: "Post not found" });
    res.json({ ok: true, post: formatPost(post) });
  } catch (err) {
    next(err);
  }
});

export default router;
