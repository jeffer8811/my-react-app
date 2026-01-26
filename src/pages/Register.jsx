import "./Login.css";
import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validación del email
    if (!email) {
      setError("El email es obligatorio");
      return;
    }

    if (!email.includes("@")) {
      setError("Ingresa un email válido");
      return;
    }

    // Validación de password
    if (!password) {
      setError("La contraseña es obligatoria");
      return;
    }

    try {
      const payload = {
        username: email,
        password,
      };

      const response = await api.post("/auth/register", payload);

      const data = response.data;
      setSuccess(
        data.role
          ? `Usuario registrado como ${data.role}`
          : "Usuario registrado correctamente"
      );
      setEmail("");
      setPassword("");

      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      const msg = err.response?.data || err.message || "Error en el registro";
      setError(msg);
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
            <h1>Crear cuenta</h1>
            <p>Regístrate para acceder al sistema</p>
          </div>
        </div>

        <form className="login-form" onSubmit={handleRegister}>
          <h2>Registro</h2>

          <input
            type="email"
            placeholder="Usuario (correo)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p style={{ color: "red" }}>{error}</p>}
          {success && <p style={{ color: "green" }}>{success}</p>}

          <button type="submit">Registrar</button>
        </form>
      </div>
    </div>
  );
}