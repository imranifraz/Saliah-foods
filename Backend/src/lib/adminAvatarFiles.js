import fs from "node:fs/promises";
import path from "node:path";

const avatarUploadDir = path.resolve(process.cwd(), "uploads", "admins");

export function adminAvatarUrlToPath(avatarUrl) {
  if (!avatarUrl || typeof avatarUrl !== "string") return null;

  const trimmed = avatarUrl.trim();
  if (!trimmed.startsWith("/uploads/admins/")) return null;

  const filename = path.basename(trimmed);
  if (!filename || filename.includes("..")) return null;

  return path.join(avatarUploadDir, filename);
}

export async function deleteAdminAvatarFile(avatarUrl) {
  const filePath = adminAvatarUrlToPath(avatarUrl);
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }
}
