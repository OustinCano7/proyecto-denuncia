<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// 🔐 Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(["success" => true]);
    exit;
}

// 🔐 Solo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método no permitido"]);
    exit;
}

require "conexion.php";

// Validar conexión
if (!isset($conexion) || $conexion->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error de conexión"]);
    exit;
}

// Leer JSON
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "JSON inválido"]);
    exit;
}

$denuncia_id = intval($data['denuncia_id'] ?? 0);

if ($denuncia_id <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "ID inválido"]);
    exit;
}

try {

    // 🔹 Insertar multa (monto fijo como en tu lógica)
    $stmt = $conexion->prepare(
        "INSERT INTO multas (denuncia_id, monto, fecha) 
         VALUES (?, 1000, NOW())"
    );

    if (!$stmt) {
        throw new Exception("Error en prepare INSERT");
    }

    $stmt->bind_param("i", $denuncia_id);

    if (!$stmt->execute()) {
        throw new Exception("Error al insertar multa");
    }

    // 🔹 Actualizar estado
    $update = $conexion->prepare(
        "UPDATE denuncias 
         SET estatus='RESUELTA' 
         WHERE id=?"
    );

    if ($update) {
        $update->bind_param("i", $denuncia_id);
        $update->execute();
    }

    echo json_encode(["success" => true]);

} catch (Exception $e) {

    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error interno"
    ]);
}

$conexion->close();