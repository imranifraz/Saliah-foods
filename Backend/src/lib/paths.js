import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Customer storefront static assets (webp product shots, logos, etc.) */
export function customerPublicAssetsDir() {
  return path.resolve(__dirname, "../../Customer app/public/assets");
}
