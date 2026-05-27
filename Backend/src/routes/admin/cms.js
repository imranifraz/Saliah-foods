import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import { prisma } from "../../lib/prisma.js";
import { requireAdmin } from "../../middleware/admin.js";
import {
  DEFAULT_HOME_CMS,
  formatHomeCmsPage,
  normalizeHomeCmsBody,
} from "../../lib/home-cms.js";

const router = Router();
router.use(requireAdmin);

const cmsUploadDir = path.resolve(process.cwd(), "uploads", "cms");
fs.mkdirSync(cmsUploadDir, { recursive: true });

const cmsUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, cmsUploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
      const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"].includes(ext)
        ? ext
        : ".jpg";
      cb(null, `cms-${Date.now()}-${Math.round(Math.random() * 1e6)}${safeExt}`);
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype?.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"));
    }
    cb(null, true);
  },
});

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatPage(p) {
  return {
    slug: p.slug,
    title: p.title,
    subtitle: p.subtitle,
    pageType: p.pageType,
    body: p.body,
    published: p.published,
    updatedAt: p.updatedAt.toISOString(),
  };
}

function formatBlog(post) {
  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    date: post.date,
    dateISO: post.dateISO,
    category: post.category,
    readTime: post.readTime,
    author: post.author,
    featured: post.featured,
    img: post.img,
    content: post.content,
    updatedAt: post.updatedAt?.toISOString?.() ?? post.createdAt.toISOString(),
  };
}

// ——— Homepage CMS ———
router.get("/home", async (_req, res, next) => {
  try {
    let page = await prisma.cmsPage.findUnique({ where: { slug: "homepage" } });
    if (!page) {
      page = await prisma.cmsPage.create({
        data: {
          slug: "homepage",
          title: "Homepage",
          subtitle: "Logo, hero, our story & testimonials",
          pageType: "homepage",
          body: DEFAULT_HOME_CMS,
          published: true,
        },
      });
    }
    res.json({ ok: true, page: formatHomeCmsPage(page) });
  } catch (err) {
    next(err);
  }
});

router.put("/home", async (req, res, next) => {
  try {
    const { title, subtitle, published, content } = req.body;
    const body = normalizeHomeCmsBody(content ?? req.body.body ?? {});
    const page = await prisma.cmsPage.upsert({
      where: { slug: "homepage" },
      create: {
        slug: "homepage",
        title: title ?? "Homepage",
        subtitle: subtitle ?? "Logo, hero, our story & testimonials",
        pageType: "homepage",
        body,
        published: published !== false,
      },
      update: {
        title: title ?? undefined,
        subtitle: subtitle ?? undefined,
        body,
        published: published !== undefined ? Boolean(published) : undefined,
      },
    });
    res.json({ ok: true, page: formatHomeCmsPage(page) });
  } catch (err) {
    next(err);
  }
});

router.post("/upload", cmsUpload.single("image"), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, error: "Image file is required" });
    }
    res.status(201).json({
      ok: true,
      url: `/uploads/cms/${req.file.filename}`,
    });
  } catch (err) {
    next(err);
  }
});

// ——— Web pages (CMS) ———
router.get("/pages", async (_req, res, next) => {
  try {
    const pages = await prisma.cmsPage.findMany({ orderBy: { slug: "asc" } });
    res.json({ ok: true, pages: pages.map(formatPage) });
  } catch (err) {
    next(err);
  }
});

router.get("/pages/:slug", async (req, res, next) => {
  try {
    const page = await prisma.cmsPage.findUnique({ where: { slug: req.params.slug } });
    if (!page) return res.status(404).json({ ok: false, error: "Page not found" });
    res.json({ ok: true, page: formatPage(page) });
  } catch (err) {
    next(err);
  }
});

router.put("/pages/:slug", async (req, res, next) => {
  try {
    const { title, subtitle, pageType, body, published } = req.body;
    const page = await prisma.cmsPage.upsert({
      where: { slug: req.params.slug },
      create: {
        slug: req.params.slug,
        title: title ?? req.params.slug,
        subtitle: subtitle ?? "",
        pageType: pageType ?? "content",
        body: body ?? {},
        published: published !== false,
      },
      update: {
        title: title ?? undefined,
        subtitle: subtitle ?? undefined,
        pageType: pageType ?? undefined,
        body: body ?? undefined,
        published: published !== undefined ? Boolean(published) : undefined,
      },
    });
    res.json({ ok: true, page: formatPage(page) });
  } catch (err) {
    next(err);
  }
});

// ——— Blog ———
router.get("/blog", async (req, res, next) => {
  try {
    const { category } = req.query;
    const where = category && category !== "all" ? { category: String(category) } : {};
    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: { dateISO: "desc" },
    });
    res.json({ ok: true, posts: posts.map(formatBlog) });
  } catch (err) {
    next(err);
  }
});

router.get("/blog/:id", async (req, res, next) => {
  try {
    const post = await prisma.blogPost.findUnique({ where: { id: req.params.id } });
    if (!post) return res.status(404).json({ ok: false, error: "Post not found" });
    res.json({ ok: true, post: formatBlog(post) });
  } catch (err) {
    next(err);
  }
});

router.post("/blog", async (req, res, next) => {
  try {
    const { title, excerpt, category, readTime, author, featured, img, content, id, dateISO } =
      req.body;
    if (!title?.trim()) {
      return res.status(400).json({ ok: false, error: "Title is required" });
    }

    const postId = id?.trim() || slugify(title);
    const iso = dateISO ?? new Date().toISOString().slice(0, 10);
    const date = new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const post = await prisma.blogPost.create({
      data: {
        id: postId,
        title: title.trim(),
        excerpt: excerpt ?? "",
        date,
        dateISO: iso,
        category: category ?? "Wellness",
        readTime: readTime ?? "5 min read",
        author: author ?? "Saliah Editorial",
        featured: Boolean(featured),
        img: img ?? "/assets/kimia-dates.png",
        content: content ?? [{ type: "p", text: "" }],
      },
    });
    res.status(201).json({ ok: true, post: formatBlog(post) });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ ok: false, error: "Post ID already exists" });
    }
    next(err);
  }
});

router.patch("/blog/:id", async (req, res, next) => {
  try {
    const existing = await prisma.blogPost.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ ok: false, error: "Post not found" });

    const fields = [
      "title",
      "excerpt",
      "category",
      "readTime",
      "author",
      "img",
      "content",
      "date",
      "dateISO",
    ];
    const data = {};
    for (const key of fields) {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    }
    if (req.body.featured !== undefined) data.featured = Boolean(req.body.featured);

    const post = await prisma.blogPost.update({ where: { id: existing.id }, data });
    res.json({ ok: true, post: formatBlog(post) });
  } catch (err) {
    next(err);
  }
});

router.delete("/blog/:id", async (req, res, next) => {
  try {
    await prisma.blogPost.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ ok: false, error: "Post not found" });
    }
    next(err);
  }
});

export default router;
