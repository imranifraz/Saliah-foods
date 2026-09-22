import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api.js";
import { AdminModalLayout } from "./AdminModalLayout.jsx";
import { ConfirmDialog } from "./ConfirmDialog.jsx";
import { ViewInventoryPanel } from "./ViewInventoryPanel.jsx";
import { ProductThumb } from "./ui/ProductThumb.jsx";
import { useAdminToast } from "../context/AdminToastContext.jsx";

function QuickStockChip({ onClick, children, disabled = false }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-md border border-[var(--admin-border)] px-2.5 py-1 text-xs font-semibold text-[var(--admin-fg-muted)] transition hover:border-[var(--admin-border-strong)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function StockStepButton({ onClick, children, disabled = false }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[var(--admin-border)] text-lg font-semibold leading-none text-[var(--admin-fg)] transition hover:border-[var(--admin-border-strong)] hover:bg-[var(--admin-hover)] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function StockStatCard({ label, value, hint, accent = false }) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        accent
          ? "border-[var(--admin-tab-active-border)] bg-[var(--admin-tab-active-bg)]"
          : "border-[var(--admin-border)] bg-[var(--admin-surface-2)]"
      }`}
    >
      <p className="admin-caption">{label}</p>
      <p className="mt-1 text-lg font-semibold text-[var(--admin-fg)]">{value}</p>
      {hint ? <p className="admin-muted mt-1 text-[11px] leading-snug">{hint}</p> : null}
    </div>
  );
}

function EditInventoryPanel({ item, draft, onDraftChange, disabled }) {
  const reserved = Number(item.reservedQuantity ?? 0);
  const currentOnHand = Number(item.stockQuantity ?? 0);
  const parsed = Number.parseInt(String(draft), 10);
  const onHand = Number.isFinite(parsed) ? parsed : 0;
  const available = Math.max(0, onHand - reserved);
  const dirty = String(draft) !== String(currentOnHand);
  const delta = onHand - currentOnHand;

  function setQuantity(next) {
    onDraftChange(String(Math.max(reserved, Math.floor(Number(next) || 0))));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4">
        <ProductThumb product={item.product} alt={item.product?.name} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-sm font-semibold text-[var(--admin-fg)]">{item.sku}</p>
          <h3 className="mt-1 font-display text-lg font-semibold text-[var(--admin-fg)]">{item.product?.name}</h3>
          {item.weight ? <p className="admin-muted mt-1 text-sm">{item.weight}</p> : null}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StockStatCard
          label="On hand"
          value={onHand}
          hint={dirty ? `Was ${currentOnHand}${delta > 0 ? ` (+${delta})` : delta < 0 ? ` (${delta})` : ""}` : "Total units in warehouse"}
          accent={dirty}
        />
        <StockStatCard
          label="Reserved"
          value={reserved}
          hint={reserved > 0 ? "Held for pending orders" : "Nothing pending"}
        />
        <StockStatCard
          label="Available"
          value={available}
          hint="Available to sell now"
          accent={available > 0 && available <= 5}
        />
      </div>

      <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-4">
        <label className="admin-label mb-3 block" htmlFor={`inventory-edit-qty-${item.id}`}>
          Update on-hand quantity
        </label>
        <div className="flex flex-nowrap items-center gap-2">
          <StockStepButton
            onClick={() => setQuantity(onHand - 1)}
            disabled={disabled || onHand - 1 < reserved}
            aria-label="Decrease on-hand by 1"
          >
            −
          </StockStepButton>
          <input
            id={`inventory-edit-qty-${item.id}`}
            type="number"
            min={reserved}
            value={draft}
            disabled={disabled}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            className={`admin-input h-11 !w-20 shrink-0 px-2 text-center ${dirty ? "border-[var(--admin-link)]" : ""}`}
          />
          <StockStepButton
            onClick={() => setQuantity(onHand + 1)}
            disabled={disabled}
            aria-label="Increase on-hand by 1"
          >
            +
          </StockStepButton>
        </div>
        {reserved > 0 ? (
          <p className="admin-muted mt-2 text-xs leading-relaxed">
            Minimum on-hand: {reserved} (reserved for pending orders).
          </p>
        ) : null}
      </div>

      <div>
        <p className="admin-caption mb-2">More options</p>
        <div className="flex flex-wrap gap-2">
          <QuickStockChip onClick={() => setQuantity(reserved)} disabled={disabled}>
            Zero available
          </QuickStockChip>
          <QuickStockChip onClick={() => setQuantity(onHand + 5)} disabled={disabled}>
            +5 on hand
          </QuickStockChip>
          <QuickStockChip onClick={() => setQuantity(onHand + 10)} disabled={disabled}>
            +10 on hand
          </QuickStockChip>
          <QuickStockChip onClick={() => setQuantity(onHand + 50)} disabled={disabled}>
            +50 on hand
          </QuickStockChip>
          {dirty ? (
            <QuickStockChip onClick={() => onDraftChange(String(currentOnHand))} disabled={disabled}>
              Reset
            </QuickStockChip>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function InventoryManageModal({
  open,
  item,
  mode = "view",
  onClose,
  onUpdated,
  onViewHistory,
  onViewProduct,
}) {
  const toast = useAdminToast();
  const [currentMode, setCurrentMode] = useState(mode);
  const [openedInEditMode, setOpenedInEditMode] = useState(false);
  const [draft, setDraft] = useState("0");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setCurrentMode(mode);
      setOpenedInEditMode(mode === "edit");
      setError("");
    }
  }, [open, mode, item?.id]);

  useEffect(() => {
    if (open && item) {
      setDraft(String(item.stockQuantity ?? 0));
    }
  }, [open, item]);

  if (!open || !item) return null;

  const isEdit = currentMode === "edit";
  const dirty = String(draft) !== String(item.stockQuantity ?? 0);
  const min = Number(item.reservedQuantity ?? 0);
  const parsedDraft = Number.parseInt(String(draft), 10);
  const nextOnHand = Number.isFinite(parsedDraft) ? parsedDraft : 0;
  const nextAvailable = Math.max(0, nextOnHand - min);

  function handleCancelEdit() {
    if (openedInEditMode) {
      onClose();
      return;
    }
    setDraft(String(item.stockQuantity ?? 0));
    setCurrentMode("view");
    setError("");
  }

  async function confirmSave() {
    setSaving(true);
    setError("");
    try {
      await apiFetch(`/api/admin/inventory/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ stockQuantity: nextOnHand }),
      });
      setConfirmOpen(false);
      toast.success("Stock updated");
      onUpdated?.();
      onClose();
    } catch (err) {
      setError(err.message);
      toast.error("Could not update stock", err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!dirty || nextOnHand < min) {
      const message = `On-hand stock must be at least ${min}.`;
      setError(message);
      toast.error("Could not update stock", message);
      return;
    }
    setConfirmOpen(true);
  }

  return (
    <>
      <AdminModalLayout
        open={open}
        title={isEdit ? "Edit stock" : "Inventory details"}
        subtitle={
          isEdit
            ? `${item.sku}${item.weight ? ` · ${item.weight}` : ""}`
            : `${item.sku} · ${item.product?.name ?? "Product"}`
        }
        titleId="inventory-manage-title"
        onClose={onClose}
        maxWidthClass="max-w-lg"
        footer={
          isEdit ? (
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={handleCancelEdit} className="btn-ghost w-full sm:w-auto" disabled={saving}>
                Cancel
              </button>
              <button
                type="submit"
                form="inventory-edit-form"
                className="btn-primary w-full sm:w-auto"
                disabled={saving || !dirty}
              >
                {saving ? "Saving…" : "Save stock"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={onClose} className="btn-ghost w-full sm:w-auto">
                Close
              </button>
              <button type="button" onClick={() => setCurrentMode("edit")} className="btn-primary w-full sm:w-auto">
                Edit stock
              </button>
            </div>
          )
        }
      >
        {error ? (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        ) : null}

        {isEdit ? (
          <form id="inventory-edit-form" onSubmit={handleSubmit}>
            <EditInventoryPanel item={item} draft={draft} onDraftChange={setDraft} disabled={saving} />
          </form>
        ) : (
          <ViewInventoryPanel item={item} onViewProduct={onViewProduct} onViewHistory={onViewHistory} />
        )}
      </AdminModalLayout>

      <ConfirmDialog
        open={confirmOpen}
        title="Update on-hand stock?"
        description={`Set "${item.sku}" (${item.product?.name}) to ${nextOnHand} on hand? Available to sell will be ${nextAvailable}.${min > 0 ? ` ${min} unit(s) remain reserved for pending orders.` : ""}`}
        confirmLabel="Save stock"
        cancelLabel="Cancel"
        loading={saving}
        onClose={() => {
          if (!saving) setConfirmOpen(false);
        }}
        onConfirm={confirmSave}
      />
    </>
  );
}
