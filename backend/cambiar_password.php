<?php
// Permitir peticiones desde cualquier origen
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

// Conexión a la base de datos
$host = "localhost";
$user = "root";
$pass = "";
$db   = "denuncias_db";

$conn = new mysqli($host, $user, $pass, $db);

// Verificar conexión
if ($conn->connect_error) {
    echo json_encode([
        "success" => false,
        "message" => "Error al conectar con la base de datos: " . $conn->connect_error
    ]);
    exit;
}

// Leer los datos enviados por React
$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input["id"]) || !isset($input["clave"])) {
    echo json_encode([
        "success" => false,
        "message" => "Datos incompletos"
    ]);
    exit;
}

$id = intval($input["id"]);
$nuevaClave = password_hash($input["clave"], PASSWORD_DEFAULT);

// Preparar la consulta
$stmt = $conn->prepare("UPDATE usuarios SET clave = ? WHERE id = ?");
$stmt->bind_param("si", $nuevaClave, $id);

// Ejecutar y enviar respuesta
if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Contraseña actualizada correctamente"
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Error al actualizar contraseña: " . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
