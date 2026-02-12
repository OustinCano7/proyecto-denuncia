import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Registro() {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [rol, setRol] = useState("usuario");
  const navigate = useNavigate();

  const handleRegistro = async (e) => {
    e.preventDefault();

    if (!usuario || !clave || !rol) {
      alert("Todos los campos son obligatorios");
      return;
    }

    try {
      const res = await fetch("http://localhost/proyecto-denuncia/backend/registro.php", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({ usuario, clave, rol }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Cuenta creada exitosamente");
        navigate("/");
      } else {
        alert(data.message);
      }
    } catch (e) {
      console.error("Fetch error:", e);
      alert("Error de conexión con el servidor");
    }
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleRegistro}>
        <h2>Crear Cuenta</h2>

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

        <select value={rol} onChange={(e) => setRol(e.target.value)} required>
          <option value="usuario">Usuario</option>
          <option value="administrador">Administrador</option>
        </select>

        <button type="submit">Registrarme</button>
      </form>
    </div>
  );
}
