<?php

// 🔐 CORS restringido
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// 🔹 Manejo correcto de preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 🔹 Solo permitir GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        "error" => "Método no permitido"
    ]);
    exit();
}

// 🔹 Conexión segura
$conexion = new mysqli("localhost", "root", "", "denuncias_db");

if ($conexion->connect_error) {
    error_log("Error BD: " . $conexion->connect_error);

    echo json_encode([
        "error" => "Error interno"
    ]);
    exit();
}

$conexion->set_charset("utf8mb4");

// 🔹 Validar ID
if (!isset($_GET['id'])) {
    echo json_encode([
        "error" => "ID no proporcionado"
    ]);
    exit();
}

$id = intval($_GET['id']);

// 🔹 Consulta preparada (ya era segura 👍)
$sql = "SELECT * FROM denuncias WHERE id = ?";
$stmt = $conexion->prepare($sql);

if (!$stmt) {
    echo json_encode([
        "error" => "Error al preparar consulta"
    ]);
    exit();
}

$stmt->bind_param("i", $id);
$stmt->execute();
$resultado = $stmt->get_result();

// 🔹 Respuesta
if ($fila = $resultado->fetch_assoc()) {
    echo json_encode($fila);
} else {
    echo json_encode([
        "error" => "Denuncia no encontrada"
    ]);
}

$stmt->close();
$conexion->close();
exit;
?>