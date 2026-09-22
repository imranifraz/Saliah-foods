import sharp from "sharp";
import fs from "fs";
import path from "path";

const src = process.argv[2];
if (!src || !fs.existsSync(src)) {
  console.error("Missing source PNG:", src);
  process.exit(1);
}

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const px = Buffer.from(data);
const threshold = 28;
let cleared = 0;

for (let i = 0; i < px.length; i += 4) {
  const r = px[i];
  const g = px[i + 1];
  const b = px[i + 2];
  if (r <= threshold && g <= threshold && b <= threshold) {
    px[i + 3] = 0;
    cleared += 1;
  }
}

console.log(`cleared ${cleared}/${info.width * info.height} background pixels (${info.width}x${info.height})`);

const outPng = await sharp(px, {
  raw: { width: info.width, height: info.height, channels: 4 },
}).png().toBuffer();

const targets = [
  "public/assets/saliah-foods-logo.png",
  "public/assets/application-logo.png",
  "public/assets-1/saliah-foods-logo.png",
  "public/assets-1/application-logo.png",
];

for (const target of targets) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, outPng);
  const webpTarget = target.replace(/\.png$/i, ".webp");
  await sharp(outPng).webp({ quality: 92, alphaQuality: 100 }).toFile(webpTarget);
  console.log("wrote", target);
}

const check = await sharp("public/assets/saliah-foods-logo.png").ensureAlpha().raw().toBuffer({ resolveWithObject: true });
console.log("corner alpha", check.data[3]);
