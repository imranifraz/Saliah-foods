import { readFileSync, writeFileSync } from "node:fs";

let c = readFileSync("src/components/layout/ProductMegaMenu.jsx", "utf8");

const replacements = [
  ['<motion.div className="mx-auto', '<div className="mx-auto'],
  ['<motion.div className="overflow-hidden', '<motion.div className="overflow-hidden'],
  ['<motion.div className="grid min-h-[320px]', '<div className="grid min-h-[320px]'],
  ['<motion.div className="flex flex-col p-5', '<div className="flex flex-col p-5'],
  ['<motion.div className="mb-4 flex', '<div className="mb-4 flex'],
  ["<motion.div>", "<div>"],
  ['<motion.div className="grid flex-1', '<motion.div className="grid flex-1'],
  ['<motion.div className="aspect-square', '<div className="aspect-square'],
  ['<motion.div className="p-2.5"', '<div className="p-2.5"'],
];

for (const [from, to] of replacements) {
  if (from !== to) c = c.replace(from, to);
}

// Fix overflow line if still motion
c = c.replace(
  '<motion.div className="overflow-hidden rounded-2xl',
  '<motion.div className="overflow-hidden rounded-2xl'
);
c = c.replace(
  '<motion.div className="overflow-hidden rounded-2xl',
  '<div className="overflow-hidden rounded-2xl'
);

// Replace closing tags from bottom up - count div opens vs motion.div
// Brute: replace all </motion.div> with </div> then fix root closing
const lines = c.split("\n");
let motionRootOpen = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("initial={{ opacity")) {
    motionRootOpen = i;
    break;
  }
}

let closeCount = 0;
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].trim() === "</motion.div>") {
    closeCount++;
    if (closeCount > 1) lines[i] = "      </div>";
  }
}
// Last closing should be motion.div for root
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].trim() === "</motion.div>") {
    break;
  }
}

c = lines.join("\n");
writeFileSync("src/components/layout/ProductMegaMenu.jsx", c);
console.log("fixed");
