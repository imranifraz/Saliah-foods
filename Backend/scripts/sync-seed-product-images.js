import { syncSeedProductImages } from "../src/lib/seedProductImages.js";

const result = syncSeedProductImages();

console.log(`Seed product images synced from ${result.sourceDir}`);
console.log(`  → ${result.destDir}`);
console.log(`  copied: ${result.copied}, up to date: ${result.skipped}, missing: ${result.missing}`);

if (result.missing > 0) {
  process.exitCode = 1;
}
