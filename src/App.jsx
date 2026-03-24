import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import Teacher from "./pages/Teacher";
import Student from "./pages/Student";
import ChangePassword from "./pages/ChangePassword"; // <-- Importa el nuevo componente
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* --- RUTAS PÚBLICAS --- */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* --- RUTA DE CAMBIO DE CONTRASEÑA --- */}
      {/* La dejamos accesible para cualquier usuario autenticado que deba cambiar su clave */}
      <Route path="/change-password" element={<ChangePassword />} />

      {/* --- RUTAS PROTEGIDAS POR ROL --- */}
      
      {/* Alumno */}
      <Route 
        path="/student" 
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <Student />
          </ProtectedRoute>
        } 
      />

      {/* Administrador */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <Admin />
          </ProtectedRoute>
        }
      />

      {/* Profesor */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={["TEACHER"]}>
            <Teacher />
          </ProtectedRoute>
        }
      />

      {/* Ruta para manejar errores 404 o redirecciones no deseadas */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

export default App;