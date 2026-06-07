import fs from "node:fs";
import path from "node:path";
import { customerPublicAssetsDirs } from "./paths.js";

/** Packshot files referenced by prisma/seed.js */
export const SEED_PRODUCT_IMAGE_FILES = [
  "kimia-dates.webp",
  "ajwa-dates.webp",
  "safawi-dates.webp",
  "zahidi-dates.webp",
  "seedless-dates.webp",
  "desert-royal-dates.webp",
  "date-syrup.webp",
  "amla-candy.webp",
  "rose-gulkand.webp",
  "dry-fruit-with-honey.webp",
  "fig-honey-delight.webp",
  "mixed-fruit-jam.webp",
];

export function seedAssetsProductsDir() {
  return path.resolve(process.cwd(), "seed-assets", "products");
}

export function productUploadsDir() {
  return path.resolve(process.cwd(), "uploads", "products");
}

export function productUploadUrl(filename) {
  return `/uploads/products/${filename}`;
}

function resolveSourceDir() {
  const seedDir = seedAssetsProductsDir();
  if (fs.existsSync(seedDir) && SEED_PRODUCT_IMAGE_FILES.some((file) => fs.existsSync(path.join(seedDir, file)))) {
    return seedDir;
  }

  for (const dir of customerPublicAssetsDirs()) {
    if (SEED_PRODUCT_IMAGE_FILES.some((file) => fs.existsSync(path.join(dir, file)))) {
      return dir;
    }
  }

  return seedDir;
}

/**
 * Copy seed packshots into uploads/products so DB paths match admin-uploaded products.
 * Prefers Backend/seed-assets/products; falls back to Customer app/public/assets.
 */
export function syncSeedProductImages({ log = console.log } = {}) {
  const sourceDir = resolveSourceDir();
  const destDir = productUploadsDir();
  fs.mkdirSync(destDir, { recursive: true });

  let copied = 0;
  let skipped = 0;
  let missing = 0;

  for (const file of SEED_PRODUCT_IMAGE_FILES) {
    const src = path.join(sourceDir, file);
    const dest = path.join(destDir, file);

    if (!fs.existsSync(src)) {
      missing += 1;
      log(`  missing seed image: ${file} (looked in ${sourceDir})`);
      continue;
    }

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

  return { sourceDir, destDir, copied, skipped, missing };
}
