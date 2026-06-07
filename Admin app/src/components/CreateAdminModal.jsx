import { CreateAdminForm } from "./CreateAdminForm.jsx";import { AdminModalLayout } from "./AdminModalLayout.jsx";

export function CreateAdminModal({ open, onClose, onCreated }) {
  if (!open) return null;

  function handleSuccess() {
    onCreated?.();
    onClose();
  }

  return (
    <AdminModalLayout
      open={open}
      title="New admin"
      subtitle="Create a new administrator account."
      titleId="create-admin-title"
      onClose={onClose}
    >
      <CreateAdminForm key={String(open)} onCancel={onClose} onSuccess={handleSuccess} />
    </AdminModalLayout>
  );
}
