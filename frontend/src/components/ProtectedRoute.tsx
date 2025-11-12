
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  rolesPermitidos?: string[]; // por ejemplo ["admin", "lider"]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, rolesPermitidos }) => {
  const usuarioRol= localStorage.getItem("usuarioRol")

  if (!usuarioRol) {
    // si no hay usuario logueado, redirige al login
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(usuarioRol)) {
    // si tiene usuario pero no rol permitido
    return <Navigate to="/no-autorizado" replace />;
  }

  return <>{children}</>;
};
