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

  const candidate = path.resolve(repoRootDir(), "Customer app/public/assets");
  if (fs.existsSync(candidate)) {
    return candidate;
  }

  // Legacy fallback (incorrect nested path — kept only if someone copied assets there)
  return path.resolve(__dirname, "../../Customer app/public/assets");
}
