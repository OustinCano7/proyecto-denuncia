<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

header("Content-Type: application/json; charset=UTF-8");
header("X-Content-Type-Options: nosniff");

// Conexión
$conexion = new mysqli("localhost", "root", "", "denuncias_db");

if ($conexion->connect_error) {
    echo json_encode([
        "success" => false,
        "message" => "Error de conexión"
    ]);
    exit;
}

$conexion->set_charset("utf8mb4");

// Leer JSON
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id']) || !isset($data['estado'])) {
    echo json_encode([
        "success" => false,
        "message" => "Datos incompletos"
    ]);
    exit;
}

$id = intval($data['id']);
$estado = trim($data['estado']);

// ✅ LISTA BLANCA
$estadosPermitidos = [
    "Pendiente",
    "En proceso",
    "Finalizado",
    "Cancelado"
];

if (!in_array($estado, $estadosPermitidos)) {
    echo json_encode([
        "success" => false,
        "message" => "Estado inválido"
    ]);
    exit;
}

// ✅ PREPARED STATEMENT
$stmt = $conexion->prepare("
    UPDATE inspecciones 
    SET estado_procedimiento = ? 
    WHERE id = ?
");

$stmt->bind_param("si", $estado, $id);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Estado actualizado correctamente"
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Error al actualizar"
    ]);
}

$stmt->close();
$conexion->close();
?>