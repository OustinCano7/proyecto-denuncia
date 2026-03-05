<?php

// 🔐 NO mostrar errores en producción
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(0);

// 🔐 Headers seguros
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

if (!$conexion) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Conexión a la base de datos fallida"
    ]);
    exit;
}

$conexion->set_charset("utf8mb4");

// 🔐 Leer JSON
$inputJSON = file_get_contents("php://input");
$input = json_decode($inputJSON, true);

// ❌ Eliminar debug.json (era riesgo de seguridad)
// file_put_contents("debug.json", $inputJSON);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "JSON inválido"
    ]);
    exit;
}

// Validar datos
$denuncia_id = intval($input['id'] ?? 0);
$fecha_inspeccion = $input['fecha_inspeccion'] ?? null;

if ($denuncia_id <= 0 || !$fecha_inspeccion) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Faltan datos"
    ]);
    exit;
}

try {

    // 🔐 Consulta segura
    $stmt = $conexion->prepare("
        SELECT id, estado_procedimiento 
        FROM denuncias 
        WHERE id = ?
    ");

    $stmt->bind_param("i", $denuncia_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $denuncia = $result->fetch_assoc();

    if (!$denuncia) {
        echo json_encode([
            "success" => false,
            "message" => "Denuncia no encontrada"
        ]);
        exit;
    }

    echo json_encode([
        "success" => true,
        "message" => "JSON recibido correctamente",
        "denuncia_actual" => $denuncia
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error interno"
    ]);
}

$conexion->close();
?>