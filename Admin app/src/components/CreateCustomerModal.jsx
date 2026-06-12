import { CreateCustomerForm } from "./CreateCustomerForm.jsx";
import { AdminModalLayout } from "./AdminModalLayout.jsx";

export function CreateCustomerModal({ open, onClose, onCreated }) {
  if (!open) return null;

  function handleSuccess() {
    onCreated?.();
    onClose();
  }

  return (
    <AdminModalLayout
      open={open}
      title="New customer"
      subtitle="Create a customer account for the storefront."
      titleId="create-customer-title"
      onClose={onClose}
    >
      <CreateCustomerForm key={String(open)} onCancel={onClose} onSuccess={handleSuccess} />
    </AdminModalLayout>
  );
}
