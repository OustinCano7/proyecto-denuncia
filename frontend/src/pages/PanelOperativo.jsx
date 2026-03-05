import { useState, useEffect, useRef } from "react";
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
  const [hayNotificaciones, setHayNotificaciones] = useState(false);

  const navigate = useNavigate();
  const intervaloRef = useRef(null);

  const URL_DENUNCIAS = "http://localhost/proyecto-denuncia/backend/get_denuncias.php";

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("usuario"));

    if (storedUser && storedUser.usuario) {
      setUsuario(storedUser.usuario);
      setRol(storedUser.rol);
    } else {
      navigate("/");
      return;
    }

    iniciarVerificacion();

    return () => {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current);
      }
    };

  }, [navigate]);

  const iniciarVerificacion = () => {
    verificarNuevasDenuncias();

    intervaloRef.current = setInterval(() => {
      verificarNuevasDenuncias();
    }, 4000);
  };

  const verificarNuevasDenuncias = async () => {
    try {
      const response = await fetch(URL_DENUNCIAS);

      if (!response.ok) {
        console.error("Error servidor:", response.status);
        return;
      }

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) return;

      const idMasReciente = parseInt(data[0].id);
      const ultimoIdGuardado = localStorage.getItem("ultimoIdDenuncia");

      if (!ultimoIdGuardado) {
        localStorage.setItem("ultimoIdDenuncia", idMasReciente);
      } else {
        if (idMasReciente > parseInt(ultimoIdGuardado)) {
          setHayNotificaciones(true);
        }
      }

    } catch (error) {
      console.error("Error al verificar denuncias:", error);
    }
  };

  const handleNotificacionClick = async () => {
    try {
      const response = await fetch(URL_DENUNCIAS);
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem("ultimoIdDenuncia", data[0].id);
      }

      setHayNotificaciones(false);
      setActiveSection("bandeja");

    } catch (error) {
      console.error("Error al actualizar notificación:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("ultimoIdDenuncia");
    navigate("/");
  };

  const handleNuevaDenuncia = () => {
    navigate("/denuncia");
  };

  return (
    <div className="panel-container">
      <aside className="sidebar">
        <h2 className="sidebar-title">Sistema Ambiental</h2>
        <ul className="sidebar-menu">
          <li onClick={() => setActiveSection("dashboard")}>
            <img className="sidebar-icon" src="/images.png/dashboard.png" alt="Dashboard" />
            <span>Dashboard</span>
          </li>
          <li onClick={() => setActiveSection("bandeja")}>
            <img className="sidebar-icon" src="/images.png/denuncia.png" alt="Bandeja" />
            <span>Bandeja de Denuncias</span>
          </li>
          <li onClick={() => setActiveSection("reporte")}>
            <img className="sidebar-icon" src="/images.png/reporte.png" alt="Reporte" />
            <span>Generar Reporte</span>
          </li>
          <li onClick={() => setActiveSection("ajustes")}>
            <img className="sidebar-icon" src="/images.png/ajustes.png" alt="Ajustes" />
            <span>Ajustes</span>
          </li>
          <li onClick={handleNuevaDenuncia}>
            <img className="sidebar-icon" src="/images.png/denuncia.png" alt="Nueva" />
            <span>Nueva Denuncia</span>
          </li>
          <li onClick={handleLogout}>
            <img className="sidebar-icon" src="/images.png/sesion.png" alt="Logout" />
            <span>Cerrar Sesión</span>
          </li>
        </ul>
      </aside>

      <main className="main-content">
        <div className="top-bar">

          <div
            className={`notificacion-btn ${hayNotificaciones ? "activa" : ""}`}
            onClick={handleNotificacionClick}
          >
            🔔
            {hayNotificaciones && (
              <span className="notificacion-dot"></span>
            )}
          </div>

          <div className="user-info">
            <p><strong>Usuario:</strong> {usuario}</p>
            <p><strong>Rol:</strong> {rol}</p>
          </div>

        </div>

        {activeSection === "dashboard" && <Dashboard />}
        {activeSection === "bandeja" && <Bandeja />}
        {activeSection === "reporte" && <Reporte />}
        {activeSection === "ajustes" && <Ajustes />}

      </main>
    </div>
  );
}

export default PanelOperativo;
