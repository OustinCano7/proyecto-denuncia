<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// 🔐 Manejo de preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(["success" => true]);
    exit;
}

// 🔐 Solo permitir POST
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

if (!$data || !isset($data['denuncia_id'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Datos incompletos"]);
    exit;
}

$denuncia_id = intval($data['denuncia_id']);

if ($denuncia_id <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "ID inválido"]);
    exit;
}

// =======================
// INSERTAR CITATORIO
// =======================
$stmt = $conexion->prepare(
    "INSERT INTO citatorios (denuncia_id, fecha) VALUES (?, NOW())"
);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al preparar consulta"]);
    exit;
}

$stmt->bind_param("i", $denuncia_id);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al insertar citatorio"]);
    exit;
}

// =======================
// ACTUALIZAR ESTATUS
// =======================
$update = $conexion->prepare(
    "UPDATE denuncias SET estatus='EN PROCESO' WHERE id=?"
);

if ($update) {
    $update->bind_param("i", $denuncia_id);
    $update->execute();
}

echo json_encode(["success" => true]);

$conexion->close();