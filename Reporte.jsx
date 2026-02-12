import { useEffect, useState } from "react";
import "./Reporte.css";

function Reporte() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(false);

  const API = "http://localhost/proyecto-denuncia/backend";

  const fetchSeguro = async (url) => {
    const res = await fetch(url);
    const text = await res.text();
    return JSON.parse(text);
  };

  const cargarReportes = async () => {
    setLoading(true);
    try {
      const data = await fetchSeguro(`${API}/get_reportes.php`);
      setReportes(data);
    } catch (e) {
      console.error("Error cargando reportes:", e);
      setReportes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReportes();
    const interval = setInterval(cargarReportes, 5000); // refresco cada 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="table-container">
      <h2>Tabla de Reportes</h2>

      {loading && <p>Cargando reportes...</p>}

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Denuncia ID</th>
            <th>Tipo</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {reportes.length === 0 ? (
            <tr><td colSpan="6">No hay reportes</td></tr>
          ) : (
            reportes.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.denuncia_id}</td>
                <td>{r.tipo}</td>
                <td>{r.descripcion}</td>
                <td>{r.estado}</td>
                <td>{r.fecha}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Reporte;
