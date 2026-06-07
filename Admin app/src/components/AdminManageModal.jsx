import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { AdminModalLayout } from "./AdminModalLayout.jsx";
import { EditAdminForm } from "./EditAdminForm.jsx";
import { ViewAdminPanel } from "./ViewAdminPanel.jsx";
import { LoadingState } from "./ui/LoadingState.jsx";

export function AdminManageModal({ open, adminId, mode = "view", onClose, onUpdated }) {
  const { user: sessionUser } = useAuth();
  const [admin, setAdmin] = useState(null);
  const [currentMode, setCurrentMode] = useState(mode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) setCurrentMode(mode);
  }, [open, mode, adminId]);

  useEffect(() => {
    if (!open || !adminId) {
      setAdmin(null);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    apiFetch(`/api/admin/admins/${adminId}`)
      .then((data) => setAdmin(data.admin))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [open, adminId]);

  if (!open) return null;

  const isSelf = sessionUser?.id === admin?.id;
  const isEdit = currentMode === "edit";
  const title = isEdit ? "Edit admin" : "Admin details";
  const subtitle = isEdit
    ? "Update dashboard access details."
    : "Review administrator account information.";

  function handleEditSuccess(updatedAdmin) {
    setAdmin(updatedAdmin);
    setCurrentMode("view");
    onUpdated?.();
  }

  return (
    <AdminModalLayout
      open={open}
      title={title}
      subtitle={subtitle}
      titleId="admin-manage-title"
      onClose={onClose}
      maxWidthClass="max-w-lg"
      maxHeightClass="sm:max-h-[min(40rem,calc(100dvh-2rem))]"
    >
      {loading ? (
        <LoadingState label="Loading admin..." />
      ) : error && !admin ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : admin && isEdit ? (
        <EditAdminForm
          key={`${admin.id}-edit`}
          admin={admin}
          onCancel={() => setCurrentMode("view")}
          onSuccess={handleEditSuccess}
        />
      ) : admin ? (
        <ViewAdminPanel
          key={`${admin.id}-view`}
          admin={admin}
          isSelf={isSelf}
          onEdit={() => setCurrentMode("edit")}
          onClose={onClose}
        />
      ) : null}
    </AdminModalLayout>
  );
}
