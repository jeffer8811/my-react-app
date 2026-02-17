import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { toast } from "sonner";

function ChangePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return toast.error("Las contraseñas no coinciden");
    }

    if (newPassword.length < 6) {
      return toast.error("La contraseña debe tener al menos 6 caracteres");
    }

    try {
      // Llamada al backend para actualizar clave y poner mustChangePassword en false
      await api.put(`/users/update-password/${user.id}`, { 
        password: newPassword,
        mustChangePassword: false 
      });

      toast.success("Contraseña actualizada correctamente");
      
      // Actualizamos el usuario en el storage para que no le pida cambiarla de nuevo
      const updatedUser = { ...user, mustChangePassword: false };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      navigate("/teacher"); // Ahora sí lo dejamos entrar al panel
    } catch (error) {
      toast.error("No se pudo actualizar la contraseña");
    }
  };

  return (
    <div className="login-bg">
      <div className="login-wrapper">
        <form className="login-form" onSubmit={handleUpdate}>
          <h2>Nueva Contraseña</h2>
          <p>Tu privacidad es importante. Crea una contraseña nueva.</p>
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