<?php

header("Access-Control-Allow-Origin: http://localhost:3000"); // 🔐 NO usar *
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método no permitido"]);
    exit;
}

require "conexion.php";

$data = json_decode(file_get_contents("php://input"), true);

$denuncia_id = intval($data['denuncia_id'] ?? 0);
$observaciones = $data['observaciones'] ?? "Citatorio dejado automáticamente";

if ($denuncia_id <= 0) {
    echo json_encode(["success" => false, "message" => "ID inválido"]);
    exit;
}

try {

    // 🔐 INSERT seguro (ya estaba bien)
    $stmt = $pdo->prepare("INSERT INTO citatorios (denuncia_id, fecha_citatorio, observaciones) VALUES (?, NOW(), ?)");
    $stmt->execute([$denuncia_id, $observaciones]);

    // 🔐 UPDATE seguro
    $update = $pdo->prepare("UPDATE denuncias SET estado_procedimiento='CITATORIO_DEJADO' WHERE id=?");
    $update->execute([$denuncia_id]);

    echo json_encode([
        "success" => true,
        "estado_procedimiento" => "CITATORIO_DEJADO"
    ]);

} catch (Exception $e) {

    // 🔐 No mostrar error real
    error_log("Error citatorio: " . $e->getMessage());

    echo json_encode([
        "success" => false,
        "message" => "Error interno"
    ]);
}