import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!usuario || !password) {
      alert("Todos los campos son obligatorios");
      return;
    }

    try {
      const res = await fetch("http://localhost/proyecto-denuncia/backend/login.php", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({ usuario, clave: password }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem(
          "usuario",
          JSON.stringify({
            usuario: data.usuario.usuario,
            rol: data.usuario.rol,
          })
        );
        navigate("/panel");
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
      <form className="login-box" onSubmit={handleLogin}>
        <h2>Iniciar Sesión</h2>

        <input
          type="text"
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Ingresar</button>

        <p>
          ¿No tienes cuenta?
          <Link to="/registro" style={{ marginLeft: "5px" }}>
            Regístrate aquí
          </Link>
        </p>
      </form>
    </div>
  );
}
