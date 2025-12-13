<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include "conexion.php"; // Conexión PDO

$json = file_get_contents("php://input");
$data = json_decode($json, true);

if (!$data) {
    echo json_encode([
        "success" => false,
        "message" => "JSON no recibido correctamente",
        "php_input" => $json,
        "method" => $_SERVER['REQUEST_METHOD'],
        "headers" => getallheaders()
    ]);
    exit;
}

$usuario = trim($data['usuario'] ?? '');
$clave = trim($data['clave'] ?? '');
$rol = trim($data['rol'] ?? 'usuario');

if (!$usuario || !$clave || !$rol) {
    echo json_encode(["success" => false, "message" => "Todos los campos son obligatorios"]);
    exit;
}

$stmt = $pdo->prepare("SELECT id FROM usuarios WHERE usuario = ?");
$stmt->execute([$usuario]);
if ($stmt->rowCount() > 0) {
    echo json_encode(["success" => false, "message" => "El usuario ya existe"]);
    exit;
}

$clave_hashed = password_hash($clave, PASSWORD_DEFAULT);
$stmt = $pdo->prepare("INSERT INTO usuarios (usuario, clave, rol) VALUES (?, ?, ?)");
if ($stmt->execute([$usuario, $clave_hashed, $rol])) {
    echo json_encode(["success" => true, "message" => "Usuario registrado correctamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al registrar usuario"]);
}
?>
