import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRole }) {
  const { token, user } = useAuth();

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (allowedRole && user && user.role !== allowedRole) {
    return <Navigate to="/login" />;
  }

  return children;
}