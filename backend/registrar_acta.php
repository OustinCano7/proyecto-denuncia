<?php

// No mostrar errores en APIs JSON
error_reporting(0);
ini_set('display_errors', 0);

// 🔐 CORS más seguro (ajusta al dominio real)
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// 🔐 Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'OPTIONS') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método no permitido"]);
    exit;
}

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(["success" => true]);
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
$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (json_last_error() !== JSON_ERROR_NONE) {
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

// =====================
// INSERTAR ACTA (SEGURA)
// =====================
$stmt = $conexion->prepare(
    "INSERT INTO actas (denuncia_id, fecha) VALUES (?, NOW())"
);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al preparar acta"]);
    exit;
}

$stmt->bind_param("i", $denuncia_id);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al registrar acta"]);
    exit;
}

// =====================
// ACTUALIZAR ESTADO
// =====================
$update = $conexion->prepare(
    "UPDATE denuncias 
     SET estado_procedimiento = 'ACTA_LEVANTADA'
     WHERE id = ?"
);

if (!$update) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al preparar actualización"]);
    exit;
}

$update->bind_param("i", $denuncia_id);

if (!$update->execute()) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al actualizar estado"]);
    exit;
}

echo json_encode([
    "success" => true,
    "estado_procedimiento" => "ACTA_LEVANTADA"
]);

$conexion->close();