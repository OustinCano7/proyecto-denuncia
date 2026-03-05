import { useEffect, useState } from "react";
import "./Reporte.css";

function Reporte(){

const [reportes,setReportes]=useState([]);
const [showBuscar,setShowBuscar]=useState(false);
const [showCrear,setShowCrear]=useState(false);
const [showVista,setShowVista]=useState(false);
const [selectedReporte,setSelectedReporte]=useState(null);
const [folio,setFolio]=useState("");
const [errorFolio,setErrorFolio]=useState("");

const [filtros,setFiltros]=useState({
id:"",
folio:"",
fechaExacta:"",
mes:"",
estado:"",
desde:"",
hasta:""
});

useEffect(()=>{
cargarReportes();

const handleEsc=(e)=>{
if(e.key==="Escape"){
setShowBuscar(false);
setShowVista(false);
setShowCrear(false); // 🔥 FALTABA ESTE
}
};

window.addEventListener("keydown",handleEsc);
return()=>window.removeEventListener("keydown",handleEsc);

},[]);

const cargarReportes=async()=>{
try{
const res=await fetch("http://localhost/proyecto-denuncia/backend/get_reportes.php");
if(!res.ok) throw new Error("Error HTTP");
const data=await res.json();
setReportes(Array.isArray(data)?data:[]);
}catch(err){console.error(err);}
};

const limpiarFiltros=()=>{
setFiltros({
id:"",
folio:"",
fechaExacta:"",
mes:"",
estado:"",
desde:"",
hasta:""
});
};

const cerrarModal=(setter)=>setter(false);

const buscarFolio = async () => {

  if (!folio.trim()) {
    setErrorFolio("Ingrese un folio válido");
    return;
  }

  try {
    const res = await fetch(
      `http://localhost/proyecto-denuncia/backend/get_denuncia_folio.php?folio=${folio}`
    );

    if (!res.ok) throw new Error("Error HTTP");

    const data = await res.json();

    if (!data || data.error) {
      setErrorFolio("No existe esa denuncia");
      return;
    }

    setErrorFolio("");
    setShowBuscar(false);
    setShowCrear(true);

  } catch (err) {
    console.error(err);
    setErrorFolio("Error conectando con servidor");
  }
};

const abrirVista=(rep)=>{
setSelectedReporte(rep);
setShowVista(true);
};

const formatearTexto = (texto) => {
if(!texto) return "Sin información";
return texto
.toLowerCase()
.replace(/_/g, " ")
.replace(/\b\w/g, l => l.toUpperCase());
};

const formatearClase = (texto) => {
  if (!texto) return "sin-info";
  return texto
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-");
};

const formatearFecha = (fecha) => {
  if (!fecha) return "Sin fecha";

  const partes = fecha.substring(0, 10).split("-");
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

const filtrados = reportes
.filter(r => {

  console.log("Objeto completo:", r);
  console.log("Fecha real:", r.fecha);

  const fechaReporte = r.fecha
    ? r.fecha.substring(0, 10)
    : "";

  if (filtros.id && String(r.id) !== filtros.id) return false;

  if (filtros.folio && String(r.folio) !== filtros.folio) return false;

  if (filtros.estado && r.estado_reporte !== filtros.estado) return false;

  // ✅ Fecha exacta corregida
  if (filtros.fechaExacta && fechaReporte !== filtros.fechaExacta)
    return false;

  // ✅ Filtro por mes corregido
  if (filtros.mes && !fechaReporte.startsWith(filtros.mes))
    return false;

  // ✅ Rango desde
  if (filtros.desde && fechaReporte < filtros.desde)
    return false;

  // ✅ Rango hasta
  if (filtros.hasta && fechaReporte > filtros.hasta)
    return false;

  return true;
})
.sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));

const ultimosSiete = filtrados.slice(0,7);

const actualizarEstado = async (nuevoEstado) => {
  if (!selectedReporte) return;

  try {
    const res = await fetch(
      "http://localhost/proyecto-denuncia/backend/actualizar_estado_reporte.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedReporte.id,
          estado: nuevoEstado,
        }),
      }
    );

    const data = await res.json();

    if (data.success) {

      setSelectedReporte({
        ...selectedReporte,
        estado_reporte: nuevoEstado, // ✅ CORREGIDO
      });

      setReportes((prev) =>
        prev.map((rep) =>
          rep.id === selectedReporte.id
            ? { ...rep, estado_reporte: nuevoEstado } // ✅ CORREGIDO
            : rep
        )
      );

    } else {
      alert("No se pudo actualizar el estado");
    }
  } catch (error) {
    console.error(error);
    alert("Error conectando con servidor");
  }
};

function ModalCrearReporte({ folio, onClose, onGuardado }) {

  const [reporte, setReporte] = useState({
    folio: folio,
    acciones: "",
    conclusiones: "",
    responsable: "",
    estado: "Abierto",
    fecha: new Date().toISOString().split("T")[0]
  });

  const guardarReporte = async () => {
    try {
      const res = await fetch(
        "http://localhost/proyecto-denuncia/backend/guardar_reporte.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reporte)
        }
      );

      const data = await res.json();

      if (data.error) {
        alert("Error: " + data.error);
        return;
      }

      alert("✅ Reporte guardado correctamente");
      onGuardado();
      onClose();

    } catch (err) {
      alert("❌ Error de conexión");
    }
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>

        <textarea
          placeholder="Acciones"
          onChange={e => setReporte({ ...reporte, acciones: e.target.value })}
        />

        <textarea
          placeholder="Conclusiones"
          onChange={e => setReporte({ ...reporte, conclusiones: e.target.value })}
        />

        <input
          placeholder="Responsable"
          onChange={e => setReporte({ ...reporte, responsable: e.target.value })}
        />

        <select
          onChange={e => setReporte({ ...reporte, estado: e.target.value })}
        >
          <option>Abierto</option>
          <option>En Proceso</option>
          <option>Cerrado</option>
        </select>

        <button onClick={guardarReporte}>
          Guardar Reporte
        </button>

      </div>
    </div>
  );
}

return(
<div className="reporte-container">

{/* 🔹 MODAL BUSCAR */}
{showBuscar && (
  <div className="modal-bg" onClick={() => cerrarModal(setShowBuscar)}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>

      <div className="modal-body">

        <div className="modal-row">
          <label>Folio de la denuncia</label>
          <input
            type="number"
            placeholder="Ingrese folio"
            value={folio}
            onChange={(e) => setFolio(e.target.value)}
          />
        </div>

        {errorFolio && (
          <p className="error">{errorFolio}</p>
        )}

        <div style={{ textAlign: "right", marginTop: "10px" }}>
          <button className="btn-generar" onClick={buscarFolio}>
            Continuar
          </button>
        </div>

      </div>

    </div>
  </div>
)}

<h2>Filtros de Reportes</h2>

<div className="filtros-top">
  <div className="filtro-item">
    <label>ID Reporte</label>
    <input type="text" value={filtros.id}
      onChange={e=>setFiltros({...filtros,id:e.target.value})}/>
  </div>

  <div className="filtro-item">
    <label>Folio</label>
    <input type="text" value={filtros.folio}
      onChange={e=>setFiltros({...filtros,folio:e.target.value})}/>
  </div>

  <div className="filtro-item">
    <label>Fecha Exacta</label>
    <input type="date" value={filtros.fechaExacta}
      onChange={e=>setFiltros({...filtros,fechaExacta:e.target.value})}/>
  </div>

  <div className="filtro-item">
    <label>Mes</label>
    <input type="month" value={filtros.mes}
      onChange={e=>setFiltros({...filtros,mes:e.target.value})}/>
  </div>
</div>

<div className="filtros-bottom">

  <div className="filtro-item">
    <label>Estado del Reporte</label>
    <select value={filtros.estado}
      onChange={e=>setFiltros({...filtros,estado:e.target.value})}>
      <option value="">Seleccionar</option>
      <option>Abierto</option>
      <option>En Proceso</option>
      <option>Cerrado</option>
    </select>
  </div>

  <div className="filtro-item">
    <label>Desde</label>
    <input type="date" value={filtros.desde}
      onChange={e=>setFiltros({...filtros,desde:e.target.value})}/>
  </div>

  <div className="filtro-item">
    <label>Hasta</label>
    <input type="date" value={filtros.hasta}
      onChange={e=>setFiltros({...filtros,hasta:e.target.value})}/>
  </div>

  <div className="filtros-botones">
    <button className="btn-limpiar" onClick={limpiarFiltros}>
      🧹 Limpiar
    </button>

    <button className="btn-generar"
      onClick={()=>{
        setFolio("");
        setErrorFolio("");
        setShowBuscar(true);
      }}>
      ➕ Generar reporte
    </button>
  </div>
</div>

<h2>Tabla de Reportes</h2>

<div className="tabla-scroll">
<table>
<thead>
<tr>
<th>ID de Reporte</th>
<th>Folio</th>
<th>Estatus de Denuncia</th>
<th>Fecha</th>
<th>Estado de Reporte</th>
<th>Acción</th>
</tr>
</thead>

<tbody>
{filtrados.slice(0, 13).map((r)=>(
<tr key={r.id}>
<td>{r.id}</td>
<td>{r.folio}</td>

<td>
<span className={`badge badge-denuncia badge-${formatearClase(r.estatus_denuncia)}`}>
{formatearTexto(r.estatus_denuncia)}
</span>
</td>

<td>{formatearFecha(r.fecha)}</td>

<td>
<span className={`badge badge-reporte badge-${formatearClase(r.estado_reporte)}`}>
{r.estado_reporte || "Sin información"}
</span>
</td>

<td>
<button className="btn-ver" onClick={()=>abrirVista(r)}>
Gestionar
</button>
</td>
</tr>
))}
</tbody>
</table>
</div>

{showVista && selectedReporte && (
<div className="modal-bg" onClick={()=>cerrarModal(setShowVista)}>
<div className="modal large" onClick={e=>e.stopPropagation()}>

<div className="modal-body">

<div className="modal-row">
<label>ID del reporte</label>
<span>{selectedReporte.id}</span>
</div>

<div className="modal-row">
<label>Folio</label>
<span>{selectedReporte.folio}</span>
</div>

<div className="modal-row">
<label>Estatus denuncia</label>
<span className={`badge badge-denuncia badge-${formatearClase(selectedReporte.estatus_denuncia)}`}>
{formatearTexto(selectedReporte.estatus_denuncia)}
</span>
</div>

<div className="modal-row">
<label>Estado del reporte</label>
<span className={`badge badge-reporte badge-${formatearClase(selectedReporte.estado_reporte)}`}>
{selectedReporte.estado_reporte || "Sin información"}
</span>
</div>

<div className="modal-row">
<label>Fecha</label>
<span>{formatearFecha(selectedReporte.fecha)}</span>
</div>

<div className="modal-row">
<label>Acciones realizadas</label>
<span>{selectedReporte.acciones || "Sin información"}</span>
</div>

<div className="modal-row">
<label>Conclusiones</label>
<span>{selectedReporte.conclusiones || "Sin información"}</span>
</div>

<div className="modal-row">
<label>Responsable</label>
<span>{selectedReporte.responsable || "Sin información"}</span>
</div>

</div>

<div className="estado-botones">
<button className="btn-estado abierto"
onClick={() => actualizarEstado("Abierto")}>
Marcar Abierto
</button>

<button className="btn-estado proceso"
onClick={() => actualizarEstado("En Proceso")}>
En Proceso
</button>

<button className="btn-estado cerrado"
onClick={() => actualizarEstado("Cerrado")}>
Cerrar Reporte
</button>
</div>

</div>
</div>
)}

{showCrear && (
  <ModalCrearReporte
    folio={folio}
    onClose={() => setShowCrear(false)}
    onGuardado={cargarReportes}
  />
)}

</div>
);
}

export default Reporte;