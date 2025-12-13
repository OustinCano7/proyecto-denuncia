<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once "conexion.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id']) || !isset($data['nuevaClave'])) {
    echo json_encode(["success" => false, "message" => "Faltan datos"]);
    exit;
}

$id = $data['id'];
$nuevaClave = password_hash($data['nuevaClave'], PASSWORD_DEFAULT);

try {
    $stmt = $pdo->prepare("UPDATE usuarios SET clave = :clave WHERE id = :id");
    $stmt->execute(['clave' => $nuevaClave, 'id' => $id]);
    echo json_encode(["success" => true]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error al cambiar contraseña: " . $e->getMessage()]);
}
?>
