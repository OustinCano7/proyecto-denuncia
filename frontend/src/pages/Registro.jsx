import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import fondo from "../assets/fondo-registro.jpg"; // 👈 IMPORTAR IMAGEN

export default function Registro() {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [rol, setRol] = useState("usuario");
  const [mensajeError, setMensajeError] = useState("");
  const navigate = useNavigate();

  const handleRegistro = async (e) => {
    e.preventDefault();
    setMensajeError("");

    if (!usuario || !clave || !rol) {
      setMensajeError("Todos los campos son obligatorios");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost/proyecto-denuncia/backend/registro.php",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json; charset=UTF-8",
          },
          body: JSON.stringify({ usuario, clave, rol }),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Cuenta creada exitosamente");
        navigate("/");
      } else {
        setMensajeError(data.message || "No se pudo crear la cuenta");
      }
    } catch (e) {
      console.error("Fetch error:", e);
      setMensajeError("Error de conexión con el servidor");
    }
  };

  return (
    <div
      className="login-container"
      style={{ backgroundImage: `url(${fondo})` }} // 👈 IMAGEN AQUÍ
    >
      <div className="login-bg-overlay"></div>

      <form className="login-box" onSubmit={handleRegistro}>
        <h2>Crear Nueva Cuenta</h2>

        {mensajeError && (
          <div className="mensaje-error">{mensajeError}</div>
        )}

        <input
          type="text"
          placeholder="Nuevo usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Nueva contraseña"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          required
        />

        <select
          value={rol}
          onChange={(e) => setRol(e.target.value)}
          required
        >
          <option value="usuario">Usuario</option>
          <option value="administrador">Administrador</option>
        </select>

        <button type="submit">Registrarme</button>

        <p className="registro-texto">
          ¿Ya tienes cuenta?
          <Link to="/"> Inicia sesión aquí</Link>
        </p>
      </form>
    </div>
  );
}