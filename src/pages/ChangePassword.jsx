import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { toast } from "sonner";
import "./Login.css"; // Asegúrate de importar el CSS para que se vea igual

function ChangePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  
  // Obtenemos el usuario del storage
  const user = JSON.parse(localStorage.getItem("user"));

  const handleUpdate = async (e) => {
    e.preventDefault();

    // 1. Validaciones básicas
    if (newPassword !== confirmPassword) {
      return toast.error("Las contraseñas no coinciden");
    }

    if (newPassword.length < 6) {
      return toast.error("La contraseña debe tener al menos 6 caracteres");
    }

    try {
      // 2. Llamada al backend
      // El backend en UserController ya pone mustChangePassword en false al recibir el PUT
      await api.put(`/users/update-password/${user.id}`, { 
        password: newPassword 
      });

      toast.success("Contraseña actualizada correctamente");
      
      // 3. Actualizamos el objeto en el storage local
      const updatedUser = { ...user, mustChangePassword: false };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // 4. REDIRECCIÓN DINÁMICA
      // En lugar de mandarlo fijo a /teacher, lo mandamos según su rol real
      if (updatedUser.role === "ADMIN") {
        navigate("/admin");
      } else if (updatedUser.role === "TEACHER") {
        navigate("/teacher");
      } else {
        navigate("/"); // Por si acaso, al inicio
      }

    } catch (error) {
      console.error(error);
      toast.error("No se pudo actualizar la contraseña");
    }
  };

  // Seguridad: Si alguien entra a la URL /change-password sin estar logueado
  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="login-bg">
      <div className="login-wrapper">
        <form className="login-form" onSubmit={handleUpdate}>
          <h2>Nueva Contraseña</h2>
          <p style={{ color: "white", marginBottom: "1rem", fontSize: "0.9rem", textAlign: "center" }}>
            Tu privacidad es importante. Crea una contraseña nueva para tu cuenta.
          </p>
          <div className="input-group">
            <input
              type="password"
              placeholder="Nueva Contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Confirmar Contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">Guardar y Entrar</button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;