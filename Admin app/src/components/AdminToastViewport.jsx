import { useAdminToast } from "../context/AdminToastContext.jsx";

function ToastIcon({ type }) {
  if (type === "error") {
    return (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  if (type === "info") {
    return (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function AdminToastViewport() {
  const { toasts, dismissToast } = useAdminToast();

  if (!toasts.length) return null;

  return (
    <div className="admin-toast-viewport" aria-live="polite" aria-relevant="additions text">
      {toasts.map((toast) => (
        <div key={toast.id} className={`admin-toast admin-toast--${toast.type}`} role="status">
          <span className="admin-toast__icon">
            <ToastIcon type={toast.type} />
          </span>
          <div className="admin-toast__body">
            <p className="admin-toast__title">{toast.title}</p>
            {toast.message ? <p className="admin-toast__message">{toast.message}</p> : null}
          </div>
          <button
            type="button"
            className="admin-toast__close"
            aria-label="Dismiss notification"
            onClick={() => dismissToast(toast.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
