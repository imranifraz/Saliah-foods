import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api.js";
import { AdminModalLayout } from "./AdminModalLayout.jsx";
import { CategoryForm, mapCategoryToForm } from "./CategoryForm.jsx";
import { ViewCategoryPanel } from "./ViewCategoryPanel.jsx";
import { LoadingState } from "./ui/LoadingState.jsx";

function toForm(category) {
  return mapCategoryToForm(category);
}

export function CategoryManageModal({ open, categoryId, mode = "view", onClose, onUpdated }) {
  const [category, setCategory] = useState(null);
  const [currentMode, setCurrentMode] = useState(mode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) setCurrentMode(mode);
  }, [open, mode, categoryId]);

  useEffect(() => {
    if (!open || !categoryId) {
      setCategory(null);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    apiFetch(`/api/admin/categories/${categoryId}`)
      .then((data) => setCategory(data.category))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [open, categoryId]);

  if (!open) return null;

  const isEdit = currentMode === "edit";
  const title = isEdit ? "Edit category" : "Category details";
  const subtitle = isEdit
    ? "Update how this category appears in the shop."
    : "Review category information and visibility.";

  function handleEditSuccess(updatedCategory) {
    setCategory(updatedCategory);
    setCurrentMode("view");
    onUpdated?.();
  }

  return (
    <AdminModalLayout
      open={open}
      title={title}
      subtitle={subtitle}
      titleId="category-manage-title"
      onClose={onClose}
      maxWidthClass="max-w-lg"
      maxHeightClass="sm:max-h-[min(44rem,calc(100dvh-2rem))]"
    >
      {loading ? (
        <LoadingState label="Loading category..." />
      ) : error && !category ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : category && isEdit ? (
        <CategoryForm
          key={`${category.id}-edit`}
          categoryId={category.id}
          initial={toForm(category)}
          onCancel={() => setCurrentMode("view")}
          onSuccess={handleEditSuccess}
        />
      ) : category ? (
        <ViewCategoryPanel
          key={`${category.id}-view`}
          category={category}
          onEdit={() => setCurrentMode("edit")}
          onClose={onClose}
        />
      ) : null}
    </AdminModalLayout>
  );
}
