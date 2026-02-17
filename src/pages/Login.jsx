import "./Login.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios"; 
import { toast } from "sonner";

function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const esDniAlumno = /^\d{8,12}$/.test(usuario) && !password;

    // --- LÓGICA DE ALUMNO ---
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

    // --- LÓGICA DE ADMIN / PROFESOR ---
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

        // VERIFICACIÓN DE CONTRASEÑA TEMPORAL
        if (user.role === "TEACHER" && user.mustChangePassword) {
          toast.info("Por seguridad, debes cambiar tu contraseña temporal");
          navigate("/change-password"); // <--- Nueva ruta
          return "Cambio de contraseña requerido";
        }

        if (user.role === "ADMIN") {
          navigate("/Admin");
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