import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";
import "./Admin.css";
import { toast } from "sonner";

export default function Admin() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // --- ESTADOS GENERALES ---
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboardData, setDashboardData] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  
  // --- FILTROS Y FORMULARIOS ---
  const [level, setLevel] = useState(""); 
  const [grade, setGrade] = useState("");
  const [searchDni, setSearchDni] = useState("");

  // Modales
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showTeacherForm, setShowTeacherForm] = useState(false);

  // Datos de formularios
  const initialStudentState = {
    id: null, name: "", dni: "", level: "", grade: "", parentEmail: "", paymentStatus: "PENDING"
  };
  const [studentForm, setStudentForm] = useState(initialStudentState);
  const [newTeacherDni, setNewTeacherDni] = useState(""); 

  const levelGrades = {
    Inicial: ["3 años", "4 años", "5 años"],
    Primaria: ["1°", "2°", "3°", "4°", "5°", "6°"],
    Secundaria: ["1°", "2°", "3°", "4°", "5°"]
  };

  // --- EFECTOS ---
  useEffect(() => {
    if (!user || user.role !== "ADMIN") navigate("/login");
  }, [navigate, user]);

  useEffect(() => {
    api.get("/admin/dashboard")
      .then(res => setDashboardData(res.data))
      .catch(() => toast.error("Error al cargar dashboard"));
  }, []);

  useEffect(() => {
    if (activeTab === "teachers") loadTeacherAndCourseData();
    if (activeTab === "courses") fetchCourses();
    if (activeTab === "students") fetchStudents();
  }, [activeTab]);

  // --- LÓGICA DE PROFESORES ---
  const loadTeacherAndCourseData = async () => {
    try {
      const [resT, resC, resA] = await Promise.all([
        api.get("/admin/users?role=TEACHER"),
        api.get("/courses"),
        api.get("/assignments")
      ]);
      setTeachers(resT.data);
      setCourses(resC.data);
      setAssignments(resA.data);
    } catch (err) {
      toast.error("Error al cargar datos");
    }
  };

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", {
        username: newTeacherDni,
        password: newTeacherDni,
        role: "TEACHER"
      });
      toast.success("¡Usuario de profesor creado!");
      setNewTeacherDni("");
      setShowTeacherForm(false);
      loadTeacherAndCourseData();
    } catch (err) {
      toast.error("El DNI ya existe");
    }
  };

  // --- GESTIÓN DE CURSOS ---
  const fetchCourses = () => {
    api.get("/courses").then(res => setCourses(res.data));
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    const name = e.target.courseName.value;
    try {
      await api.post("/courses", { name });
      toast.success("Curso creado");
      e.target.reset();
      fetchCourses();
    } catch (err) { toast.error("Error al crear curso"); }
  };

  const handleDeleteCourse = (id, name) => {
    toast(`¿Eliminar curso "${name}"?`, {
      description: "Esto afectará las asignaciones de los profesores.",
      action: {
        label: "Eliminar",
        onClick: () => {
          api.delete(`/courses/${id}`)
            .then(() => {
              toast.success("Curso eliminado correctamente");
              fetchCourses();
            })
            .catch(() => toast.error("No se pudo eliminar el curso"));
        },
      },
      cancel: { label: "Cancelar", onClick: () => toast.dismiss() },
    });
  };

  // --- GESTIÓN DE ASIGNACIONES ---
  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const payload = {
      teacher: { id: data.get("teacherId") },
      course: { id: data.get("courseId") },
      level: data.get("level"),
      grade: data.get("grade")
    };
    try {
      await api.post("/assignments", payload);
      toast.success("Asignación completada");
      loadTeacherAndCourseData();
    } catch (err) { toast.error("Error al asignar"); }
  };

  const deleteAssignment = (id, teacherName, courseName) => {
    toast(`¿Quitar asignación?`, {
      description: `Se desvinculará a ${teacherName} del curso ${courseName}.`,
      action: {
        label: "Desvincular",
        onClick: () => {
          api.delete(`/assignments/${id}`).then(() => {
            toast.success("Asignación eliminada");
            loadTeacherAndCourseData();
          }).catch(() => toast.error("Error al eliminar"));
        },
      },
      cancel: { label: "Cancelar", onClick: () => toast.dismiss() },
    });
  };

  // --- GESTIÓN DE ALUMNOS ---
  const fetchStudents = () => {
    let url = "/students";
    if (level) {
      url = `/students/filter?level=${level}${grade ? `&grade=${grade}` : ""}`;
    }
    api.get(url)
      .then(res => setStudents(res.data))
      .catch(() => toast.error("Error al obtener alumnos"));
  };

  const handleStudentSubmit = (e) => {
    e.preventDefault();
    api.post("/students", studentForm)
      .then(() => {
        fetchStudents();
        setShowStudentForm(false);
        setStudentForm(initialStudentState);
        toast.success("Alumno registrado con éxito");
      })
      .catch((err) => toast.error(err.response?.data?.message || "Error al registrar"));
  };

  const handleDeleteStudent = (id, name) => {
    toast(`¿Eliminar a ${name}?`, {
      description: "Esta acción borrará sus notas asociadas permanentemente.",
      action: {
        label: "Eliminar",
        onClick: () => {
          api.delete(`/students/${id}`)
            .then(() => {
              toast.success(`${name} eliminado`);
              fetchStudents();
            })
            .catch(() => toast.error("Error al eliminar"));
        },
      },
      cancel: { label: "Cancelar", onClick: () => toast.dismiss() },
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="admin-bg">
      <div className="admin-wrapper">
        <div className="admin-header">
          <h1>👑 Panel Admin</h1>
          <p>Bienvenido, <span>{user?.username}</span></p>
        </div>

        <nav className="filters">
          <button className={activeTab === "dashboard" ? "active" : ""} onClick={() => setActiveTab("dashboard")}>Dashboard</button>
          <button className={activeTab === "teachers" ? "active" : ""} onClick={() => setActiveTab("teachers")}>Profesores</button>
          <button className={activeTab === "courses" ? "active" : ""} onClick={() => setActiveTab("courses")}>Cursos</button>
          <button className={activeTab === "students" ? "active" : ""} onClick={() => setActiveTab("students")}>Alumnos</button>
        </nav>

        <div className="tab-content">
          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <section className="tab-panel show">
              <div className="admin-grid">
                <div className="admin-card"><h3>Estudiantes</h3><p>{dashboardData?.students || 0}</p></div>
                <div className="admin-card"><h3>Profesores</h3><p>{dashboardData?.teachers || 0}</p></div>
                <div className="admin-card"><h3>Cursos registrados</h3><p>{courses.length}</p></div>
              </div>
            </section>
          )}

          {/* PROFESORES */}
          {activeTab === "teachers" && (
            <section className="tab-panel show">
              <div className="admin-header-flex">
                <h2>👨‍🏫 Profesores y Cargas</h2>
                <button className="btn-add" onClick={() => setShowTeacherForm(true)}>+ Registrar Nuevo Profesor</button>
              </div>

              <div className="assignment-grid">
                <div className="assignment-card">
                  <h3>Asignar Curso</h3>
                  <form onSubmit={handleAssignmentSubmit} className="mini-form">
                    <select required name="teacherId" className="form-input">
                      <option value="">Docente...</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.username}</option>)}
                    </select>
                    <select required name="courseId" className="form-input">
                      <option value="">Curso...</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select name="level" className="form-input" required onChange={(e) => setLevel(e.target.value)}>
                      <option value="">Nivel...</option>
                      {Object.keys(levelGrades).map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <select name="grade" className="form-input" required disabled={!level}>
                      <option value="">Grado...</option>
                      {levelGrades[level]?.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <button type="submit" className="btn-assign">Vincular</button>
                  </form>
                </div>

                <div className="list-card">
                  <table className="modern-table">
                    <thead><tr><th>DNI Profe</th><th>Curso</th><th>Aula</th><th>Acción</th></tr></thead>
                    <tbody>
                      {assignments.map(asig => (
                        <tr key={asig.id}>
                          <td>{asig.teacher.username}</td>
                          <td>{asig.course.name}</td>
                          <td>{asig.level} - {asig.grade}</td>
                          <td><button className="btn-delete-small" onClick={() => deleteAssignment(asig.id)}>🗑️</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

{/* TAB CURSOS */}
{activeTab === "courses" && (
  <section className="tab-panel show">
    <h2>📚 Gestión de Cursos</h2>
    <form onSubmit={handleCreateCourse} className="mini-form" style={{ marginBottom: '25px' }}>
      <div style={{ display: 'flex', gap: '10px' }}>
        <input 
          name="courseName" 
          placeholder="Ej: Matemática, Comunicación..." 
          required 
          className="form-input" 
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn-assign" style={{ width: 'fit-content', marginTop: 0 }}>
          + Agregar Curso
        </button>
      </div>
    </form>

    <div className="course-tags-container" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      {courses.map(c => (
        <div key={c.id} className="tag-grade" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '6px 12px',
          fontSize: '0.95rem' 
        }}>
          {c.name}
          <button 
            onClick={() => handleDeleteCourse(c.id, c.name)}
            style={{
              background: 'none',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              padding: '0 2px',
              lineHeight: 1
            }}
            title="Eliminar curso"
          >
            ×
          </button>
        </div>
      ))}
      {courses.length === 0 && <p style={{ color: '#666' }}>No hay cursos registrados aún.</p>}
    </div>
  </section>
)}
{/* ALUMNOS CON FILTROS Y BÚSQUEDA */}
{activeTab === "students" && (
  <section className="tab-panel show">
    <div className="admin-header-flex">
      <h2>👨‍🎓 Control de Alumnos</h2>
      <button className="btn-add" onClick={() => setShowStudentForm(true)}>
        + Nuevo Alumno
      </button>
    </div>

    <div className="admin-controls-container" style={{ 
      display: 'flex', 
      gap: '12px', 
      marginBottom: '20px', 
      alignItems: 'center',
      background: '#f8fafc',
      padding: '15px',
      borderRadius: '12px'
    }}>
      <div className="search-box" style={{ flex: 1 }}>
        <input 
          type="text" 
          className="form-input"
          placeholder="🔍 Buscar por DNI..." 
          value={searchDni} 
          onChange={e => setSearchDni(e.target.value)} 
          style={{ marginBottom: 0 }}
        />
      </div>
      
      <select 
        className="form-input" 
        style={{ width: '180px', marginBottom: 0 }} 
        value={level} 
        onChange={e => { setLevel(e.target.value); setGrade(""); }}
      >
        <option value="">Todos los Niveles</option>
        {Object.keys(levelGrades).map(l => <option key={l} value={l}>{l}</option>)}
      </select>

      <select 
        className="form-input" 
        style={{ width: '180px', marginBottom: 0 }} 
        value={grade} 
        onChange={e => setGrade(e.target.value)} 
        disabled={!level}
      >
        <option value="">Todos los Grados</option>
        {level && levelGrades[level].map(g => <option key={g} value={g}>{g}</option>)}
      </select>

      <button 
        className="btn-add" 
        onClick={fetchStudents} 
        style={{ width: 'auto', padding: '0 20px', height: '42px' }}
      >
        Filtrar
      </button>
    </div>

    <div className="list-card">
      <table className="modern-table">
        <thead>
          <tr>
            <th>DNI</th>
            <th>Nombre Completo</th>
            <th>Nivel</th>
            <th>Grado</th>
            <th style={{ textAlign: 'center' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {students.filter(s => s.dni.includes(searchDni)).map(s => (
            <tr key={s.id}>
              <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{s.dni}</td>
              <td><strong>{s.name}</strong></td>
              <td>{s.level}</td>
              <td><span className="tag-grade">{s.grade}</span></td>
              <td style={{ display: 'flex', justifyContent: 'center' }}>
                <button 
                  className="btn-delete-action" 
                  onClick={() => handleDeleteStudent(s.id, s.name)}
                  title="Eliminar Alumno"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
          {students.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                No se encontraron alumnos con los filtros seleccionados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </section>
)}
        </div>

        {/* MODAL REGISTRO PROFESOR */}
        {showTeacherForm && (
          <div className="modal">
            <div className="modal-content">
              <h3>Nuevo Usuario de Profesor</h3>
              <form onSubmit={handleCreateTeacher}>
                <input 
                  type="text" className="form-input" placeholder="DNI del Profesor"
                  value={newTeacherDni} onChange={e => setNewTeacherDni(e.target.value)} required 
                />
                <p style={{fontSize: '0.75rem', color: '#666', marginTop: '5px'}}>* El DNI será su usuario y clave inicial.</p>
                <div className="modal-buttons">
                  <button type="submit" className="btn-save">Crear Acceso</button>
                  <button type="button" className="btn-cancel" onClick={() => setShowTeacherForm(false)} style={{backgroundColor: '#666', color: 'white', marginLeft: '10px', padding: '8px 15px', borderRadius: '6px', border: 'none'}}>Cerrar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL REGISTRO ALUMNO (DINÁMICO) */}
        {showStudentForm && (
          <div className="modal">
            <div className="modal-content">
              <h3>Ficha de Matrícula Alumno</h3>
              <form onSubmit={handleStudentSubmit} className="student-form-grid">
                <div className="full-width">
                  <input 
                    placeholder="Nombre Completo" 
                    className="form-input"
                    onChange={e => setStudentForm({...studentForm, name: e.target.value})} 
                    required 
                  />
                </div>
                <input 
                  placeholder="DNI" 
                  className="form-input"
                  onChange={e => setStudentForm({...studentForm, dni: e.target.value})} 
                  required 
                />
                
                <select 
                  className="form-input"
                  onChange={e => setStudentForm({...studentForm, level: e.target.value, grade: ""})} 
                  required
                >
                  <option value="">Nivel...</option>
                  {Object.keys(levelGrades).map(l => <option key={l} value={l}>{l}</option>)}
                </select>

                <select 
                  className="form-input"
                  onChange={e => setStudentForm({...studentForm, grade: e.target.value})} 
                  required 
                  disabled={!studentForm.level}
                >
                  <option value="">Grado...</option>
                  {studentForm.level && levelGrades[studentForm.level].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>

                <div className="modal-buttons full-width">
                  <button type="submit" className="btn-save">Guardar Alumno</button>
                  <button type="button" className="btn-cancel" onClick={() => setShowStudentForm(false)} style={{backgroundColor: '#ef4444', color: 'white', marginLeft: '10px', padding: '8px 15px', borderRadius: '6px', border: 'none'}}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="admin-logout">
          <button onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      </div>
    </div>
  );
}