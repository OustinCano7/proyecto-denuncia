import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import fondo from "../assets/fondo-login.jfif"; // 👈 IMPORTAMOS IMAGEN

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMensajeError("");

    if (!usuario || !password) {
      setMensajeError("Todos los campos son obligatorios");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost/proyecto-denuncia/backend/login.php",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ usuario, clave: password }),
        }
      );

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        setMensajeError("Error de conexión con el servidor");
        return;
      }

      if (data.success) {
        localStorage.setItem(
          "usuario",
          JSON.stringify({
            id: data.id,
            usuario: data.usuario,
            rol: data.rol,
          })
        );
        navigate("/panel");
      } else {
        setMensajeError(data.message || "Usuario o contraseña incorrecta");
      }
    } catch (error) {
      setMensajeError("Error de conexión con el servidor");
    }
  };

  return (
    <div
      className="login-container"
      style={{ backgroundImage: `url(${fondo})` }} // 👈 AQUÍ USAMOS LA IMAGEN
    >
      <div className="login-bg-overlay"></div>

      <form className="login-box" onSubmit={handleLogin}>
        <h2>Inicio de Sesión</h2>

        {mensajeError && (
          <div className="mensaje-error">{mensajeError}</div>
        )}

        <input
          type="text"
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        />

        <div className="password-container">
          <input
            type={mostrarPassword ? "text" : "password"}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <span
            className="toggle-password"
            onClick={() => setMostrarPassword(!mostrarPassword)}
          >
            {mostrarPassword ? "👁" : "👁‍🗨"}
          </span>
        </div>

        <button type="submit">Ingresar</button>

        <p className="registro-texto">
          ¿No tienes cuenta?
          <Link to="/registro"> Regístrate aquí</Link>
        </p>
      </form>
    </div>
  );
}