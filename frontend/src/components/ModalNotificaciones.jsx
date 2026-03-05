import React from "react";

const ModalNotificaciones = ({ mostrar, cerrar, denuncias }) => {
  if (!mostrar) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-contenido">
        <h3>Notificaciones</h3>

        <table>
          <thead>
            <tr>
              <th>Folio</th>
              <th>Fecha</th>
              <th>Hora</th>
            </tr>
          </thead>
          <tbody>
            {denuncias.map((d, index) => (
              <tr key={index}>
                <td>{d.folio}</td>
                <td>{d.fecha}</td>
                <td>{d.hora}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={cerrar}>Cerrar</button>
      </div>
    </div>
  );
};

export default ModalNotificaciones;