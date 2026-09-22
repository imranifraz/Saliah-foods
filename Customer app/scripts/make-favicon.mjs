import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const customerDir = path.resolve(__dirname, "../public");
const adminDir = path.resolve(__dirname, "../../Admin app/public");
const src = path.join(customerDir, "assets/saliah-foods-logo.png");

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

const colCounts = new Array(width).fill(0);
let minX = width;
let minY = height;
let maxX = 0;
let maxY = 0;

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * channels;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    const isMark = a > 40 && g > 40 && g > r * 1.15 && g > b * 1.05;
    if (isMark) {
      colCounts[x] += 1;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
}

let iconEnd = maxX;
let gap = 0;
let started = false;
for (let x = minX; x < width; x++) {
  if (colCounts[x] > 5) {
    started = true;
    gap = 0;
    iconEnd = x;
  } else if (started) {
    gap += 1;
    if (gap > 12) {
      iconEnd = x - gap;
      break;
    }
  }
}

const iconW = iconEnd - minX + 1;
const iconH = maxY - minY + 1;
const side = Math.max(iconW, iconH) + 20;
const cx = Math.round((minX + iconEnd) / 2);
const cy = Math.round((minY + maxY) / 2);
let left = Math.max(0, cx - Math.floor(side / 2));
let top = Math.max(0, cy - Math.floor(side / 2));
if (left + side > width) left = Math.max(0, width - side);
if (top + side > height) top = Math.max(0, height - side);

const extracted = await sharp(src)
  .extract({
    left,
    top,
    width: Math.min(side, width - left),
    height: Math.min(side, height - top),
  })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const out = Buffer.from(extracted.data);
for (let i = 0; i < out.length; i += 4) {
  const r = out[i];
  const g = out[i + 1];
  const b = out[i + 2];
  if (r < 28 && g < 28 && b < 28) out[i + 3] = 0;
  else if (r < 40 && g < 40 && b < 40) {
    out[i + 3] = Math.min(out[i + 3], Math.round(((r + g + b) / 3 / 40) * 255));
  }
}

const markPng = await sharp(out, {
  raw: { width: extracted.info.width, height: extracted.info.height, channels: 4 },
})
  .resize(256, 256, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

for (const dir of [customerDir, adminDir]) {
  fs.writeFileSync(path.join(dir, "saliah-mark.png"), markPng);
  await sharp(markPng).webp({ quality: 90 }).toFile(path.join(dir, "saliah-mark.webp"));

  for (const size of [16, 32, 48, 180]) {
    const name = size === 180 ? "apple-touch-icon.png" : `favicon-${size}.png`;
    const pad = Math.max(1, Math.round(size * 0.06));
    const inner = size - pad * 2;
    const buf = await sharp(markPng)
      .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extend({
        top: pad,
        bottom: pad,
        left: pad,
        right: pad,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();
    fs.writeFileSync(path.join(dir, name), buf);
  }

  fs.copyFileSync(path.join(dir, "favicon-32.png"), path.join(dir, "favicon.png"));

  // Keep an SVG that embeds the real mark (some tooling still resolves /favicon.svg).
  const b64 = (await sharp(markPng).resize(64, 64, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  }).png().toBuffer()).toString("base64");
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 64 64" width="64" height="64">
  <image width="64" height="64" href="data:image/png;base64,${b64}" xlink:href="data:image/png;base64,${b64}"/>
</svg>
`;
  fs.writeFileSync(path.join(dir, "favicon.svg"), svg);
}

console.log("Favicons rebuilt from real logo mark for customer + admin");
