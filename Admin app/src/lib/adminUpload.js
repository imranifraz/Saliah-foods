import { apiFetch } from "./api.js";

export async function uploadAdminAvatar(file) {
  const formData = new FormData();
  formData.append("image", file);
  return apiFetch("/api/admin/admins/upload-avatar", {
    method: "POST",
    body: formData,
  });
}
