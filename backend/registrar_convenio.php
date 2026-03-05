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
if (!isset($pdo)) {
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
$resultado   = trim($data['resultado_audiencia'] ?? '');
$convenio    = trim($data['convenio'] ?? '');

if ($denuncia_id <= 0 || empty($resultado)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Datos incompletos"]);
    exit;
}

try {

    // 🔹 Insertar resultado
    $stmt = $pdo->prepare(
        "INSERT INTO audiencias_resultados (denuncia_id, resultado, convenio) 
         VALUES (?, ?, ?)"
    );

    if (!$stmt) {
        throw new Exception("Error en prepare INSERT");
    }

    $stmt->execute([$denuncia_id, $resultado, $convenio]);

    // 🔹 Actualizar estado
    $update = $pdo->prepare(
        "UPDATE denuncias 
         SET estado_procedimiento='RESUELTA' 
         WHERE id=?"
    );

    if ($update) {
        $update->execute([$denuncia_id]);
    }

    echo json_encode([
        "success" => true,
        "estado_procedimiento" => "RESUELTA"
    ]);

} catch (Exception $e) {

    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error interno"
    ]);
}