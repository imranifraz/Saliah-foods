import fs from "node:fs/promises";
import path from "node:path";

const avatarUploadDir = path.resolve(process.cwd(), "uploads", "users");

export function userAvatarUrlToPath(avatarUrl) {
  if (!avatarUrl || typeof avatarUrl !== "string") return null;

  const trimmed = avatarUrl.trim();
  if (!trimmed.startsWith("/uploads/users/")) return null;

  const filename = path.basename(trimmed);
  if (!filename || filename.includes("..")) return null;

  return path.join(avatarUploadDir, filename);
}

export async function deleteUserAvatarFile(avatarUrl) {
  const filePath = userAvatarUrlToPath(avatarUrl);
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }
}
