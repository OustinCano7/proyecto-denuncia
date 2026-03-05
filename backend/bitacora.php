<?php
function registrarBitacora($conexion, $accion, $modulo, $folio = null) {

    if (!isset($_SESSION['usuario_id'])) {
        return;
    }

    $usuario_id = $_SESSION['usuario_id'];
    $usuario_nombre = $_SESSION['usuario'];
    $rol = $_SESSION['rol'];
    $ip = $_SERVER['REMOTE_ADDR'];

    $stmt = $conexion->prepare("INSERT INTO bitacora 
        (usuario_id, usuario_nombre, rol, accion, modulo, folio, ip) 
        VALUES (?, ?, ?, ?, ?, ?, ?)");

    $stmt->bind_param(
        "issssss",
        $usuario_id,
        $usuario_nombre,
        $rol,
        $accion,
        $modulo,
        $folio,
        $ip
    );

    $stmt->execute();
    $stmt->close();
}
?>