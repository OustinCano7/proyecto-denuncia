import { useState, useEffect } from "react";
import "./Ajustes.css";

const API_URL = "http://localhost/proyecto-denuncia/backend";

function Ajustes() {
  const [usuarios, setUsuarios] = useState([]);
  const [sesiones, setSesiones] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [nuevaClave, setNuevaClave] = useState("");

  // Cargar usuarios
  const cargarUsuarios = async () => {
    try {
      const res = await fetch(`${API_URL}/get_usuarios.php`);
      if (!res.ok) throw new Error(`Error en la respuesta: ${res.status}`);
      const data = await res.json();
      console.log("Usuarios cargados:", data);

      if (data.success === false) {
        alert("Error cargando usuarios: " + data.message);
        setUsuarios([]);
      } else {
        setUsuarios(data);
      }
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      alert("No se pudieron cargar los usuarios. Revisa la ruta del backend y que XAMPP esté corriendo.");
    }
  };

  // Cargar sesiones
  const cargarSesiones = async () => {
    try {
      const res = await fetch(`${API_URL}/get_sesiones.php`);
      if (!res.ok) throw new Error(`Error en la respuesta: ${res.status}`);
      const data = await res.json();
      console.log("Sesiones cargadas:", data);

      if (data.success === false) {
        alert("Error cargando sesiones: " + data.message);
        setSesiones([]);
      } else {
        setSesiones(data);
      }
    } catch (error) {
      console.error("Error cargando sesiones:", error);
      alert("No se pudieron cargar las sesiones. Revisa la ruta del backend y que XAMPP esté corriendo.");
    }
  };

  useEffect(() => {
    cargarUsuarios();
    cargarSesiones();
  }, []);

  // Modal
  const abrirModal = (usuario) => {
    setSelectedUsuario(usuario);
    setNuevaClave("");
    setShowModal(true);
  };

  const cerrarModal = () => {
    setSelectedUsuario(null);
    setShowModal(false);
  };

  const cambiarPassword = async () => {
    if (!nuevaClave) return alert("Ingresa la nueva contraseña");

    try {
      const res = await fetch(`${API_URL}/cambiar_password.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedUsuario.id, nuevaClave }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Contraseña cambiada correctamente");
        cerrarModal();
      } else {
        alert(data.message || "Error cambiando contraseña");
      }
    } catch (error) {
      console.error(error);
      alert("Error al cambiar la contraseña");
    }
  };

  const eliminarUsuario = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;

    try {
      const res = await fetch(`${API_URL}/delete_usuario.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Usuario eliminado correctamente");
        cargarUsuarios();
      } else {
        alert(data.message || "No se pudo eliminar el usuario");
      }
    } catch (error) {
      console.error(error);
      alert("Error eliminando usuario");
    }
  };

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
                    Eliminar
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
            <th>ID</th>
            <th>Usuario</th>
            <th>Fecha / Hora</th>
            <th>IP</th>
          </tr>
        </thead>

        <tbody>
          {sesiones.length === 0 ? (
            <tr>
              <td colSpan="4">No hay sesiones registradas</td>
            </tr>
          ) : (
            sesiones.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.usuario}</td>
                <td>{s.fecha_hora}</td>
                <td>{s.ip}</td>
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
