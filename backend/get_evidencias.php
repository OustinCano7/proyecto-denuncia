<?php

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

$conexion = new mysqli("localhost","root","","denuncias_db");

if ($conexion->connect_error) {
    error_log("Error BD: " . $conexion->connect_error);
    echo json_encode([]);
    exit;
}

$conexion->set_charset("utf8mb4");

$denuncia_id = isset($_GET["denuncia_id"]) 
    ? intval($_GET["denuncia_id"]) 
    : 0;

$sql = "SELECT id, denuncia_id, file_path, file_type, created_at 
        FROM evidencias 
        WHERE denuncia_id = ?";

$stmt = $conexion->prepare($sql);

if (!$stmt) {
    echo json_encode([]);
    exit;
}

$stmt->bind_param("i", $denuncia_id);
$stmt->execute();

$resultado = $stmt->get_result();

$datos = [];

while ($fila = $resultado->fetch_assoc()) {
    $datos[] = $fila;
}

echo json_encode($datos, JSON_UNESCAPED_UNICODE);

$stmt->close();
$conexion->close();
exit;

?>