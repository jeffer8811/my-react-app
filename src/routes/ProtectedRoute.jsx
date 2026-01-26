import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  const user = JSON.parse(localStorage.getItem("user"));

  // no logueado
  if (!user) {
    return <Navigate to="/login" />;
  }

  // rol no permitido
  if (!allowedRoles.includes(user.rol)) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedRoute;