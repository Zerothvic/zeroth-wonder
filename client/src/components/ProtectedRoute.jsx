import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore.js";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuthStore();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !user.isAdmin) return <Navigate to="/" replace />;
  return children;
}