import { CategoryForm, emptyCategoryForm } from "./CategoryForm.jsx";
import { AdminModalLayout } from "./AdminModalLayout.jsx";

export function CreateCategoryModal({ open, onClose, onCreated }) {
  if (!open) return null;

  function handleSuccess() {
    onCreated?.();
    onClose();
  }

  return (
    <AdminModalLayout
      open={open}
      title="New category"
      subtitle="Create a product category for the customer app."
      titleId="create-category-title"
      onClose={onClose}
      maxWidthClass="max-w-lg"
      maxHeightClass="sm:max-h-[min(44rem,calc(100dvh-2rem))]"
    >
      <CategoryForm key={String(open)} initial={emptyCategoryForm} onCancel={onClose} onSuccess={handleSuccess} />
    </AdminModalLayout>
  );
}
