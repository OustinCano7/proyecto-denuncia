import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import Bandeja from "./Bandeja";
import Reporte from "./Reporte";
import Ajustes from "./Ajustes";
import "./PanelOperativo.css";

function PanelOperativo() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [usuario, setUsuario] = useState("");
  const [rol, setRol] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("usuario"));
    if (storedUser && storedUser.usuario) { // CORREGIDO: usar "usuario" en lugar de "nombre"
      setUsuario(storedUser.usuario);      // CORREGIDO: usar "usuario"
      setRol(storedUser.rol);
    } else {
      navigate("/"); // Si no hay usuario logueado
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    navigate("/");
  };

  const handleNuevaDenuncia = () => {
    navigate("/denuncia");
  };

  return (
    <div className="panel-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2>Sistema Ambiental</h2>
        <ul className="sidebar-menu">
          <li onClick={() => setActiveSection("dashboard")}>
            <img src="images.png/dashboard.png" alt="Dashboard" />
            <span>Dashboard</span>
          </li>
          <li onClick={() => setActiveSection("bandeja")}>
            <img src="images.png/denuncia.png" alt="Bandeja" />
            <span>Bandeja de Denuncias</span>
          </li>
          <li onClick={() => setActiveSection("reporte")}>
            <img src="images.png/reporte.png" alt="Reporte" />
            <span>Generar Reporte</span>
          </li>
          <li onClick={() => setActiveSection("ajustes")}>
            <img src="images.png/ajustes.png" alt="Ajustes" />
            <span>Ajustes</span>
          </li>
          <li onClick={handleNuevaDenuncia}>
            <img src="images.png/denuncia.png" alt="Nueva denuncia" />
            <span>Nueva Denuncia</span>
          </li>
          <li onClick={handleLogout}>
            <img src="images.png/sesion.png" alt="Cerrar sesión" />
            <span>Cerrar Sesión</span>
          </li>
        </ul>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="main-content">
        {/* Información de usuario */}
        <div className="user-info">
          <p><strong>Usuario:</strong> {usuario}</p>
          <p><strong>Rol:</strong> {rol}</p>
        </div>

        {/* SECCIONES */}
        {activeSection === "dashboard" && <Dashboard />}
        {activeSection === "bandeja" && <Bandeja />}
        {activeSection === "reporte" && <Reporte />}
        {activeSection === "ajustes" && <Ajustes />}
      </main>
    </div>
  );
}

export default PanelOperativo;
