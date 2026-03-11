import { Navigate, Outlet } from "react-router-dom";
import { useApp } from "@/lib/AuthContext";

export default function ProtectedRoute() {
  const { user, loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f1eb]">
        <div className="text-[#6b7d6b]">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}