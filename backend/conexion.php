<?php
header("Content-Type: application/json; charset=UTF-8");

// 🔐 Opcional: ocultar errores en producción
ini_set('display_errors', 0);
error_reporting(0);

$host = "localhost";
$user = "root";
$pass = "";
$db   = "denuncias_db";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error de conexión"
    ]);
    exit;
}

// 🔐 Forzar charset seguro
$conn->set_charset("utf8mb4");
?>