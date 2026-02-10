import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const rawUser = localStorage.getItem("user");

  // ❌ No hay usuario
  if (!rawUser) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(rawUser);

  // ❌ No hay rol
  if (!user.role) {
    return <Navigate to="/login" replace />;
  }

  // ❌ allowedRoles vacío = acceso libre
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  // ✅ OK
  return children;
}

export default ProtectedRoute;
