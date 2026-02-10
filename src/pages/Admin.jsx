import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "./Admin.css";
import AdminDashboard from "./AdminDashboard";

function Admin() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="admin-bg">
      <div className="admin-bubble ab1"></div>
      <div className="admin-bubble ab2"></div>
      <div className="admin-bubble ab3"></div>

      <div className="admin-wrapper">
        <div className="admin-header">
          <h1>👑 Panel Admin</h1>
          <p>
            Bienvenido, <strong>{user?.username}</strong>
          </p>
        </div>

        {/* DASHBOARD */}
        <AdminDashboard />

        <div className="admin-logout">
          <button onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </div>
    </div>
  );
}

export default Admin;
