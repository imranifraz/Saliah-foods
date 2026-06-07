import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AccountAlert, AccountBtn, AccountCard } from "./AccountUI";
import { AccountDeleteConfirmModal } from "./AccountDeleteConfirmModal";

export function AccountDeleteSection({ className = "" }) {
  const navigate = useNavigate();
  const { deleteAccount } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleteError("");
    setDeleting(true);
    const result = await deleteAccount();
    setDeleting(false);
    if (!result.ok) {
      setDeleteError(result.error ?? "Could not delete your account. Please try again.");
      return;
    }
    setConfirmOpen(false);
    navigate("/", { replace: true });
  };

  const handleCancel = () => {
    if (deleting) return;
    setConfirmOpen(false);
    setDeleteError("");
  };

  return (
    <>
      <AccountCard id="account-delete-zone" className={`account-danger-zone ${className}`.trim()}>
        <h3 className="font-display text-base text-emerald-900">Delete account</h3>
        <p className="mt-1.5 font-body text-sm leading-relaxed text-emerald-900/50">
          Permanently remove your Saliah account, saved addresses, orders, and wishlist from this device. This
          cannot be undone.
        </p>

        {deleteError && !confirmOpen ? (
          <div className="mt-4">
            <AccountAlert type="error">{deleteError}</AccountAlert>
          </div>
        ) : null}

        <AccountBtn
          variant="danger"
          className="account-btn--sm mt-4"
          onClick={() => {
            setDeleteError("");
            setConfirmOpen(true);
          }}
        >
          Delete account
        </AccountBtn>
      </AccountCard>

      <AccountDeleteConfirmModal
        open={confirmOpen}
        error={confirmOpen ? deleteError : ""}
        deleting={deleting}
        onConfirm={handleDeleteAccount}
        onCancel={handleCancel}
      />
    </>
  );
}
