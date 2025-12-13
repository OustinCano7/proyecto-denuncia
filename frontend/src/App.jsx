import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import DenunciaForm from "./pages/DenunciaForm";
import PanelOperativo from "./pages/PanelOperativo";

// Ruta privada: solo accesible si hay usuario logueado
function PrivateRoute({ children }) {
  const usuario = localStorage.getItem("usuario");
  return usuario ? children : <Navigate to="/" />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Páginas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* Formulario de denuncia accesible también desde login/panel */}
        <Route path="/denuncia" element={<PrivateRoute><DenunciaForm /></PrivateRoute>} />

        {/* Panel operativo privado */}
        <Route path="/panel" element={<PrivateRoute><PanelOperativo /></PrivateRoute>} />

        {/* Redirección de rutas desconocidas */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
