import fs from "node:fs";
import path from "node:path";
import { customerPublicAssetsDir, customerPublicAssetsDirs } from "./paths.js";
import { seedAssetsProductsDir } from "./seedProductImages.js";

/** Category hero / promo art referenced by prisma/seed.js */
export const SEED_CATEGORY_IMAGE_FILES = [
  "premium-dates-category.webp",
  "kimia-dates.webp",
  "wellness-foods-category.webp",
  "ajwa-dates.webp",
];

export function seedAssetsCategoriesDir() {
  return path.resolve(process.cwd(), "seed-assets", "categories");
}

export function categoryUploadsDir() {
  return path.resolve(process.cwd(), "uploads", "categories");
}

export function categoryUploadUrl(filename) {
  return `/uploads/categories/${filename}`;
}

function resolveSourceFile(file) {
  const candidates = [
    path.join(seedAssetsCategoriesDir(), file),
    path.join(seedAssetsProductsDir(), file),
    ...customerPublicAssetsDirs().map((dir) => path.join(dir, file)),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

/**
 * Copy seed category art into uploads/categories so DB paths match admin-managed URLs.
 * Looks in seed-assets/categories, then seed-assets/products (shared packshots), then Customer app assets.
 */
export function syncSeedCategoryImages({ log = console.log } = {}) {
  const destDir = categoryUploadsDir();
  fs.mkdirSync(destDir, { recursive: true });

  let copied = 0;
  let skipped = 0;
  let missing = 0;
  const sourceDirs = new Set();

  for (const file of SEED_CATEGORY_IMAGE_FILES) {
    const src = resolveSourceFile(file);
    const dest = path.join(destDir, file);

    if (!src) {
      missing += 1;
      log(`  missing seed image: ${file}`);
      continue;
    }

    sourceDirs.add(path.dirname(src));

    const shouldCopy =
      !fs.existsSync(dest) ||
      fs.statSync(src).mtimeMs > fs.statSync(dest).mtimeMs ||
      fs.statSync(src).size !== fs.statSync(dest).size;

    if (shouldCopy) {
      fs.copyFileSync(src, dest);
      copied += 1;
    } else {
      skipped += 1;
    }
  }

  return {
    sourceDir: [...sourceDirs].join(", ") || customerPublicAssetsDir(),
    destDir,
    copied,
    skipped,
    missing,
  };
}
