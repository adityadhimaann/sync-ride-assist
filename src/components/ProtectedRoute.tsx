import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Loading from "@/components/Loading";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
