import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";
import "./Admin.css";

export default function Admin() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard / teachers / students
  const [dashboardData, setDashboardData] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [level, setLevel] = useState("");
  const [grade, setGrade] = useState("");
  const [grades, setGrades] = useState([]);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [studentForm, setStudentForm] = useState({ id: null, name: "", level: "", grade: "" });

  const levelGrades = {
    Inicial: ["3 años", "4 años", "5 años"],
    Primaria: ["1°", "2°", "3°", "4°", "5°", "6°"],
    Secundaria: ["1°", "2°", "3°", "4°", "5°"]
  };

  // Validar acceso ADMIN
  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/login");
    }
  }, [navigate, user]);

  // Actualizar grados según nivel seleccionado en el form
  useEffect(() => {
    setGrades(studentForm.level ? levelGrades[studentForm.level] : []);
    if (!studentForm.level) setStudentForm({ ...studentForm, grade: "" });
  }, [studentForm.level]);

  // Traer dashboard
  useEffect(() => {
    api.get("http://localhost:8080/api/admin/dashboard")
      .then(res => setDashboardData(res.data))
      .catch(err => console.error("Error dashboard:", err));
  }, []);

  // Traer profesores solo cuando se activa la pestaña
  useEffect(() => {
    if (activeTab === "teachers") {
      api.get("http://localhost:8080/api/admin/users?role=TEACHER")
        .then(res => setTeachers(res.data))
        .catch(err => console.error("Error fetching teachers:", err));
    }
  }, [activeTab]);

  // Filtrar estudiantes
  const fetchStudents = () => {
    if (!level) return;
    let url = `http://localhost:8080/api/students/filter?level=${level}`;
    if (grade) url += `&grade=${grade}`;
    api.get(url)
      .then(res => setStudents(res.data))
      .catch(err => console.error("Error fetching students:", err));
  };

  // Crear/editar alumno
  const handleStudentSubmit = (e) => {
    e.preventDefault();
    if (!studentForm.name || !studentForm.level || !studentForm.grade) return alert("Completa todos los campos");

    if (studentForm.id) {
      api.put(`http://localhost:8080/api/students/${studentForm.id}`, studentForm)
        .then(() => { fetchStudents(); setShowStudentForm(false); setStudentForm({id:null,name:"",level:"",grade:""}); })
        .catch(err => console.error(err));
    } else {
      api.post("http://localhost:8080/api/students", studentForm)
        .then(() => { fetchStudents(); setShowStudentForm(false); setStudentForm({id:null,name:"",level:"",grade:""}); })
        .catch(err => console.error(err));
    }
  };

  const handleStudentEdit = (s) => {
    setStudentForm(s);
    setShowStudentForm(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="admin-bg">
      {/* BURBUJAS */}
      <div className="admin-bubble ab1"></div>
      <div className="admin-bubble ab2"></div>
      <div className="admin-bubble ab3"></div>

      <div className="admin-wrapper">
        {/* HEADER */}
        <div className="admin-header">
          <h1>👑 Panel Admin</h1>
          <p>Bienvenido, <span>{user?.username}</span></p>
        </div>

        {/* BOTONES DE PESTAÑAS */}
        <div className="filters">
          <button className={activeTab==="dashboard"?"active":""} onClick={() => setActiveTab("dashboard")}>Dashboard</button>
          <button className={activeTab==="teachers"?"active":""} onClick={() => setActiveTab("teachers")}>Profesores</button>
          <button className={activeTab==="students"?"active":""} onClick={() => setActiveTab("students")}>Alumnos</button>
        </div>

        {/* SECCIONES */}
        <div className="tab-content">
          {/* DASHBOARD */}
          <section className={`tab-panel ${activeTab==="dashboard"?"show":"hide"}`}>
            <h2>📊 Dashboard</h2>
            {!dashboardData ? <p>Cargando...</p> :
              <div className="admin-grid">
                <div className="admin-card"><h3>Estudiantes</h3><p>{dashboardData.students}</p></div>
                <div className="admin-card"><h3>Profesores</h3><p>{dashboardData.teachers}</p></div>
                <div className="admin-card"><h3>Admins</h3><p>{dashboardData.admins}</p></div>
                <div className="admin-card"><h3>Usuarios</h3><p>{dashboardData.users}</p></div>
              </div>
            }
          </section>

          {/* PROFESORES */}
          <section className={`tab-panel ${activeTab==="teachers"?"show":"hide"}`}>
            <h2>👨‍🏫 Profesores</h2>
            <ul className="student-list">
              {teachers.map(t => (
                <li key={t.id}>{t.username} — {t.role}</li>
              ))}
            </ul>
          </section>

          {/* ALUMNOS */}
          <section className={`tab-panel ${activeTab==="students"?"show":"hide"}`}>
            <h2>👨‍🎓 Alumnos</h2>
            <div className="filters">
              <select value={level} onChange={e => setLevel(e.target.value)}>
                <option value="">Selecciona Nivel</option>
                {Object.keys(levelGrades).map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <select value={grade} onChange={e => setGrade(e.target.value)} disabled={!level}>
                <option value="">Selecciona Grado</option>
                {(level ? levelGrades[level] : []).map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <button onClick={fetchStudents}>Filtrar</button>
              <button onClick={() => setShowStudentForm(true)}>Nuevo Alumno</button>
            </div>
            <ul className="student-list">
              {students.map(s => (
                <li key={s.id}>
                  {s.name} — {s.level} {s.grade}
                  <button onClick={() => handleStudentEdit(s)}>Editar</button>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* LOGOUT */}
        <div className="admin-logout">
          <button onClick={handleLogout}>Cerrar sesión</button>
        </div>

        {/* MODAL ALUMNO */}
        {showStudentForm && (
          <div className="modal">
            <div className="modal-content">
              <h3>{studentForm.id ? "Editar Alumno" : "Nuevo Alumno"}</h3>
              <form onSubmit={handleStudentSubmit}>
                <input type="text" placeholder="Nombre" value={studentForm.name} onChange={e => setStudentForm({...studentForm, name:e.target.value})}/>
                <select value={studentForm.level} onChange={e => setStudentForm({...studentForm, level:e.target.value})}>
                  <option value="">Nivel</option>
                  {Object.keys(levelGrades).map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <select value={studentForm.grade} onChange={e => setStudentForm({...studentForm, grade:e.target.value})} disabled={!studentForm.level}>
                  <option value="">Grado</option>
                  {(studentForm.level ? levelGrades[studentForm.level] : []).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <div className="modal-buttons">
                  <button type="submit">Guardar</button>
                  <button type="button" onClick={()=>setShowStudentForm(false)}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
