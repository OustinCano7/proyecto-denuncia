import React, { useState, useEffect } from "react";
import ModalNotificaciones from "./ModalNotificaciones";

const Navbar = () => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [denuncias, setDenuncias] = useState([]);

  useEffect(() => {
    fetch("http://localhost/backend/api/denuncias.php")
      .then(res => res.json())
      .then(data => setDenuncias(data))
      .catch(err => console.log(err));
  }, []);

  return (
    <nav className="navbar">
      
      {/* BOTÓN CAMPANITA */}
      <button 
        className="btn-notificacion"
        onClick={() => setMostrarModal(true)}
      >
        🔔
      </button>

      <ModalNotificaciones
        mostrar={mostrarModal}
        cerrar={() => setMostrarModal(false)}
        denuncias={denuncias}
      />
    </nav>
  );
};

export default Navbar;