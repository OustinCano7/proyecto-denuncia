import { useEffect, useState } from "react";
import "./Bandeja.css";

function Bandeja() {
  const [denuncias, setDenuncias] = useState([]);
  const [filteredDenuncias, setFilteredDenuncias] = useState([]);
  const [selectedDenuncia, setSelectedDenuncia] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingEstatusId, setLoadingEstatusId] = useState(null);
  const [filterEstatus, setFilterEstatus] = useState("");
  const [filterTipo, setFilterTipo] = useState("");

  useEffect(() => {
    const cargarDenuncias = async () => {
      try {
        const res = await fetch("http://localhost/proyecto-denuncia/backend/get_denuncias.php");
        const text = await res.text();
        const data = JSON.parse(text || "[]");

        // Normalizamos estatus y tipo_denuncia para evitar problemas de mayúsculas/espacios
        const dataConEstatus = data.map(d => ({
          ...d,
          estatus: (d.estatus || "PENDIENTE").trim(),
          tipo_denuncia: (d.tipo_denuncia || "").trim()
        }));

        setDenuncias(dataConEstatus);
        setFilteredDenuncias(dataConEstatus);
      } catch (error) {
        console.error("Error cargando denuncias:", error);
        setDenuncias([]);
        setFilteredDenuncias([]);
      }
    };
    cargarDenuncias();
  }, []);

  // Aplicar filtros combinados
  useEffect(() => {
    let temp = [...denuncias];

    if (filterEstatus) {
      temp = temp.filter(d => d.estatus.toLowerCase() === filterEstatus.toLowerCase());
    }

    if (filterTipo) {
      temp = temp.filter(d => d.tipo_denuncia.toLowerCase() === filterTipo.toLowerCase());
    }

    setFilteredDenuncias(temp);
  }, [filterEstatus, filterTipo, denuncias]);

  const abrirModal = (denuncia) => { setSelectedDenuncia(denuncia); setShowModal(true); };
  const cerrarModal = () => { setSelectedDenuncia(null); setShowModal(false); };

  const cambiarEstatus = async (id, nuevoEstatus) => {
    if (loadingEstatusId) return;

    const prevDenuncias = [...denuncias];
    setDenuncias(prev => prev.map(d => d.id === id ? { ...d, estatus: nuevoEstatus } : d));
    setSelectedDenuncia(prev => (prev && prev.id === id ? { ...prev, estatus: nuevoEstatus } : prev));
    setLoadingEstatusId(id);

    try {
      const res = await fetch("http://localhost/proyecto-denuncia/backend/actualizar_estatus.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, estatus: nuevoEstatus })
      });
      const data = await res.json();
      if (!data.success) {
        alert("Error actualizando estatus.");
        setDenuncias(prevDenuncias);
      }
      setLoadingEstatusId(null);
      cerrarModal();
    } catch {
      alert("Error comunicándose con el servidor.");
      setDenuncias(prevDenuncias);
      setLoadingEstatusId(null);
    }
  };

  return (
    <div className="table-container">
      <h2>Bandeja de Denuncias</h2>
      <div className="filters">
        <select value={filterEstatus} onChange={(e) => setFilterEstatus(e.target.value)}>
          <option value="">Todos los estatus</option>
          <option value="PENDIENTE">PENDIENTE</option>
          <option value="ASIGNADA">ASIGNADA</option>
          <option value="INSPECCIÓN">INSPECCIÓN</option>
        </select>

        <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)}>
          <option value="">Todos los tipos</option>
          <option value="Suelo">Suelo</option>
          <option value="Aire">Aire</option>
          <option value="Agua">Agua</option>
          <option value="Ruido">Ruido</option>
          <option value="Flora Silvestre">Flora Silvestre</option>
          <option value="Fauna Silvestre">Fauna Silvestre</option>
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>Folio</th>
            <th>Fecha ingreso</th>
            <th>Tipo denuncia</th>
            <th>Dirección</th>
            <th>Estatus</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {filteredDenuncias.length === 0 ? (
            <tr><td colSpan="6" style={{ textAlign: "center" }}>No hay registros</td></tr>
          ) : (
            filteredDenuncias.map(d => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.created_at}</td>
                <td>{d.tipo_denuncia}</td>
                <td>{d.direccion}</td>
                <td>{d.estatus}</td>
                <td>
                  {d.estatus === "PENDIENTE" && (
                    <button className="btn-assign" onClick={() => abrirModal(d)} disabled={loadingEstatusId === d.id}>
                      {loadingEstatusId === d.id ? "Procesando..." : "Ver / Asignar"}
                    </button>
                  )}
                  {d.estatus === "ASIGNADA" && (
                    <button className="btn-detail" onClick={() => abrirModal(d)}>Ver Detalle</button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showModal && selectedDenuncia && (
        <div className="modal">
          <div className="modal-content">
            <h3>Denuncia ID: {selectedDenuncia.id}</h3>
            <p><strong>Tipo:</strong> {selectedDenuncia.tipo_denuncia}</p>
            <p><strong>Dirección:</strong> {selectedDenuncia.direccion}</p>
            <p><strong>Detalle:</strong> {selectedDenuncia.detalle_problema}</p>
            <p><strong>Estatus:</strong> {selectedDenuncia.estatus}</p>

            {selectedDenuncia.estatus === "PENDIENTE" && (
              <button className="btn-assign" onClick={() => cambiarEstatus(selectedDenuncia.id, "ASIGNADA")} disabled={loadingEstatusId === selectedDenuncia.id}>
                {loadingEstatusId === selectedDenuncia.id ? "Asignando..." : "Asignar"}
              </button>
            )}

            <button className="btn-close" onClick={cerrarModal}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Bandeja;
