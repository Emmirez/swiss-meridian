import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
};

export const GuestRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  return children;
};
