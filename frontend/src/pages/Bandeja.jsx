import { useEffect, useState } from "react";
import "./Bandeja.css";

function Bandeja() {
  const [denuncias, setDenuncias] = useState([]);
  const [filteredDenuncias, setFilteredDenuncias] = useState([]);
  const [selectedDenuncia, setSelectedDenuncia] = useState(null);
  const [evidencias, setEvidencias] = useState([]);
  const [inspecciones, setInspecciones] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [loadingId, setLoadingId] = useState(null);

  const [showModalInspeccion, setShowModalInspeccion] = useState(false);
  const [selectedInspeccion, setSelectedInspeccion] = useState(null);

  /* 🔹 FILTROS */
  const [filterFolio, setFilterFolio] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterMes, setFilterMes] = useState("");
  const [filterFecha, setFilterFecha] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [filterUbicacion, setFilterUbicacion] = useState("");

  /* 🔵 FILTROS INSPECCIONES (INDEPENDIENTES) */
  const [filterInsFolio, setFilterInsFolio] = useState("");
  const [filterInsEstado, setFilterInsEstado] = useState("");
  const [filterInsFecha, setFilterInsFecha] = useState("");
  const [filterInsMes, setFilterInsMes] = useState("");
  const [insFechaInicio, setInsFechaInicio] = useState("");
  const [insFechaFin, setInsFechaFin] = useState("");
  const [insHoraInicio, setInsHoraInicio] = useState("");
  const [insHoraFin, setInsHoraFin] = useState("");

  const [fechaInspeccion, setFechaInspeccion] = useState("");
  const [horaInspeccion, setHoraInspeccion] = useState("");

  const [totalDenunciasFiltradas, setTotalDenunciasFiltradas] = useState(0);

  /* 🔥 SOPORTE UNIVERSAL PARA ARCHIVOS DE CELULAR */
  const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|jfif|heic|heif|bmp|tiff)$/i;
  const VIDEO_EXT = /\.(mp4|mov|avi|mkv|webm|3gp|m4v)$/i;

  /* 🔹 CARRUSEL IMÁGENES */
  const [imgIndex, setImgIndex] = useState(0);

  const [visorAbierto, setVisorAbierto] = useState(false);
  const [archivoIndex, setArchivoIndex] = useState(0);

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

  /* 🔵 UBICACIONES MUNICIPIO IXTAPALUCA */
  const ubicacionesIxtapaluca = [
    "18 de agosto",
    "20 de mayo",
    "20 de noviembre",
    "acozac",
    "aculco (estación forestal zoquiapan)",
    "alfredo del mazo",
    "ampl emiliano zapata",
    "ampl escalerilla",
    "ampl la cañada",
    "ampl morelos",
    "ampl santo tomas",
    "ampliación san francisco",
    "ampliacion santa barbara",
    "antonio soberanes",
    "aquiles cordoba",
    "arbolada",
    "ayotla",
    "bezana canutillo",
    "cabaña de los medina",
    "camino a mina milagro (el potrero)",
    "camino mina rosita",
    "cerro de la abundancia",
    "cerro del tejolote",
    "chililico",
    "citlalmina conjunto hab park",
    "coatepec",
    "colinas de escalerillas",
    "colonia julio chávez lópez (uprez)",
    "colonia tetitla",
    "ejido el capulín",
    "ejido san francisco (las joyas)",
    "ejidos de xalpa (camino de los alcanfores)",
    "el calvario",
    "el campamento (las cocinas)",
    "el capulin",
    "el caracol",
    "el carmen",
    "el contadero",
    "el corazón",
    "el cuarenta",
    "el jaral (el capulín)",
    "el mirador",
    "el molino",
    "el nopalito",
    "el patronato del maguey (santa rosa)",
    "el pozo del venado",
    "el puente",
    "el treinta y nueve (dos jagüeyes)",
    "el treinta y siete (kilómetro diecinueve)",
    "el zapote (lomas de ayola)",
    "elsa cordova moran",
    "emiliano zapata",
    "escalerillas",
    "estado de mexico",
    "fermin alvarez",
    "filemon alvarez",
    "fracc geovillas de san jacinto",
    "fracc la capilla i",
    "fracc la capilla ii",
    "fracc la capilla iii",
    "fracc la capilla iv",
    "fracc los heroes",
    "fracc rancho de guadalupe",
    "fracc res park",
    "general manuel ávila camacho",
    "geovillas de ayotla",
    "hornos de san juan",
    "hornos de zoquiapan",
    "hornos santa barbara",
    "huertas de canutillo",
    "ilhuicamina",
    "independencia",
    "ixtapaluca",
    "ixtapaluca centro",
    "ixtapaluca izcalli",
    "jesus maria",
    "jorge jiménez cantú",
    "jose de la mora",
    "la cañada",
    "la cantera",
    "la era",
    "la espinita (parque industrial la espinita)",
    "la granja",
    "la guadalupana",
    "la huerta",
    "la magdalena",
    "la mesa",
    "la retama",
    "la venta",
    "linda vista",
    "linderos de ixtapaluca (el tablón)",
    "llano grande (rancho viejo)",
    "loma bonita",
    "loma del rayo (chocolines segunda sección)",
    "lomas de coatepec",
    "los cedros",
    "los hornos",
    "los lavaderos",
    "los pinos",
    "los vergeles",
    "luis donaldo colosio",
    "margarita moran",
    "melchor ocampo 1ra secc",
    "melchor ocampo 2da secc",
    "melchor ocampo 3ra secc",
    "mirto",
    "nueva independencia (morelos)",
    "paraje la loma de guerrero",
    "piedra grande (las cabañas)",
    "piedras grandes",
    "plutarco elias calles",
    "plutarco elias calles chocolines",
    "pueblo nuevo",
    "pueblo nuevo (san isidro labrador)",
    "pueblo san juan tlalpizahuac",
    "puente del tablón",
    "puente el mezquite",
    "rancho el carmen",
    "rancho el guarda",
    "rancho el tezoyo",
    "rancho francisco santillán (atzizintla tres)",
    "rancho la pastoría",
    "rancho la peña",
    "rancho loma ancha",
    "rancho los gavilanes",
    "rancho san isidro",
    "rancho venta nueva",
    "rancho verde",
    "rancho verde i y ii",
    "río frío de juárez",
    "res ayotla",
    "reubicados",
    "ricardo calva",
    "rigoberta menchu",
    "rincon del bosque",
    "rosa de castilla",
    "san antonio tlalpizahuac",
    "san buenaventura",
    "san francisco acuautla",
    "san jerónimo cuatro vientos (san jerónimo)",
    "san jeronimo cuatro vientos",
    "san juan",
    "santa ana",
    "santa bárbara",
    "santa cruz tlapacoya",
    "santo tomas",
    "tejalpa",
    "tetitla (coatepec)",
    "tezontle zoquiapan",
    "tierra de uso común ejidales de ayotla",
    "tierras comunales (cerro de ayotla)",
    "tlacaelel",
    "tlapacoya",
    "tlayehuale",
    "unidad hab capilla",
    "unidad hab cuatro vientos",
    "unidad hab geovillas de sta barbara",
    "unidad hab geovillas jesus maria",
    "unidad hab rancho el carmen",
    "unidad hab san jose de la palma",
    "union antorchista",
    "valle verde",
    "villas de escalerillas (bellavista)",
    "wenceslao victoria soto",
    "zoquiapan"
  ];

  /* ================= FETCH SEGURO ================= */
  const fetchSeguro = async (url, options = {}) => {
    const res = await fetch(url, options);

    const text = await res.text();

    console.log("RESPUESTA SERVIDOR:", text); // 🔥 DEBUG REAL

    if (!res.ok) {
      throw new Error(`Error HTTP ${res.status}`);
    }

    if (!text.trim()) {
      throw new Error("Servidor devolvió respuesta vacía");
    }

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(
        "Respuesta inválida del servidor (NO es JSON válido)"
      );
    }
  };

  /* ================= CARGA DENUNCIAS ================= */
  useEffect(() => {
    fetchSeguro(`${API}/get_denuncias.php`)
      .then((respuesta) => {

        const data =
          Array.isArray(respuesta)
            ? respuesta
            : Array.isArray(respuesta?.data)
            ? respuesta.data
            : [];

        setDenuncias(data);
        setFilteredDenuncias(data);

      })
      .catch(() => {
        setDenuncias([]);
        setFilteredDenuncias([]);
      });
  }, []);

  /* ================= CARGA INSPECCIONES ================= */
  useEffect(() => {
    fetchSeguro(`${API}/get_inspecciones.php`)
      .then((data) => {
        const inspeccionesData =
          Array.isArray(data) ? data :
          Array.isArray(data?.data) ? data.data :
          [];

        setInspecciones(inspeccionesData);
      })
      .catch(() => {
        setInspecciones([]);
      });
  }, []);

  /* ================= FILTROS ================= */
  useEffect(() => {
    let temp = [...denuncias];

    if (filterFolio) {
      temp = temp.filter(d =>
        Number(d.id) === Number(filterFolio)
      );
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

    /* 🔵 NORMALIZADOR */
    const normalizar = (texto) =>
      texto
        ?.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

    /* 🔵 FILTRO POR UBICACIÓN */
    if (filterUbicacion) {
      const ubicacionSeleccionada = normalizar(filterUbicacion);

      temp = temp.filter(d => {
        const direccion = normalizar(d.direccion || "");

        return direccion.includes(ubicacionSeleccionada);
      });
   }

    if (fechaInicio && fechaFin) {
      temp = temp.filter(d => {
        const f = d.created_at.split(" ")[0];
        return f >= fechaInicio && f <= fechaFin;
      });
    }

    setTotalDenunciasFiltradas(temp.length);
    setFilteredDenuncias(temp);
  }, [
    filterFolio,
    filterEstado,
    filterTipo,
    filterMes,
    filterFecha,
    filterUbicacion,
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

  const abrirModalInspeccion = async (inspeccion) => {
    try {
      const denunciaCompleta = await fetchSeguro(
        `${API}/get_denuncia_detalle.php?id=${inspeccion.denuncia_id}`
      );

      const denunciaData =
        denunciaCompleta?.data ? denunciaCompleta.data : denunciaCompleta;

      setSelectedDenuncia(denunciaData);
      setSelectedInspeccion(inspeccion);
      setShowModalInspeccion(true);

    } catch (e) {
      console.error(e);
      alert("Error al cargar datos de inspección");
    }
  };

  const cerrarModal = () => {
    setSelectedDenuncia(null);
    setShowModal(false);
    setShowInfo(false);
    setEvidencias([]);
  };

  const cerrarModalInspeccion = () => {
    setShowModalInspeccion(false);
    setSelectedInspeccion(null);
  };

  const actualizarEstadoInspeccion = async (nuevoEstado) => {
    try {

      // 🔥 ACTUALIZAR LA INSPECCIÓN (NO LA DENUNCIA)
      await fetchSeguro(`${API}/actualizar_estado_inspeccion.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedInspeccion.id, // 👈 ID REAL DE LA INSPECCIÓN
          estado: nuevoEstado,
        }),
      });

      // 🔥 ACTUALIZAR EN MEMORIA SIN RECARGAR
      const actualizarLista = (lista) =>
        lista.map(i =>
          i.id === selectedInspeccion.id
            ? { ...i, estado_procedimiento: nuevoEstado }
            : i
        );

      setInspecciones(actualizarLista);

      cerrarModalInspeccion();

    } catch (e) {
      alert(e.message);
    }
  };

  /* ================= CAMBIAR ESTADO ================= */
  const cambiarEstado = async (nuevoEstado) => {
    setLoadingId(selectedDenuncia.id);

    try {
      const payload = {
        id: selectedDenuncia.id,
        estado: nuevoEstado,
      };

      // 🔥 Si se está resolviendo, enviar fecha
      if (nuevoEstado === "RESUELTA") {
        payload.fecha_resolucion = new Date().toISOString();
      }

      await fetchSeguro(`${API}/actualizar_estado.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const respuesta = await fetchSeguro(`${API}/get_denuncias.php`);

      const dataActualizada =
        Array.isArray(respuesta)
          ? respuesta
          : Array.isArray(respuesta?.data)
          ? respuesta.data
          : [];

      setDenuncias(dataActualizada);
      setFilteredDenuncias(dataActualizada);

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
      if (!img.file_path) return;

      const cleanPath = img.file_path.replace(/^\/+/, "");
      const url = `${BASE_URL}/${cleanPath}`
        .replace(/([^:]\/)\/+/g, "$1");

      window.open(encodeURI(url), "_blank", "noopener,noreferrer");
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
      if (!vid.file_path) return;

      const cleanPath = vid.file_path.replace(/^\/+/, "");
      const url = `${BASE_URL}/${cleanPath}`
        .replace(/([^:]\/)\/+/g, "$1");

      window.open(encodeURI(url), "_blank", "noopener,noreferrer");
    });
  };

  /* ================= AGENDAR INSPECCIÓN ================= */
  const agendarInspeccion = async () => {

    console.log("DENUNCIA SELECCIONADA:", selectedDenuncia);
    console.log("ID QUE SE ENVÍA:", selectedDenuncia?.id);

    if (!fechaInspeccion || !horaInspeccion)
      return alert("Selecciona fecha y hora");

    setLoadingId(selectedDenuncia.id);

    try {
      const response = await fetch(`${API}/agendar_inspeccion.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedDenuncia.id,
          fecha_inspeccion: fechaInspeccion,
          hora_inspeccion: horaInspeccion,
        }),
      });

      const data = await response.json();
      console.log("RESPUESTA BACKEND:", data);

      if (!data.success) {
        return alert(data.message || "Error al agendar inspección");
      }

      /* 🔹 ACTUALIZAR ESTADO EN DENUNCIAS */
      setDenuncias((prev) =>
        prev.map((d) =>
          d.id === selectedDenuncia.id
            ? {
                ...d,
                estado_procedimiento: "INSPECCION_AGENDADA",
              }
            : d
        )
      );

      setSelectedDenuncia((prev) =>
        prev
          ? { ...prev, estado_procedimiento: "INSPECCION_AGENDADA" }
          : prev
      );

      /* 🔹 RECARGAR INSPECCIONES DESDE BD (100% SINCRONIZADO) */
      const nuevasInspecciones = await fetchSeguro(`${API}/get_inspecciones.php`);

      const inspeccionesData =
        Array.isArray(nuevasInspecciones) ? nuevasInspecciones :
        Array.isArray(nuevasInspecciones?.data) ? nuevasInspecciones.data :
        [];

      setInspecciones(inspeccionesData);

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
    setFilterUbicacion("");
  };

  const imagenes = evidencias.filter(e =>
    IMAGE_EXT.test(e.file_path || "")
  );

  const videos = evidencias.filter(e =>
    VIDEO_EXT.test(e.file_path || "")
  );

  const archivos = [
    ...imagenes.map(a => ({ ...a, tipo: "imagen" })),
    ...videos.map(a => ({ ...a, tipo: "video" }))
  ];

  const validImgIndex =
    imagenes.length > 0 ? imgIndex % imagenes.length : 0;

  /* 🔵 FORMATEAR FECHA DD/MM/YYYY */
  const formatearFecha = (fecha) => {
    if (!fecha) return "";

    const partes = fecha.split(" ")[0].split("-");
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  };

  /* 🔵 FORMATEAR HORA AM/PM */
  const formatearHora = (hora) => {
    if (!hora) return "";
    const [h, m] = hora.split(":");
    const date = new Date();
    date.setHours(h, m);

    return date.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // 🔹 Últimos 10 registros de denuncias más recientes
  const denunciasOrdenadas = [...filteredDenuncias]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // 🔹 Solo las 7 más recientes de denuncias
  const denunciasRecientes = denunciasOrdenadas.slice(0, 7);

  // 🔹 Filtrar y ordenar inspecciones
  const inspeccionesFiltradas = [...inspecciones]
    .filter((i) => {

      if (filterInsFolio && Number(i.denuncia_id) !== Number(filterInsFolio))
        return false;

      const estadoActual = i.estado_procedimiento;

      if (filterInsEstado && estadoActual !== filterInsEstado)
        return false;

      if (filterInsFecha) {
        const fechaBD = i.fecha_inspeccion?.split(" ")[0];
        if (fechaBD !== filterInsFecha) return false;
      }

      if (filterInsMes) {
        const mesBD = i.fecha_inspeccion.split("-")[1]; // obtiene MM
        if (Number(mesBD) !== Number(filterInsMes)) return false;
      }

      if (insFechaInicio && insFechaFin) {
        const fecha = i.fecha_inspeccion?.split(" ")[0];

        if (fecha < insFechaInicio || fecha > insFechaFin)
          return false;
      }

      if (insHoraInicio && insHoraFin) {
        if (
          i.hora_inspeccion < insHoraInicio ||
          i.hora_inspeccion > insHoraFin
        )
          return false;
      }

      return true;
    })
    .sort((a, b) =>
      new Date(b.fecha_inspeccion) - new Date(a.fecha_inspeccion)
    );

    const totalInspeccionesFiltradas = inspeccionesFiltradas.length;

  // 🔹 Solo las 7 más recientes de inspecciones
  const inspeccionesRecientes = inspeccionesFiltradas.slice(0, 7);

  /* 🔵 FECHA Y HORA ACTUAL */
  const fechaHoraActual = new Date().toLocaleString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const abrirVisor = () => {
    if (archivos.length === 0) {
      alert("No hay evidencias disponibles");
      return;
    }

    setArchivoIndex(0);
    setVisorAbierto(true);
  };

  const siguiente = () => {
    setArchivoIndex((prev) => (prev + 1) % archivos.length);
  };

  const anterior = () => {
    setArchivoIndex((prev) =>
      prev === 0 ? archivos.length - 1 : prev - 1
    );
  };

  /* ================= RENDER ================= */
  return (
    <div className="table-container">

      <div className="denuncias-header">
        <h2>Filtros de Denuncias</h2>

        <button className="btn-limpiar-mini" onClick={limpiarFiltros}>
          Limpiar filtros
        </button>
      </div>

      <div className="filtros-grid">

        {/* FILA 1 */}
        <input
          type="number"
          placeholder="Folio"
          value={filterFolio}
          onChange={e => setFilterFolio(e.target.value)}
        />

        <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
          <option value="">Estado</option>
          <option value="RECIBIDA">Recibida</option>
          <option value="INSPECCION_AGENDADA">Inspección Agendada</option>
          <option value="ACTA_LEVANTADA">Acta Levantada</option>
          <option value="CITATORIO_DEJADO">Citatorio Dejado</option>
          <option value="AUDIENCIA_AGENDADA">Audiencia Agendada</option>
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
              {new Date(0, i).toLocaleString("es-MX", { month: "long" })}
            </option>
          ))}
        </select>

        {/* FILA 2 - UBICACIÓN */}
        <select
          value={filterUbicacion}
          onChange={e => setFilterUbicacion(e.target.value)}
        >
          <option value="">Ubicación (Ixtapaluca)</option>
          {ubicacionesIxtapaluca.map((lugar, index) => (
            <option key={index} value={lugar}>
              {lugar}
            </option>
          ))}
        </select>

        {/* FILA 3 */}
        <div className="filtro-label">
          <label>Fecha exacta</label>
          <input
            type="date"
            value={filterFecha}
            onChange={e => setFilterFecha(e.target.value)}
          />
        </div>

        {/* FILA 4 */}
        <div className="filtro-label">
          <label>Rango desde</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={e => setFechaInicio(e.target.value)}
          />
        </div>

        <div className="filtro-label">
          <label>Rango hasta</label>
          <input
            type="date"
            value={fechaFin}
            onChange={e => setFechaFin(e.target.value)}
          />
        </div>
      </div>
      
      <h2>Denuncias Totales</h2>
      <div className="tabla-scroll-body">
        <table className="tabla-fija">
          <thead>
            <tr>
              <th>Folio de Denuncia</th>
              <th>Fecha de Ingreso</th>
              <th>Tipo de Denuncia</th>
              <th>Dirección o Colonia</th>
              <th>Estatus Actual</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            {denunciasOrdenadas.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                  🚫 No se encontraron resultados
                </td>
              </tr>
            ) : (
              denunciasOrdenadas.map((d) => (
                <tr key={d.id}>
                  <td>{d.id}</td>
                  <td>{formatearFecha(d.created_at)}</td>
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalDenunciasFiltradas > 0 && (
        <p className="total-resultados">
          Total de resultados: {totalDenunciasFiltradas}
        </p>
      )}
      
      <div className="inspecciones-header">
        <h2>Filtros de Inspecciones</h2>

        <button
          className="btn-limpiar-mini"
          onClick={() => {
            setFilterInsFolio("");
            setFilterInsEstado("");
            setFilterInsFecha("");
            setFilterInsMes("");
            setInsFechaInicio("");
            setInsFechaFin("");
            setInsHoraInicio("");
            setInsHoraFin("");
          }}
        >
          Limpiar filtros
        </button>
      </div>

      <div className="filtros-grid">

        <div className="filtro-label">
          <label>Folio de denuncia</label>
          <input
            type="number"
            value={filterInsFolio}
            onChange={e => setFilterInsFolio(e.target.value)}
          />
        </div>

        <div className="filtro-label">
          <label>Estatus de inspección</label>
          <select
            value={filterInsEstado}
            onChange={e => setFilterInsEstado(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="INSPECCION_AGENDADA">Inspección Agendada</option>
            <option value="INSPECCION_PENDIENTE">Inspección Pendiente</option>
            <option value="INSPECCION_COMPLETADA">Inspección Completada</option>
          </select>
        </div>

        <div className="filtro-label">
          <label>Fecha exacta</label>
          <input
            type="date"
            value={filterInsFecha}
            onChange={e => setFilterInsFecha(e.target.value)}
          />
        </div>

        <div className="filtro-label">
          <label>Mes</label>
          <select
            value={filterInsMes}
            onChange={e => setFilterInsMes(e.target.value)}
          >
            <option value="">Todos</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("es-MX", { month: "long" })}
              </option>
            ))}
          </select>
        </div>

        <div className="filtro-label">
          <label>Rango fecha desde</label>
          <input
            type="date"
            value={insFechaInicio}
            onChange={e => setInsFechaInicio(e.target.value)}
          />
        </div>

        <div className="filtro-label">
          <label>Rango fecha hasta</label>
          <input
            type="date"
            value={insFechaFin}
            onChange={e => setInsFechaFin(e.target.value)}
          />
        </div>

        <div className="filtro-label">
          <label>Hora desde</label>
          <input
            type="time"
            value={insHoraInicio}
            onChange={e => setInsHoraInicio(e.target.value)}
          />
        </div>

        <div className="filtro-label">
          <label>Hora hasta</label>
          <input
            type="time"
            value={insHoraFin}
            onChange={e => setInsHoraFin(e.target.value)}
          />
        </div>
      </div>

      <div className="tabla-inspecciones-header">
        <h2>Tabla de Inspecciones</h2>
      </div>

      <div className="tabla-scroll-body">
        <table className="tabla-fija">
          <thead>
            <tr>
              <th>Folio de Denuncia</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Estatus de Inspección</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            {inspeccionesFiltradas.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                  🚫 No se encontraron resultados
                </td>
              </tr>
            ) : (
              inspeccionesFiltradas.map((i) => {

                const estadoActual =
                  i.estado_procedimiento || "INSPECCION_AGENDADA";

                return (
                  <tr key={i.id}>
                    <td>{i.denuncia_id}</td>
                    <td>{formatearFecha(i.fecha_inspeccion)}</td>
                    <td>{formatearHora(i.hora_inspeccion)}</td>
                    <td>
                      <span className={`estado estado-${estadoActual}`}>
                        {estadoActual}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => abrirModalInspeccion(i)}>
                        Gestionar
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalInspeccionesFiltradas > 0 && (
        <p className="total-resultados">
          Total de resultados: {totalInspeccionesFiltradas}
        </p>
      )}

      {/* ================= MODAL GUBERNAMENTAL ================= */}
      {showModal && selectedDenuncia && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div
            className="modal-content modal-gob"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal-title">*EXPEDIENTE DE DENUNCIA*</h2>
            <p className="modal-subtitle">"Información completa de la denuncia ciudadana".</p>

            {/* DATOS DEL DENUNCIANTE */}
            <div className="modal-section">
              <h3>Datos del Denunciante:</h3>
              <div className="modal-grid">
                <p><b>Nombre:</b> {selectedDenuncia.nombre || "No disponible"}</p>
                <p><b>Teléfono:</b> {selectedDenuncia.telefono || "No disponible"}</p>
                <p><b>Correo:</b> {selectedDenuncia.correo || "No disponible"}</p>
              </div>
            </div>

            {/* DETALLES */}
            <div className="modal-section">
              <h3>Detalles de la Denuncia:</h3>
              <div className="modal-grid">
                <p><b>Folio:</b> {selectedDenuncia.id}</p>
                <p><b>Fecha:</b> {selectedDenuncia.created_at}</p>
                <p><b>Anónimo:</b> {selectedDenuncia.anonimo == 1 ? "Sí" : "No"}</p>
                <p><b>Tipo:</b> {selectedDenuncia.tipo_denuncia}</p>
              </div>

              <p><b>Descripción:</b></p>
              <p>{selectedDenuncia.descripcion || "Sin descripción"}</p>

              <p><b>Datos del Denunciado:</b></p>
              <p>{selectedDenuncia.datos_denunciante || "No disponible"}</p>
            </div>

            {/* UBICACIÓN */}
            <div className="modal-section">
              <h3>Ubicación de la Denuncia:</h3>
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
              <h3>Evidencias de Denuncia:</h3>

              <div className="evidencias-botones">
                <button
                  className="btn-evidencia"
                  onClick={abrirVisor}
                  disabled={!archivos.length}
                >
                  📂 Abrir Evidencias
                </button>
              </div>

              {!imagenes.length && !videos.length && (
                <p>No hay evidencias disponibles</p>
              )}
            </div>

            {/* AGENDAR / ACCIONES SEGÚN ESTADO */}
            <div className="modal-section">
              {selectedDenuncia?.estado_procedimiento === "RESUELTA" ? (
                <h3>Esta denuncia ya ha sido resuelta</h3>
              ) : (
                <>
                  <h3>
                    {(() => {
                      switch (selectedDenuncia.estado_procedimiento) {
                        case "RECIBIDA": return "Agendar Inspección:";
                        case "INSPECCION_AGENDADA": return "Levantar Acta:";
                        case "ACTA_LEVANTADA": return "Dejar Citatorio:";
                        case "CITATORIO_DEJADO": return "Agendar Audiencia:";
                        case "AUDIENCIA_AGENDADA": return "Resolver Denuncia:";
                        default: return "";
                      }
                    })()}
                  </h3>

                  {selectedDenuncia?.estado_procedimiento === "RECIBIDA" && (
                    <div className="agenda-box">
                      <input
                        type="date"
                        value={fechaInspeccion}
                        onChange={e => setFechaInspeccion(e.target.value)}
                      />
                      <input
                        type="time"
                        value={horaInspeccion}
                        onChange={e => setHoraInspeccion(e.target.value)}
                      />
                      <button onClick={agendarInspeccion}>
                        Agendar inspección
                      </button>
                    </div>
                  )}

                  {selectedDenuncia.estado_procedimiento === "INSPECCION_AGENDADA" && (
                    <button onClick={() => cambiarEstado("ACTA_LEVANTADA")}>Levantar acta:</button>
                  )}

                  {selectedDenuncia.estado_procedimiento === "ACTA_LEVANTADA" && (
                    <button onClick={() => cambiarEstado("CITATORIO_DEJADO")}>Dejar citatorio</button>
                  )}

                  {selectedDenuncia.estado_procedimiento === "CITATORIO_DEJADO" && (
                    <button onClick={() => cambiarEstado("AUDIENCIA_AGENDADA")}>Agendar audiencia:</button>
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

      {showModalInspeccion && selectedInspeccion && selectedDenuncia && (
        <div className="modal-overlay" onClick={cerrarModalInspeccion}>
          <div
            className="modal-content modal-gob"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>DETALLE DE INSPECCIÓN</h2>

            <div className="modal-section">
              <h3>Datos de Inspección</h3>
              <p><b>Folio:</b> {selectedInspeccion.denuncia_id}</p>
              <p><b>Fecha:</b> {selectedInspeccion.fecha_inspeccion}</p>
              <p><b>Hora:</b> {selectedInspeccion.hora_inspeccion}</p>
            </div>

            <div className="modal-section">
              <h3>Ubicación de la Denuncia</h3>
              <p><b>Dirección:</b> {selectedDenuncia.direccion}</p>
              <p><b>Coordenadas:</b> {selectedDenuncia.lat}, {selectedDenuncia.lng}</p>

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

            <div className="modal-section botones-inspeccion">

              <button
                className="btn-pendiente"
                onClick={() => actualizarEstadoInspeccion("INSPECCION_PENDIENTE")}
              >
                Marcar como PENDIENTE
              </button>

              <button
                className="btn-completar"
                onClick={() => actualizarEstadoInspeccion("INSPECCION_COMPLETADA")}
              >
                Marcar como COMPLETADA
              </button>

              <button
                className="btn-agendada"
                onClick={() => actualizarEstadoInspeccion("INSPECCION_AGENDADA")}
              >
                Volver a AGENDADA
              </button>

            </div>

            <div className="modal-footer">
              <button className="btn-cerrar" onClick={cerrarModalInspeccion}>
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      {visorAbierto && (
        <div className="modal-overlay" onClick={() => setVisorAbierto(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ textAlign: "center" }}
          >

            <h2>Visor de Evidencias</h2>

            {archivos[archivoIndex]?.tipo === "imagen" ? (
              <img
                src={`${BASE_URL}/${archivos[archivoIndex].file_path.replace(/^\/+/, "")}`}
                alt="evidencia"
                style={{ maxWidth: "100%", maxHeight: "500px" }}
              />
            ) : (
              <video
                src={`${BASE_URL}/${archivos[archivoIndex].file_path.replace(/^\/+/, "")}`}
                controls
                style={{ maxWidth: "100%", maxHeight: "500px" }}
              />
            )}

            <div style={{ marginTop: "15px" }}>
              <button onClick={anterior}>⬅</button>
              <button onClick={siguiente}>➡</button>
            </div>

            <button
              style={{ marginTop: "10px" }}
              onClick={() => setVisorAbierto(false)}
            >
              Cerrar
            </button>

          </div>
        </div>
      )}

    </div>

  );

}

export default Bandeja;
