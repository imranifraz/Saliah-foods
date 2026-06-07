import { useEffect, useState } from "react";

import { AdminModalLayout } from "./AdminModalLayout.jsx";

import { ProductForm, createEmptyForm } from "./ProductForm.jsx";



const CREATE_FORM_ID = "create-product-form";



export function CreateProductModal({ open, categories, onClose, onCreated }) {

  const [formBusy, setFormBusy] = useState(false);



  useEffect(() => {

    if (!open) setFormBusy(false);

  }, [open]);



  if (!open) return null;



  const defaultCategoryId = categories[0]?.id ?? "dates";



  function handleSuccess() {

    onCreated?.();

    onClose();

  }



  return (

    <AdminModalLayout

      open={open}

      title="New product"

      subtitle="Create a catalog product with one or more purchasable variants."

      titleId="create-product-title"

      onClose={onClose}

      maxWidthClass="max-w-3xl"

      maxHeightClass="sm:max-h-[min(48rem,calc(100dvh-2rem))]"

      footer={

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">

          <button type="button" onClick={onClose} className="btn-ghost w-full sm:w-auto" disabled={formBusy}>

            Cancel

          </button>

          <button type="submit" form={CREATE_FORM_ID} className="btn-primary w-full sm:w-auto" disabled={formBusy}>

            {formBusy ? "Saving…" : "Create product"}

          </button>

        </div>

      }

    >

      <ProductForm

        key={String(open)}

        formId={CREATE_FORM_ID}

        categories={categories}

        initial={createEmptyForm(defaultCategoryId)}

        onBusyChange={setFormBusy}

        onSuccess={handleSuccess}

      />

    </AdminModalLayout>

  );

}


