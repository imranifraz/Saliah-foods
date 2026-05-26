import { readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const assetsDir = path.resolve("public/assets");
const files = await readdir(assetsDir);
const pngs = files.filter((f) => f.endsWith(".png") && !f.includes("source") && !f.includes("temp"));

for (const file of pngs) {
  const input = path.join(assetsDir, file);
  const output = path.join(assetsDir, file.replace(/\.png$/i, ".webp"));
  await sharp(input).webp({ quality: 82, effort: 4 }).toFile(output);
  console.log(`webp: ${file}`);
}

console.log(`Done — ${pngs.length} images.`);
