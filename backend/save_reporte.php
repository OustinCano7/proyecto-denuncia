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

$cn = new mysqli("localhost", "root", "", "denuncias_db");

if ($cn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error de conexión"]);
    exit;
}

$cn->set_charset("utf8mb4");

// Leer JSON
$d = json_decode(file_get_contents("php://input"), true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "JSON inválido"]);
    exit;
}

// Validación mínima
$denuncia_id     = intval($d['denuncia_id'] ?? 0);
$folio           = $d['folio'] ?? '';
$estatus         = $d['estatus_denuncia'] ?? '';
$acciones        = $d['acciones'] ?? '';
$conclusiones    = $d['conclusiones'] ?? '';
$responsable     = $d['responsable'] ?? '';
$estado_reporte  = $d['estado_reporte'] ?? '';
$fecha           = $d['fecha'] ?? date("Y-m-d");

if ($denuncia_id <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Denuncia inválida"]);
    exit;
}

try {

    // 🔐 QUERY SEGURA CON PREPARE
    $stmt = $cn->prepare("
        INSERT INTO reportes_denuncia
        (denuncia_id, folio, estatus_denuncia, acciones, conclusiones, responsable, estado_reporte, fecha)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->bind_param(
        "isssssss",
        $denuncia_id,
        $folio,
        $estatus,
        $acciones,
        $conclusiones,
        $responsable,
        $estado_reporte,
        $fecha
    );

    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        throw new Exception("Error al insertar");
    }

    $stmt->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error interno"
    ]);
}

$cn->close();
?>