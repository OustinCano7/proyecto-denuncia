<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");

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

include "conexion.php"; // Conexión PDO

// Validar conexión
if (!isset($pdo)) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error de conexión"]);
    exit;
}

// Leer JSON
$json = file_get_contents("php://input");
$data = json_decode($json, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "JSON inválido"]);
    exit;
}

$usuario = trim($data['usuario'] ?? '');
$clave   = trim($data['clave'] ?? '');
$rol     = trim($data['rol'] ?? 'usuario');

if (!$usuario || !$clave || !$rol) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Todos los campos son obligatorios"]);
    exit;
}

try {

    // Verificar si existe
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE usuario = ?");
    $stmt->execute([$usuario]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(["success" => false, "message" => "El usuario ya existe"]);
        exit;
    }

    // Hash seguro
    $clave_hashed = password_hash($clave, PASSWORD_DEFAULT);

    // Insertar
    $stmt = $pdo->prepare("INSERT INTO usuarios (usuario, clave, rol) VALUES (?, ?, ?)");

    if ($stmt->execute([$usuario, $clave_hashed, $rol])) {
        echo json_encode(["success" => true, "message" => "Usuario registrado correctamente"]);
    } else {
        throw new Exception("Error al registrar usuario");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error interno"
    ]);
}
?>