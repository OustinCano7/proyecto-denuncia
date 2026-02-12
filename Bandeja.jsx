import { useEffect, useState } from "react";
import "./Bandeja.css";

function Bandeja() {
  const [denuncias, setDenuncias] = useState([]);
  const [filteredDenuncias, setFilteredDenuncias] = useState([]);
  const [selectedDenuncia, setSelectedDenuncia] = useState(null);
  const [evidencias, setEvidencias] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [loadingId, setLoadingId] = useState(null);

  /* 🔹 FILTROS */
  const [filterFolio, setFilterFolio] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterMes, setFilterMes] = useState("");
  const [filterFecha, setFilterFecha] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const [fechaInspeccion, setFechaInspeccion] = useState("");
  const [horaInspeccion, setHoraInspeccion] = useState("");

  /* 🔹 CARRUSEL IMÁGENES */
  const [imgIndex, setImgIndex] = useState(0);

  /* 🔹 AUTOPLAY CARRUSEL */
  useEffect(() => {
    const imagenes = evidencias.filter(e =>
      IMAGE_EXT.test(e.file_path || "")
    );

    if (imagenes.length > 1 && showModal) {
      const interval = setInterval(() => {
        setImgIndex(prev => (prev + 1) % imagenes.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [evidencias, showModal]);

  const API = "http://localhost/proyecto-denuncia/backend";
  const BASE_URL = "http://localhost/proyecto-denuncia/backend/api";

  /* ================= FETCH SEGURO ================= */
  const fetchSeguro = async (url, options = {}) => {
    const res = await fetch(url, options);
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      throw new Error("Respuesta inválida del servidor");
    }
  };

  /* ================= CARGA DENUNCIAS ================= */
  useEffect(() => {
    fetchSeguro(`${API}/get_denuncias.php`)
      .then((data) => {
        setDenuncias(data);
        setFilteredDenuncias(data);
      })
      .catch(() => {
        setDenuncias([]);
        setFilteredDenuncias([]);
      });
  }, []);

  /* ================= FILTROS ================= */
  useEffect(() => {
    let temp = [...denuncias];

    if (filterFolio) {
      const folio = Number(filterFolio);
      setFilteredDenuncias(temp.filter(d => Number(d.id) === folio));
      return;
    }

    if (filterEstado) temp = temp.filter(d => d.estado_procedimiento === filterEstado);

    if (filterTipo) {
      temp = temp.filter(
        d => d.tipo_denuncia?.toLowerCase() === filterTipo.toLowerCase()
      );
    }

    if (filterMes) {
      temp = temp.filter(
        d => new Date(d.created_at).getMonth() + 1 === Number(filterMes)
      );
    }

    if (filterFecha) {
      temp = temp.filter(d => d.created_at.split(" ")[0] === filterFecha);
    }

    if (fechaInicio && fechaFin) {
      temp = temp.filter(d => {
        const f = d.created_at.split(" ")[0];
        return f >= fechaInicio && f <= fechaFin;
      });
    }

    setFilteredDenuncias(temp);
  }, [
    filterFolio,
    filterEstado,
    filterTipo,
    filterMes,
    filterFecha,
    fechaInicio,
    fechaFin,
    denuncias,
  ]);

  /* ================= MODAL ================= */
  const abrirModal = async (d) => {
    setShowModal(true);
    setShowInfo(false);
    setFechaInspeccion("");
    setHoraInspeccion("");
    setEvidencias([]);
    setImgIndex(0);

    try {
      /* 🔹 TRAER DENUNCIA COMPLETA */
      const denunciaCompleta = await fetchSeguro(
        `${API}/get_denuncia_detalle.php?id=${d.id}`
      );

      console.log("EVIDENCIAS BACKEND:", denunciaCompleta);

      // soporta {data:{}} o {}
      const denunciaData =
        denunciaCompleta?.data ? denunciaCompleta.data : denunciaCompleta;

      console.log("DETALLE DENUNCIA:", denunciaData);

      setSelectedDenuncia(denunciaData);

      /* 🔹 TRAER EVIDENCIAS */
      const data = await fetchSeguro(
        `${API}/get_evidencias.php?denuncia_id=${d.id}`
      );

      const evid =
        Array.isArray(data) ? data :
        Array.isArray(data?.data) ? data.data :
        [];

      setEvidencias(evid);

    } catch (e) {
      console.error(e);
      setSelectedDenuncia(d); // fallback
      setEvidencias([]);
    }
  };

  const cerrarModal = () => {
    setSelectedDenuncia(null);
    setShowModal(false);
    setShowInfo(false);
    setEvidencias([]);
  };

  /* ================= CAMBIAR ESTADO ================= */
  const cambiarEstado = async (nuevoEstado) => {
    setLoadingId(selectedDenuncia.id);

    try {
      await fetchSeguro(`${API}/actualizar_estado.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedDenuncia.id,
          estado: nuevoEstado,
        }),
      });

      setDenuncias((prev) =>
        prev.map((d) =>
          d.id === selectedDenuncia.id
            ? { ...d, estado_procedimiento: nuevoEstado }
            : d
        )
      );

      cerrarModal();
    } catch (e) {
      alert(e.message);
    } finally {
      setLoadingId(null);
    }
  };

  /* ================= CERRAR MODAL CLICK AFUERA ================= */
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      cerrarModal();
    }
  };

  /* ================= ABRIR EVIDENCIAS ================= */
  const abrirImagenes = () => {
    const imgs = evidencias.filter(e =>
      IMAGE_EXT.test(e.file_path || "")
    );

    if (!imgs.length) {
      alert("No hay imágenes disponibles");
      return;
    }

    imgs.forEach(img => {
      const url = `${BASE_URL}/${img.file_path}`
        .replace(/([^:]\/)\/+/g, "$1");
        window.open(url, "_blank");
      });
    };

  const abrirVideos = () => {
    const vids = evidencias.filter(e =>
      VIDEO_EXT.test(e.file_path || "")
    );

    if (!vids.length) {
      alert("No hay videos disponibles");
      return;
    }

    vids.forEach(vid => {
      const url = `${BASE_URL}/${vid.file_path}`
        .replace(/([^:]\/)\/+/g, "$1");
        window.open(url, "_blank");
      });
    };

  /* ================= AGENDAR INSPECCIÓN ================= */
  const agendarInspeccion = async () => {
    if (!fechaInspeccion || !horaInspeccion)
      return alert("Selecciona fecha y hora");

    setLoadingId(selectedDenuncia.id);

    try {
      await fetchSeguro(`${API}/agendar_inspeccion.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedDenuncia.id,
          fecha_inspeccion: fechaInspeccion,
          hora_inspeccion: horaInspeccion,
        }),
      });

      setDenuncias((prev) =>
        prev.map((d) =>
          d.id === selectedDenuncia.id
            ? {
                ...d,
                estado_procedimiento: "INSPECCION_AGENDADA",
                fecha_inspeccion: fechaInspeccion,
              }
            : d
        )
      );

      cerrarModal();
    } catch (e) {
      alert(e.message);
    } finally {
      setLoadingId(null);
    }
  };

  const limpiarFiltros = () => {
    setFilterFolio("");
    setFilterEstado("");
    setFilterTipo("");
    setFilterMes("");
    setFilterFecha("");
    setFechaInicio("");
    setFechaFin("");
    setFilteredDenuncias(denuncias);
  };

  /* 🔥 SOPORTE UNIVERSAL PARA ARCHIVOS DE CELULAR */
  const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|jfif|heic|heif|bmp|tiff)$/i;
  const VIDEO_EXT = /\.(mp4|mov|avi|mkv|webm|3gp|m4v)$/i;

  const imagenes = evidencias.filter(e =>
    IMAGE_EXT.test(e.file_path || "")
  );

  const videos = evidencias.filter(e =>
    VIDEO_EXT.test(e.file_path || "")
  );

  const validImgIndex =
    imagenes.length > 0 ? imgIndex % imagenes.length : 0;

  /* ================= RENDER ================= */
  return (
    <div className="table-container">
      <h2>Bandeja de Denuncias</h2>

      {/* FILTROS */}
      <div className="filtros-grid">
        <input type="number" placeholder="Folio" value={filterFolio} onChange={e => setFilterFolio(e.target.value)} />

        <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
          <option value="">Estado</option>
          <option value="RECIBIDA">Recibida</option>
          <option value="INSPECCION_AGENDADA">Inspección</option>
          <option value="ACTA_LEVANTADA">Acta</option>
          <option value="CITATORIO_DEJADO">Citatorio</option>
          <option value="AUDIENCIA_AGENDADA">Audiencia</option>
          <option value="RESUELTA">Resuelta</option>
        </select>

        <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)}>
          <option value="">Tipo</option>
          <option value="ruido">Ruido</option>
          <option value="aire">Aire</option>
          <option value="agua">Agua</option>
          <option value="suelo">Suelo</option>
          <option value="flora silvestre">Flora silvestre</option>
          <option value="fauna silvestre">Fauna silvestre</option>
        </select>

        <select value={filterMes} onChange={e => setFilterMes(e.target.value)}>
          <option value="">Mes</option>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString("es", { month: "long" })}
            </option>
          ))}
        </select>

        <div className="filtro-label">
          <label>Fecha exacta</label>
          <input type="date" value={filterFecha} onChange={e => setFilterFecha(e.target.value)} />
        </div>

        <div className="filtro-label">
          <label>Rango desde</label>
          <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
        </div>

        <div className="filtro-label rango-con-boton">
          <label>Rango hasta</label>
          <div>
            <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
            <button className="btn-limpiar-mini" onClick={limpiarFiltros}>
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* TABLA */}
      <table>
        <thead>
          <tr>
            <th>Folio de Denuncia</th>
            <th>Fecha de Ingreso</th>
            <th>Típo de Denuncia</th>
            <th>Dirección o Colonia</th>
            <th>Estatus Actual</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {filteredDenuncias.map((d) => (
            <tr key={d.id}>
              <td>{d.id}</td>
              <td>{d.created_at.split(" ")[0]}</td>
              <td>{d.tipo_denuncia}</td>
              <td>{d.direccion}</td>
              <td>
                <span className={`estado estado-${d.estado_procedimiento}`}>
                  {d.estado_procedimiento}
                </span>
              </td>
              <td>
                <button onClick={() => abrirModal(d)}>Gestionar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= MODAL GUBERNAMENTAL ================= */}
      {showModal && selectedDenuncia && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div
            className="modal-content modal-gob"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal-title">EXPEDIENTE DE DENUNCIA</h2>
            <p className="modal-subtitle">Información completa del reporte ciudadano</p>

            {/* DATOS DEL DENUNCIANTE */}
            <div className="modal-section">
              <h3>Datos del Denunciante</h3>
              <div className="modal-grid">
                <p><b>Nombre:</b> {selectedDenuncia.nombre || "No disponible"}</p>
                <p><b>Teléfono:</b> {selectedDenuncia.telefono || "No disponible"}</p>
                <p><b>Correo:</b> {selectedDenuncia.correo || "No disponible"}</p>
              </div>
            </div>

            {/* DETALLES */}
            <div className="modal-section">
              <h3>Detalles de la Denuncia</h3>
              <div className="modal-grid">
                <p><b>Folio:</b> {selectedDenuncia.id}</p>
                <p><b>Fecha:</b> {selectedDenuncia.created_at}</p>
                <p><b>Anónimo:</b> {selectedDenuncia.anonimo == 1 ? "Sí" : "No"}</p>
                <p><b>Tipo:</b> {selectedDenuncia.tipo_denuncia}</p>
              </div>

              <p><b>Descripción:</b></p>
              <p>{selectedDenuncia.descripcion || "Sin descripción"}</p>

              <p><b>Datos del denunciado:</b></p>
              <p>{selectedDenuncia.datos_denunciante || "No disponible"}</p>
            </div>

            {/* UBICACIÓN */}
            <div className="modal-section">
              <h3>Ubicación de la Denuncia</h3>
              <p><b>Dirección:</b> {selectedDenuncia.direccion}</p>
              <p><b>Coordenadas:</b> {selectedDenuncia.lat || "N/A"}, {selectedDenuncia.lng || "N/A"}</p>

              {selectedDenuncia.lat && selectedDenuncia.lng && (
                <>
                  <button
                    className="btn-maps"
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps?q=${selectedDenuncia.lat},${selectedDenuncia.lng}`,
                        "_blank"
                      )
                    }
                  >
                    Ver en Google Maps
                  </button>

                  <iframe
                    title="Mapa"
                    className="map-frame"
                    src={`https://www.google.com/maps?q=${selectedDenuncia.lat},${selectedDenuncia.lng}&z=15&output=embed`}
                  ></iframe>
                </>
              )}
            </div>

            {/* EVIDENCIAS */}
            <div className="modal-section">
              <h3>Evidencias</h3>

              <div className="evidencias-botones">
                <button
                  className="btn-evidencia"
                  onClick={abrirImagenes}
                  disabled={!imagenes.length}
                >
                  📷 Abrir Evidencias
                </button>

                <button
                  className="btn-evidencia"
                  onClick={abrirVideos}
                  disabled={!videos.length}
                >
                  🎬 Abrir Evidencias
                </button>
              </div>

              {!imagenes.length && !videos.length && (
                <p>No hay evidencias disponibles</p>
              )}
            </div>

            {/* AGENDAR / ACCIONES SEGÚN ESTADO */}
            <div className="modal-section">
              {selectedDenuncia.estado_procedimiento === "RESUELTA" ? (
                <h3>Esta denuncia ya ha sido resuelta</h3>
              ) : (
                <>
                  <h3>
                    {(() => {
                      switch (selectedDenuncia.estado_procedimiento) {
                        case "RECIBIDA": return "Agendar Inspección";
                        case "INSPECCION_AGENDADA": return "Levantar Acta";
                        case "ACTA_LEVANTADA": return "Dejar Citatorio";
                        case "CITATORIO_DEJADO": return "Agendar Audiencia";
                        case "AUDIENCIA_AGENDADA": return "Resolver Denuncia";
                        default: return "";
                      }
                    })()}
                  </h3>

                  {selectedDenuncia.estado_procedimiento === "RECIBIDA" && (
                    <div className="agenda-box">
                      <input type="date" value={fechaInspeccion} onChange={e => setFechaInspeccion(e.target.value)} />
                      <input type="time" value={horaInspeccion} onChange={e => setHoraInspeccion(e.target.value)} />
                      <button onClick={agendarInspeccion}>Agendar inspección</button>
                    </div>
                  )}

                  {selectedDenuncia.estado_procedimiento === "INSPECCION_AGENDADA" && (
                    <button onClick={() => cambiarEstado("ACTA_LEVANTADA")}>Levantar acta</button>
                  )}

                  {selectedDenuncia.estado_procedimiento === "ACTA_LEVANTADA" && (
                    <button onClick={() => cambiarEstado("CITATORIO_DEJADO")}>Dejar citatorio</button>
                  )}

                  {selectedDenuncia.estado_procedimiento === "CITATORIO_DEJADO" && (
                    <button onClick={() => cambiarEstado("AUDIENCIA_AGENDADA")}>Agendar audiencia</button>
                  )}

                  {selectedDenuncia.estado_procedimiento === "AUDIENCIA_AGENDADA" && (
                    <button onClick={() => cambiarEstado("RESUELTA")}>Resolver</button>
                  )}
                </>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-cerrar" onClick={cerrarModal}>Cerrar</button>
            </div>

          </div>

        </div>

      )}

    </div>

  );

}

export default Bandeja;
