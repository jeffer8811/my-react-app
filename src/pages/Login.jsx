import "./Login.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/auth/login", {
        username: usuario,
        password,
      });

      const user = response.data;

      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "ADMIN") {
        window.location.href = "/admin";
      } else if (user.role === "PROFESSOR") {
        window.location.href = "/teacher";
      } else {
        window.location.href = "/student";
      }
    } catch (err) {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="login-bg">

      {/* BURBUJAS */}
      <div className="bubble b1"></div>
      <div className="bubble b2"></div>
      <div className="bubble b3"></div>

      <div className="login-wrapper">
        <div className="login-image">
          <div className="login-image-content">
            <h1>Bienvenido 👋</h1>
            <p>Accede a tu panel académico</p>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Iniciar sesión</h2>

          <input
            type="email"
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button type="submit">Entrar</button>

          <p>
            ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;