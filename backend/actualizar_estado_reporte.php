<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:3000"); // Cambia por tu dominio en producción
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("X-Content-Type-Options: nosniff");

// Conexión
$conexion = new mysqli("localhost", "root", "", "denuncias_db");
$conexion->set_charset("utf8mb4");

if ($conexion->connect_error) {
    echo json_encode(["success" => false, "message" => "Error de conexión"]);
    exit;
}

// Leer JSON
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["id"]) || !isset($data["estado"])) {
    echo json_encode(["success" => false, "message" => "Datos incompletos"]);
    exit;
}

$id = intval($data["id"]);
$estado = trim($data["estado"]);

// 🔐 PREPARED STATEMENT (misma funcionalidad, sin inyección)
$stmt = $conexion->prepare("
    UPDATE reportes_denuncia 
    SET estado_reporte = ? 
    WHERE id = ?
");

$stmt->bind_param("si", $estado, $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Estado actualizado correctamente"]);
} else {
    echo json_encode([
        "success" => false, 
        "message" => "Error al actualizar"
    ]);
}

$stmt->close();
$conexion->close();
?>