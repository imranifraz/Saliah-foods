import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const customerDir = path.resolve(__dirname, "../public");
const adminDir = path.resolve(__dirname, "../../Admin app/public");
const markPath = path.join(customerDir, "saliah-mark.png");

const png = await sharp(markPath)
  .resize(64, 64, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

const b64 = png.toString("base64");
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 64 64" width="64" height="64">
  <image width="64" height="64" href="data:image/png;base64,${b64}" xlink:href="data:image/png;base64,${b64}"/>
</svg>
`;

for (const dir of [customerDir, adminDir]) {
  fs.writeFileSync(path.join(dir, "favicon.svg"), svg);
}

console.log("favicon.svg restored from real mark for customer + admin");
