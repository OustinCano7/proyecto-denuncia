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

$conexion = new mysqli("localhost", "root", "", "denuncias_db");

if ($conexion->connect_error) {
    error_log("Error BD: " . $conexion->connect_error);
    echo json_encode([]);
    exit;
}

$conexion->set_charset("utf8mb4");

/* 🔐 Consulta segura */
$query = "SELECT * FROM denuncias ORDER BY id DESC";
$stmt = $conexion->prepare($query);

if (!$stmt) {
    echo json_encode([]);
    exit;
}

$stmt->execute();
$result = $stmt->get_result();

$denuncias = [];

while ($row = $result->fetch_assoc()) {
    $denuncias[] = $row;
}

echo json_encode($denuncias, JSON_UNESCAPED_UNICODE);

$stmt->close();
$conexion->close();
exit;

?>