import { useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./DenunciaForm.css";

// Barra superior
function Barra() {
    return (
        <div className="barra-container">
            <div className="barra-left">
                <img src="images.png/logo.jfif" alt="Logo" className="barra-logo" />
                <div className="barra-texto">Ayuntamiento de Ixtapaluca</div>
            </div>
            <Link to="/panel-operativo" className="barra-boton">Consulta tu Denuncia</Link>
        </div>
    );
}

// Configuración de icono Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Selector de ubicación
function LocationPicker({ position, setPosition }) {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });
    return position ? <Marker position={position} /> : null;
}

// Formulario principal
export default function DenunciaForm() {
    const [anonima, setAnonima] = useState(false);
    const [position, setPosition] = useState([19.4326, -99.1332]);
    const [direccion, setDireccion] = useState("");
    const [fotos, setFotos] = useState([]);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState(""); // Mensaje en pantalla
    const [mensajeError, setMensajeError] = useState(""); // Mensaje de error

    const sendForm = async (e) => {
        e.preventDefault();
        setMensaje("");
        setMensajeError("");

        const nombre = e.target.nombre_completo.value.trim();
        const telefono = e.target.telefono.value.trim();
        const correo = e.target.correo.value.trim();
        const tipo = e.target.tipo_denuncia.value;
        const descripcion = e.target.descripcion.value.trim();
        const datos_involucrados = e.target.datos_involucrados.value.trim();

        if (!tipo || !descripcion || !correo) {
            setMensajeError("Tipo, descripción y correo son obligatorios.");
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("anonima", anonima ? 1 : 0);
            formData.append("nombre_completo", nombre);
            formData.append("telefono", telefono);
            formData.append("correo", correo);
            formData.append("tipo_denuncia", tipo);
            formData.append("descripcion", descripcion);
            formData.append("datos_involucrados", datos_involucrados);
            formData.append("latitud", position[0]);
            formData.append("longitud", position[1]);
            formData.append("direccion", direccion);

            // Validación extra de seguridad
            if (fotos.length > 5) {
                setMensajeError("Máximo 5 imágenes permitidas.");
                setLoading(false);
                return;
            }

            if (videos.length > 2) {
                setMensajeError("Máximo 2 videos permitidos.");
                setLoading(false);
                return;
            }

            fotos.forEach(f => formData.append("evidencias[]", f));
            videos.forEach(v => formData.append("evidencias[]", v));

            const resp = await fetch(
                "http://127.0.0.1/proyecto-denuncia/backend/api/submit_denuncia.php",
                {
                    method: "POST",
                    body: formData,
                    mode: "cors",
                    credentials: "include",
                }
            );

            if (!resp.ok) {
                throw new Error(`HTTP error ${resp.status}`);
            }

            let data;
            try {
                data = await resp.json();
            } catch (jsonErr) {
                console.error("Error al parsear JSON:", jsonErr);
                setMensajeError("Error: respuesta del servidor inválida.");
                return;
            }

            if (data.success) {
                setMensaje(
                    `Denuncia enviada correctamente. ID: ${data.id} ` +
                    (data.correo_enviado ? "✅ Correo enviado" : "⚠ Correo NO enviado")
                );
                e.target.reset();
                setFotos([]);
                setVideos([]);
                setPosition([19.4326, -99.1332]);
                setDireccion("");
                setAnonima(false);
            } else {
                setMensajeError("Error: " + (data.error || "No se pudo enviar la denuncia"));
            }

        } catch (err) {
            console.error("Error al enviar el formulario:", err);
            setMensajeError(
                "Error al enviar el formulario. Puede ser un problema de conexión o del servidor."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Barra />
            <form className="form-container" onSubmit={sendForm}>
                <h1>Formulario de Denuncia</h1>
                <p>Describe la situación y ubícala en el mapa. Toda la información será confidencial.</p>

                {mensaje && <div className="mensaje-exito">{mensaje}</div>}
                {mensajeError && <div className="mensaje-error">{mensajeError}</div>}

                <label className="checkbox-container">
                    <input type="checkbox" onChange={(e) => setAnonima(e.target.checked)} />
                    <span>Deseo que mi denuncia sea anónima.</span>
                </label>

                <h2>Datos del Denunciante</h2>
                <label>Nombre Completo:</label>
                <input type="text" name="nombre_completo" />
                <label>Teléfono de Contacto:</label>
                <input type="text" name="telefono" />
                <label>Correo Electrónico:</label>
                <input type="email" name="correo" />

                <h2>Detalles de la Denuncia</h2>
                <label>Tipo de Denuncia:</label>
                <select name="tipo_denuncia">
                    <option value="">-- Selecciona --</option>
                    <option value="Suelo">Suelo</option>
                    <option value="Aire">Aire</option>
                    <option value="Agua">Agua</option>
                    <option value="Ruido">Ruido</option>
                    <option value="Flora Silvestre">Flora Silvestre</option>
                    <option value="Fauna Silvestre">Fauna Silvestre</option>
                </select>
                <label>Descripción Detallada:</label>
                <textarea name="descripcion"></textarea>
                <label>Datos del Denunciado:</label>
                <textarea name="datos_involucrados"></textarea>

                <h2>Ubicación del Incidente</h2>
                <p>Haz clic en el mapa para seleccionar la ubicación:</p>
                <div className="map-container">
                    <MapContainer center={position} zoom={13} scrollWheelZoom style={{ height: "350px" }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <LocationPicker position={position} setPosition={setPosition} />
                    </MapContainer>
                </div>
                <label>Dirección / Referencia:</label>
                <input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} />

                <h2>Evidencias</h2>
                <label>Adjuntar fotos (máximo 5):</label>
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                        const archivos = Array.from(e.target.files);

                        if (fotos.length + archivos.length > 5) {
                            setMensajeError("Solo puedes adjuntar máximo 5 imágenes.");
                            e.target.value = null;
                            return;
                        }

                            setFotos(prev => [...prev, ...archivos]);
                            e.target.value = null; // Permite volver a seleccionar
                    }}
                />
                {fotos.length > 0 && (
                    <div style={{ marginTop: "10px" }}>
                        <strong>Imágenes seleccionadas:</strong>
                        <ul>
                            {fotos.map((f, i) => (
                                <li key={i}>{f.name}</li>
                            ))}
                        </ul>
                    </div>
                )}
                <label>Adjuntar videos (máximo 2):</label>
                <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={(e) => {
                        const archivos = Array.from(e.target.files);

                        if (videos.length + archivos.length > 2) {
                            setMensajeError("Solo puedes adjuntar máximo 2 videos.");
                            e.target.value = null;
                            return;
                        }

                            setVideos(prev => [...prev, ...archivos]);
                            e.target.value = null;
                    }}
                />
                {videos.length > 0 && (
                    <div style={{ marginTop: "10px" }}>
                        <strong>Videos seleccionados:</strong>
                        <ul>
                            {videos.map((v, i) => (
                                <li key={i}>{v.name}</li>
                            ))}
                        </ul>
                    </div>
                )}
                <button type="submit" className="btn-enviar" disabled={loading}>
                    {loading ? "Enviando..." : "Enviar Denuncia"}
                </button>
            </form>
        </>
    );
}
