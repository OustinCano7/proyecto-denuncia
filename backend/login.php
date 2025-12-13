<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require "conexion.php"; // Conexión PDO

$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!$data) {
    echo json_encode([
        "success" => false,
        "message" => "JSON no recibido correctamente",
        "php_input" => $input,
        "method" => $_SERVER['REQUEST_METHOD'],
        "headers" => getallheaders()
    ]);
    exit;
}

$usuario = trim($data['usuario'] ?? '');
$clave = trim($data['clave'] ?? '');

if (!$usuario || !$clave) {
    echo json_encode(["success" => false, "message" => "Usuario y contraseña requeridos"]);
    exit;
}

$stmt = $pdo->prepare("SELECT id, usuario, clave, rol, fecha_registro FROM usuarios WHERE usuario = ?");
$stmt->execute([$usuario]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo json_encode(["success" => false, "message" => "Usuario no encontrado"]);
    exit;
}

if (!password_verify($clave, $user['clave'])) {
    echo json_encode(["success" => false, "message" => "Contraseña incorrecta"]);
    exit;
}

echo json_encode([
    "success" => true,
    "usuario" => [
        "id" => $user['id'],
        "usuario" => $user['usuario'],
        "rol" => $user['rol'],
        "fecha_registro" => $user['fecha_registro']
    ]
]);
?>
