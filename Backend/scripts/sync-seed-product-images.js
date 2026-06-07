import { syncSeedCategoryImages } from "../src/lib/seedCategoryImages.js";
import { syncSeedProductImages } from "../src/lib/seedProductImages.js";

function report(label, result) {
  console.log(`${label} synced from ${result.sourceDir}`);
  console.log(`  → ${result.destDir}`);
  console.log(`  copied: ${result.copied}, up to date: ${result.skipped}, missing: ${result.missing}`);
}

const products = syncSeedProductImages();
report("Product images", products);

const categories = syncSeedCategoryImages();
report("Category images", categories);

if (products.missing > 0 || categories.missing > 0) {
  process.exitCode = 1;
}
