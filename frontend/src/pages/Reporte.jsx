import { useEffect, useState } from "react";
import "./Reporte.css";

function Reporte() {
  const [denuncias, setDenuncias] = useState([]);
  const [selectedDenuncia, setSelectedDenuncia] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);

  // Cargar denuncias asignadas
  useEffect(() => {
    const cargarDenuncias = async () => {
      try {
        const res = await fetch("http://localhost/proyecto-denuncia/backend/get_denuncias.php");
        const text = await res.text();
        const data = JSON.parse(text || "[]");
        setDenuncias(data.filter(d => d.estatus === "ASIGNADA"));
      } catch (error) {
        console.error("Error cargando denuncias:", error);
        setDenuncias([]);
      }
    };
    cargarDenuncias();
  }, []);

  const abrirModal = (denuncia) => {
    setSelectedDenuncia(denuncia);
    setFiles([]);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setSelectedDenuncia(null);
    setFiles([]);
    setShowModal(false);
  };

  const handleFilesChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleGenerarReporte = async (e) => {
    e.preventDefault();
    if (!selectedDenuncia) return;

    setLoading(true);

    // Crear FormData para enviar archivos
    const formData = new FormData();
    formData.append("id", selectedDenuncia.id);
    formData.append("resultado", e.target.resultado.value);
    formData.append("observaciones", e.target.observaciones.value);
    formData.append("medidas", e.target.medidas.value);
    files.forEach((file, index) => {
      formData.append(`evidencia[]`, file);
    });

    try {
      const res = await fetch("http://localhost/proyecto-denuncia/backend/guardar_reporte.php", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        alert("Reporte generado correctamente");
        cerrarModal();
      } else {
        alert("Error al generar el reporte: " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reporte-container">
      <h2>Generar Reporte de Denuncias Asignadas</h2>

      {denuncias.length === 0 ? (
        <p>No hay denuncias asignadas.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Folio</th>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Dirección</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {denuncias.map((d) => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.created_at}</td>
                <td>{d.tipo_denuncia}</td>
                <td>{d.direccion}</td>
                <td>
                  <button className="btn-generate" onClick={() => abrirModal(d)}>
                    Generar Reporte
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && selectedDenuncia && (
        <div className="modal">
          <div className="modal-content">
            <h3>Generar Reporte - Denuncia ID: {selectedDenuncia.id}</h3>
            <form onSubmit={handleGenerarReporte}>
              <label>Resultado de inspección:</label>
              <select name="resultado" required>
                <option value="">Seleccione...</option>
                <option value="Resuelto">Resuelto</option>
                <option value="Pendiente">Pendiente</option>
                <option value="No Procede">No Procede</option>
              </select>

              <label>Observaciones:</label>
              <textarea name="observaciones" rows="3" placeholder="Observaciones del inspector" required />

              <label>Medidas tomadas:</label>
              <textarea name="medidas" rows="3" placeholder="Medidas o acciones realizadas" required />

              <label>Evidencia fotográfica:</label>
              <input type="file" multiple accept="image/*" onChange={handleFilesChange} />

              <div className="modal-buttons">
                <button type="submit" className="btn-generate" disabled={loading}>
                  {loading ? "Generando..." : "Generar Reporte"}
                </button>
                <button type="button" className="btn-close" onClick={cerrarModal}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reporte;
