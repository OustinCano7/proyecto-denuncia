<?php
// 🔐 CORS seguro (solo React)
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// 🔥 Manejo de preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 🔥 Solo permitir GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método no permitido"]);
    exit();
}

$conexion = new mysqli("localhost", "root", "", "denuncias_db");
$conexion->set_charset("utf8mb4");

if ($conexion->connect_error) {
    echo json_encode([]);
    exit;
}

$result = $conexion->query("SELECT * FROM inspecciones ORDER BY id DESC");

$inspecciones = [];

while ($row = $result->fetch_assoc()) {
    $inspecciones[] = $row;
}

echo json_encode($inspecciones);

$conexion->close();
?>