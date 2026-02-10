import { useEffect, useState } from "react";
import api from "../api/axios";

function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/admin/dashboard")
      .then(res => {
        console.log("📊 Dashboard:", res.data);
        setData(res.data);
      })
      .catch(err => {
        console.error("❌ Error dashboard", err);
      });
  }, []);

  if (!data) return <p>Cargando dashboard...</p>;

  return (
    <div>
      <h2>Dashboard</h2>
      <p>👨‍🎓 Estudiantes: {data.students}</p>
      <p>👨‍🏫 Profesores: {data.teachers}</p>
      <p>👑 Admins: {data.admins}</p>
      <p>👥 Usuarios: {data.users}</p>
    </div>
  );
}

export default AdminDashboard;
