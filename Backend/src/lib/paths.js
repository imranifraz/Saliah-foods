import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Repo root (Saliah-foods/) */
export function repoRootDir() {
  return path.resolve(__dirname, "../../..");
}

/** Customer storefront static assets (webp product shots, logos, etc.) */
export function customerPublicAssetsDir() {
  const fromEnv = process.env.CUSTOMER_ASSETS_DIR?.trim();
  if (fromEnv && fs.existsSync(fromEnv)) {
    return path.resolve(fromEnv);
  }

  const root = repoRootDir();
  const candidates = [
    path.resolve(root, "Customer app/public/assets"),
    path.resolve(root, "Customer app/public/assets-1"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return candidates[0];
}

/** All known customer asset directories, newest first. */
export function customerPublicAssetsDirs() {
  const fromEnv = process.env.CUSTOMER_ASSETS_DIR?.trim();
  if (fromEnv && fs.existsSync(fromEnv)) {
    return [path.resolve(fromEnv)];
  }

  const root = repoRootDir();
  return [
    path.resolve(root, "Customer app/public/assets"),
    path.resolve(root, "Customer app/public/assets-1"),
  ].filter((dir) => fs.existsSync(dir));
}
