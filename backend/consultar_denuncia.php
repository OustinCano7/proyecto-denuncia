<?php
header("Content-Type: text/html; charset=UTF-8");

// 🔐 Ocultar errores en producción
ini_set('display_errors', 0);
error_reporting(0);

$conexion = new mysqli("localhost", "root", "", "denuncias_db");

if ($conexion->connect_error) {
    die("Error de conexión.");
}

$conexion->set_charset("utf8mb4");

// 🔐 Sanitizar parámetros GET
$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
$token = filter_input(INPUT_GET, 'token', FILTER_SANITIZE_STRING);

if (empty($id) || empty($token)) {
    die("Enlace inválido.");
}

$stmt = $conexion->prepare("SELECT * FROM denuncias WHERE id=? AND token=?");

if (!$stmt) {
    die("Error interno.");
}

$stmt->bind_param("is", $id, $token);
$stmt->execute();

$resultado = $stmt->get_result();

if ($resultado && $resultado->num_rows > 0) {

    $denuncia = $resultado->fetch_assoc();

    // 🔐 Escape para evitar XSS
    echo "<h2>Detalle de tu denuncia</h2>";
    echo "<b>ID:</b> " . htmlspecialchars($denuncia['id']) . "<br>";
    echo "<b>Tipo:</b> " . htmlspecialchars($denuncia['tipo_denuncia']) . "<br>";
    echo "<b>Ubicación:</b> " . htmlspecialchars($denuncia['ubicacion_incidente']) . "<br>";
    echo "<b>Detalle:</b> " . htmlspecialchars($denuncia['detalle_problema']) . "<br>";

} else {
    echo "Denuncia no encontrada o enlace inválido.";
}

$stmt->close();
$conexion->close();
?>