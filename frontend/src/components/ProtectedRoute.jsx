import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        <div className="loader"></div>
        <span className="text-tertiary/60 font-medium text-xs tracking-[0.2em] uppercase">Authenticating</span>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}
