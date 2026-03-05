<?php
// 🔐 CORS seguro (solo React)
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// 🔥 Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 🔥 Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método no permitido"]);
    exit();
}

require "conexion.php";

// Verificar conexión si usas mysqli en conexion.php
if (isset($pdo) && !$pdo) {
    echo json_encode(["success" => false, "message" => "Error de conexión"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$denuncia_id = intval($data['denuncia_id'] ?? 0);

if ($denuncia_id <= 0) {
    echo json_encode(["success" => false, "message" => "ID inválido"]);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO actas (denuncia_id, fecha) VALUES (?, NOW())");
    $stmt->execute([$denuncia_id]);

    $update = $pdo->prepare("UPDATE denuncias SET estado_procedimiento='ACTA_LEVANTADA' WHERE id=?");
    $update->execute([$denuncia_id]);

    echo json_encode([
        "success" => true,
        "estado_procedimiento" => "ACTA_LEVANTADA"
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error interno"
    ]);
}