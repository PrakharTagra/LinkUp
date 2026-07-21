import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const token = localStorage.getItem("token");

  if (loading) return null;

  if (!user && !token) {
    return <Navigate to="/login" replace />;
  }

  if (!user && token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;