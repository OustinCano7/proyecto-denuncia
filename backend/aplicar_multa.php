<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Método no permitido"
    ]);
    exit;
}

require "conexion.php";

if ($conexion->connect_error) {
    echo json_encode([
        "success" => false,
        "message" => "Error de conexión"
    ]);
    exit;
}

// Leer JSON
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode([
        "success" => false,
        "message" => "JSON inválido"
    ]);
    exit;
}

// 🔐 Sanitización segura
$denuncia_id = filter_var($data['denuncia_id'] ?? 0, FILTER_VALIDATE_INT);
$monto = filter_var($data['monto'] ?? 0, FILTER_VALIDATE_FLOAT);
$descripcion = trim($data['descripcion'] ?? '');

if ($denuncia_id > 0 && $monto > 0) {

    $stmt = $conexion->prepare(
        "INSERT INTO multas (denuncia_id, monto, descripcion) VALUES (?,?,?)"
    );

    if (!$stmt) {
        echo json_encode([
            "success" => false,
            "message" => "Error en prepare"
        ]);
        exit;
    }

    $stmt->bind_param("ids", $denuncia_id, $monto, $descripcion);

    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Error al insertar"
        ]);
    }

    $stmt->close();

} else {
    echo json_encode([
        "success" => false,
        "message" => "Datos inválidos"
    ]);
}

$conexion->close();
exit;
?>