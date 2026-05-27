import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="admin-shell flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-gold-400" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
