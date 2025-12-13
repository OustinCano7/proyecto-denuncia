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
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(false);

    const sendForm = async (e) => {
        e.preventDefault();

        const nombre = e.target.nombre_completo.value.trim();
        const telefono = e.target.telefono.value.trim();
        const correo = e.target.correo.value.trim();
        const tipo = e.target.tipo_denuncia.value;
        const descripcion = e.target.descripcion.value.trim();
        const datos_involucrados = e.target.datos_involucrados.value.trim();

        if (!tipo || !descripcion || !correo) {
            alert("Tipo, descripción y correo son obligatorios.");
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

            Array.from(fotos).forEach(f => formData.append("fotos[]", f));
            if (video) formData.append("video", video);

            const resp = await fetch(
                "http://localhost/proyecto-denuncia/backend/api/submit_denuncia.php",
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

            const data = await resp.json();

            if (data.success) {
                alert(
                    `Denuncia enviada correctamente. ID: ${data.id} ` +
                    (data.correo_enviado ? "✅ Correo enviado" : "⚠ Correo NO enviado")
                );
                e.target.reset();
                setFotos([]);
                setVideo(null);
                setPosition([19.4326, -99.1332]);
                setDireccion("");
                setAnonima(false);
            } else {
                alert("Error: " + (data.error || "No se pudo enviar la denuncia"));
            }
        } catch (err) {
            console.error("Error al enviar el formulario:", err);
            alert(
                "Error al enviar el formulario. Puede ser un problema de conexión o CORS. Revisa la consola."
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
                <label>Adjuntar fotos:</label>
                <input type="file" accept="image/*" multiple onChange={(e) => setFotos(e.target.files)} />
                <label>Adjuntar video:</label>
                <input type="file" accept="video/*" onChange={(e) => setVideo(e.target.files[0])} />

                <button type="submit" className="btn-enviar" disabled={loading}>
                    {loading ? "Enviando..." : "Enviar Denuncia"}
                </button>
            </form>
        </>
    );
}
