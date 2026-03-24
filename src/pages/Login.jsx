import "./Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios"; 
import { toast } from "sonner";

function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Lógica para Alumnos (Solo DNI, sin contraseña)
    const esDniAlumno = /^\d{8,12}$/.test(usuario) && !password;

    if (esDniAlumno) {
      const alumnoPromise = api.get(`/students/search?dni=${usuario}`);

      toast.promise(alumnoPromise, {
        loading: "Buscando datos del alumno...",
        success: (res) => {
          const alumno = res.data;
          localStorage.setItem("user", JSON.stringify({ ...alumno, role: "STUDENT" }));
          navigate("/student");
          return `Hola ${alumno.name}, bienvenido.`;
        },
        error: (err) => {
          if (err.response?.status === 404) return "DNI no registrado";
          return "Error de conexión";
        }
      });
      return;
    }

    // 2. Lógica para Admin / Profesor (Requiere contraseña)
    if (!password) return toast.warning("Ingresa tu contraseña");

    const loginPromise = api.post("/auth/login", {
      username: usuario,
      password: password,
    });

    toast.promise(loginPromise, {
      loading: "Iniciando sesión...",
      success: (response) => {
        const user = response.data;
        localStorage.setItem("user", JSON.stringify(user));

        // --- CAMBIO CLAVE: Verificación universal ---
        // Si el backend dice que debe cambiarla (sea quien sea), lo mandamos
        if (user.mustChangePassword) {
          toast.info("Por seguridad, debes cambiar tu contraseña temporal");
          navigate("/change-password");
          return "Cambio de contraseña requerido";
        }

        // --- REDIRECCIÓN SEGÚN ROL ---
        // Asegúrate de que los strings coincidan con tu Enum de Java
        if (user.role === "ADMIN") {
          navigate("/admin"); // En minúsculas como en App.jsx
        } else if (user.role === "TEACHER") {
          navigate("/teacher");
        }
        
        return `¡Bienvenido, ${user.username}!`;
      },
      error: "Usuario o contraseña incorrectos",
    });
  };

  return (
    <div className="login-bg">
      <div className="login-wrapper">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Iniciar sesión</h2>
          <div className="input-group">
            <input
              type="text"
              placeholder="Usuario o DNI"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              // Si parece un DNI, la contraseña no es "required" para permitir flujo de alumnos
              required={!/^\d{8,12}$/.test(usuario)}
            />
          </div>
          <button type="submit" className="login-button">Entrar</button>
        </form>
      </div>
    </div>
  );
}

export default Login;