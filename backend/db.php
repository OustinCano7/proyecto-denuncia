<?php

// 🔐 Datos de conexión
$host = 'localhost';
$db   = 'denuncias_db';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
    PDO::ATTR_PERSISTENT         => false, // 🔐 evita conexiones persistentes
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);

} catch (PDOException $e) {

    // 🔐 No mostrar errores reales al usuario
    error_log("Error de conexión BD: " . $e->getMessage());

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Error interno de conexión"
    ]);

    exit;
}