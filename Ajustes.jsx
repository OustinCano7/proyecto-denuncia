import { useState, useEffect } from "react";
import "./Ajustes.css";

const API_URL = "http://localhost/proyecto-denuncia/backend";

function Ajustes() {
  const [usuarios, setUsuarios] = useState([]);
  const [sesiones, setSesiones] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [nuevaClave, setNuevaClave] = useState("");

  /* ================= FETCH SEGURO ================= */
  const fetchSeguro = async (url, options = {}) => {
    try {
      const res = await fetch(url, options);
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        console.error("Respuesta no JSON:", text);
        return null;
      }
    } catch (e) {
      console.error("Error en fetch:", e);
      return null;
    }
  };

  /* ================= CARGAR USUARIOS ================= */
  const cargarUsuarios = async () => {
    const data = await fetchSeguro(`${API_URL}/get_usuarios.php`);
    if (data) setUsuarios(data);
    else {
      console.error("No se pudieron cargar los usuarios. Revisa el backend.");
      setUsuarios([]);
    }
  };

  /* ================= CARGAR SESIONES ================= */
  const cargarSesiones = async () => {
    const data = await fetchSeguro(`${API_URL}/get_sesiones.php`);
    if (data) setSesiones(data);
    else {
      console.error("No se pudieron cargar las sesiones. Revisa el backend.");
      setSesiones([]);
    }
  };

  useEffect(() => {
    cargarUsuarios();
    cargarSesiones();
  }, []);

  /* ================= MODAL ================= */
  const abrirModal = (usuario) => {
    setSelectedUsuario(usuario);
    setNuevaClave("");
    setShowModal(true);
  };

  const cerrarModal = () => {
    setSelectedUsuario(null);
    setShowModal(false);
  };

  /* ================= CAMBIAR CONTRASEÑA ================= */
  const cambiarPassword = async () => {
    if (!nuevaClave) return alert("Ingresa la nueva contraseña");

    const data = await fetchSeguro(`${API_URL}/cambiar_password.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedUsuario.id,
        clave: nuevaClave // ⚡ Enviamos "clave" para que coincida con la DB
      }),
    });

    if (data?.success) {
      alert("Contraseña cambiada correctamente");
      cerrarModal();
    } else {
      alert(data?.message || "Error al cambiar la contraseña");
    }
  };

  /* ================= ELIMINAR USUARIO ================= */
  const eliminarUsuario = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta cuenta/usuario?")) return;

    const data = await fetchSeguro(`${API_URL}/delete_usuario.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (data?.success) {
      alert("Usuario eliminado correctamente");
      cargarUsuarios();
    } else {
      alert(data?.message || "No se pudo eliminar el usuario");
    }
  };

  /* ================= RENDER ================= */
  return (
    <div className="ajustes-container">
      <h2>Gestión de Usuarios</h2>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>Rol</th>
            <th>Fecha registro</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {usuarios.length === 0 ? (
            <tr>
              <td colSpan="5">No hay usuarios registrados</td>
            </tr>
          ) : (
            usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.usuario}</td>
                <td>{u.rol}</td>
                <td>{u.fecha_registro}</td>
                <td>
                  <button className="btn-action" onClick={() => abrirModal(u)}>
                    Cambiar contraseña
                  </button>
                  <button
                    className="btn-action delete"
                    onClick={() => eliminarUsuario(u.id)}
                  >
                    Eliminar cuenta/usuario
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <h2>Sesiones Iniciadas</h2>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Usuario</th>
            <th>Fecha / Hora</th>
          </tr>
        </thead>

        <tbody>
          {sesiones.length === 0 ? (
            <tr>
              <td colSpan="3">No hay sesiones registradas</td>
            </tr>
          ) : (
            sesiones.map((s, index) => (
              <tr key={s.id}>
                <td>{index + 1}</td>
                <td>{s.usuario}</td>
                <td>{s.fecha_hora}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* MODAL */}
      {showModal && selectedUsuario && (
        <div className="modal">
          <div className="modal-content">
            <h3>
              Cambiar contraseña de <b>{selectedUsuario.usuario}</b>
            </h3>

            <input
              type="password"
              placeholder="Nueva contraseña"
              value={nuevaClave}
              onChange={(e) => setNuevaClave(e.target.value)}
            />

            <div className="modal-buttons">
              <button onClick={cambiarPassword} className="btn-generate">
                Guardar
              </button>
              <button onClick={cerrarModal} className="btn-close">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Ajustes;
