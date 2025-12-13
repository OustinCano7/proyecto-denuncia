import { useEffect, useState } from "react";
import "./Dashboard.css";

function Dashboard() {
  const [denuncias, setDenuncias] = useState([]);

  useEffect(() => {
    const cargarDenuncias = async () => {
      try {
        const res = await fetch("http://localhost/proyecto-denuncia/backend/get_denuncias.php");
        const text = await res.text();
        const data = JSON.parse(text || "[]");
        setDenuncias(data.map(d => ({ ...d, estatus: d.estatus || "PENDIENTE" })));
      } catch (error) {
        console.error("Error cargando denuncias:", error);
        setDenuncias([]);
      }
    };
    cargarDenuncias();
  }, []);

  const total = denuncias.length;
  const pendientes = denuncias.filter(d => d.estatus === "PENDIENTE").length;
  const asignadas = denuncias.filter(d => d.estatus === "ASIGNADA").length;
  const inspeccion = denuncias.filter(d => d.estatus === "INSPECCIÓN").length;
  const mesActual = denuncias.filter(
    d => new Date(d.created_at).getMonth() === new Date().getMonth()
  ).length;

  return (
    <div className="dashboard-container">
      {/* Título de la sección */}
      <h2>Dashboard</h2>

      <div className="kpis">
        <div className="kpi-card"><h3>Denuncias Totales</h3><p>{total}</p></div>
        <div className="kpi-card"><h3>Pendientes</h3><p>{pendientes}</p></div>
        <div className="kpi-card"><h3>Asignadas</h3><p>{asignadas}</p></div>
        <div className="kpi-card"><h3>En inspección</h3><p>{inspeccion}</p></div>
        <div className="kpi-card"><h3>Resueltas del Mes</h3><p>{mesActual}</p></div>
      </div>
    </div>
  );
}

export default Dashboard;
