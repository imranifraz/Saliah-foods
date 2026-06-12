import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../lib/api.js";
import { ConfirmDialog } from "./ConfirmDialog.jsx";

export function InlineAvailableStockCell({ item, onSaved, onError }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);
  const skipBlurSaveRef = useRef(false);

  const available = item.availableQuantity ?? 0;
  const reserved = item.reservedQuantity ?? 0;
  const currentOnHand = item.stockQuantity ?? 0;
  const parsedDraft = Number.parseInt(String(draft).trim(), 10);
  const nextAvailable = Number.isFinite(parsedDraft) ? parsedDraft : available;
  const nextOnHand = nextAvailable + reserved;

  useEffect(() => {
    if (editing && !confirmOpen) inputRef.current?.select();
  }, [editing, confirmOpen]);

  function startEdit() {
    if (saving) return;
    setDraft(String(available));
    setEditing(true);
  }

  function cancelEdit() {
    setConfirmOpen(false);
    setEditing(false);
    setDraft("");
  }

  function requestSave() {
    if (!Number.isFinite(parsedDraft) || parsedDraft < 0) {
      cancelEdit();
      return;
    }

    if (nextOnHand === currentOnHand) {
      cancelEdit();
      return;
    }

    setConfirmOpen(true);
  }

  async function confirmSave() {
    setSaving(true);
    try {
      await apiFetch(`/api/admin/inventory/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ stockQuantity: nextOnHand }),
      });
      cancelEdit();
      onSaved?.();
    } catch (err) {
      setConfirmOpen(false);
      onError?.(err.message ?? "Could not update stock");
    } finally {
      setSaving(false);
    }
  }

  function handleBlur() {
    if (skipBlurSaveRef.current) {
      skipBlurSaveRef.current = false;
      return;
    }
    if (confirmOpen) return;
    requestSave();
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      requestSave();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      if (confirmOpen && !saving) {
        setConfirmOpen(false);
        return;
      }
      cancelEdit();
    }
  }

  return (
    <>
      {editing ? (
        <div className="flex items-center gap-1.5">
          <input
            ref={inputRef}
            type="number"
            min={0}
            value={draft}
            disabled={saving}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            aria-label={`Available stock for ${item.sku}`}
            className="admin-input h-9 !w-[4.5rem] shrink-0 px-2 text-center text-sm font-semibold"
          />
          <button
            type="button"
            disabled={saving}
            onMouseDown={() => {
              skipBlurSaveRef.current = true;
            }}
            onClick={requestSave}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--admin-success-bg)] bg-[var(--admin-badge-bg)] text-[var(--admin-success)] transition hover:opacity-90 disabled:opacity-50"
            aria-label="Save stock"
            title="Save"
          >
            ✓
          </button>
          <button
            type="button"
            disabled={saving}
            onMouseDown={() => {
              skipBlurSaveRef.current = true;
            }}
            onClick={cancelEdit}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--admin-border)] text-[var(--admin-fg-muted)] transition hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)] disabled:opacity-50"
            aria-label="Cancel"
            title="Cancel"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={startEdit}
          className="rounded-md px-1.5 py-0.5 font-semibold text-[var(--admin-fg)] transition hover:bg-[var(--admin-hover)] hover:text-[var(--admin-link)]"
          title="Click to edit available stock"
          aria-label={`Edit available stock for ${item.sku}: ${available}`}
        >
          {available}
        </button>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Update available stock?"
        description={`Set "${item.sku}" (${item.product?.name ?? "Product"}) to ${nextAvailable} available? On-hand stock will be ${nextOnHand}.${reserved > 0 ? ` ${reserved} unit(s) remain reserved for pending orders.` : ""}`}
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
