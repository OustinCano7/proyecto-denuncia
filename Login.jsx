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
      const res = await fetch(
        "http://localhost/proyecto-denuncia/backend/login.php",
        {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ usuario, clave: password }),
        }
      );

      // 🔹 Verificamos si la respuesta es JSON válido
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Respuesta no JSON:", text);
        alert("Error de conexión con el servidor: respuesta inválida");
        return;
      }

      if (data.success) {
        // 🔹 Guardamos correctamente en localStorage
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
        alert(data.message || "Usuario o contraseña incorrecta");
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
