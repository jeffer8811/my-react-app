import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../api/axios";
import "./Student.css";

export default function Student() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("inicio");
  const [alumno, setAlumno] = useState(null);
  const [agenda, setAgenda] = useState([]); // Tareas/Comunicados
  const [notas, setNotas] = useState([]);   // Calificaciones

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || user.role !== "STUDENT") {
      navigate("/login");
      return;
    }
    setAlumno(user);
    
    // Cargar Agenda y Notas automáticamente al entrar
    fetchData(user.level, user.grade, user.dni);
  }, [navigate]);

  const fetchData = async (level, grade, dni) => {
    try {
      // 1. Traer tareas y comunicados de su grado
      const resAgenda = await api.get(`/api/announcements/filter?level=${level}&grade=${grade}`);
      setAgenda(resAgenda.data);

      // 2. Traer sus notas personales por DNI
      const resNotas = await api.get(`/api/grades/student/${dni}`);
      setNotas(resNotas.data);
    } catch (error) {
      console.log("Datos de prueba activados (Backend no conectado)");
      // Datos de ejemplo para que veas cómo queda:
      setAgenda([
        { id: 1, title: "Tarea de Matemáticas", desc: "Resolver pág 45 del libro", type: "TASK", date: "2024-05-20" },
        { id: 2, title: "Comunicado: Salida", desc: "Mañana no hay clases por feriado", type: "NEWS", date: "2024-05-21" }
      ]);
      setNotas([
        { course: "Matemáticas", score: 18, period: "I Bimestre" },
        { course: "Lenguaje", score: 15, period: "I Bimestre" }
      ]);
    }
  };

  if (!alumno) return null;

  return (
    <div className="student-bg">
      <div className="student-app-wrapper">
        
        {/* HEADER PERFIL */}
        <header className="app-header">
          <div className="profile-info">
            <div className="avatar">{alumno.name.charAt(0)}</div>
            <div>
              <h2>{alumno.name.split(" ")[0]}</h2>
              <span>{alumno.level} - {alumno.grade}</span>
            </div>
          </div>
          <button className="logout-icon" onClick={() => { localStorage.removeItem("user"); navigate("/login"); }}>🚪</button>
        </header>

        {/* NAVEGACIÓN TIPO APP MOBILE */}
        <nav className="app-nav">
          <button className={activeTab === "inicio" ? "active" : ""} onClick={() => setActiveTab("inicio")}>🪪 Inicio</button>
          <button className={activeTab === "agenda" ? "active" : ""} onClick={() => setActiveTab("agenda")}>📅 Agenda</button>
          <button className={activeTab === "notas" ? "active" : ""} onClick={() => setActiveTab("notas")}>📝 Notas</button>
        </nav>

        <main className="app-content">
          
          {/* SECCIÓN INICIO */}
          {activeTab === "inicio" && (
            <div className="tab-pane animate-fade">
              <div className={`status-card ${alumno.paymentStatus?.toLowerCase()}`}>
                <h4>Estado de Cuenta</h4>
                <p>{alumno.paymentStatus === "PAID" ? "✅ Estás al día" : "⚠️ Tienes pagos pendientes"}</p>
              </div>
              <div className="welcome-card">
                <h3>Resumen Semanal</h3>
                <p>Tienes <strong>{agenda.filter(a => a.type === 'TASK').length}</strong> tareas pendientes.</p>
              </div>
            </div>
          )}

          {/* SECCIÓN AGENDA (MURO) */}
          {activeTab === "agenda" && (
            <div className="tab-pane animate-fade">
              <h3>Muro Académico</h3>
              {agenda.map(item => (
                <div key={item.id} className={`agenda-card ${item.type.toLowerCase()}`}>
                  <div className="agenda-tag">{item.type === "TASK" ? "Tarea" : "Aviso"}</div>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                  <small>📅 Fecha: {item.date}</small>
                </div>
              ))}
            </div>
          )}

          {/* SECCIÓN NOTAS */}
          {activeTab === "notas" && (
            <div className="tab-pane animate-fade">
              <h3>Mis Calificaciones</h3>
              <div className="grades-list">
                {notas.map((n, i) => (
                  <div key={i} className="grade-item">
                    <span>{n.course}</span>
                    <strong className={n.score >= 11 ? "passed" : "failed"}>{n.score}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}