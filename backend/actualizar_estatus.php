<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

$conexion = new mysqli("localhost", "root", "", "denuncias_db");

if ($conexion->connect_error) {
    echo json_encode([
        "success" => false,
        "message" => "Error al conectar a la BD: " . $conexion->connect_error
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data["id"]) || !isset($data["estatus"])) {
    echo json_encode([
        "success" => false,
        "message" => "Datos incompletos"
    ]);
    exit;
}

$id = intval($data["id"]);
$estatus = $conexion->real_escape_string($data["estatus"]);

$query = "UPDATE denuncias SET estatus='$estatus' WHERE id=$id";

if ($conexion->query($query)) {
    echo json_encode([
        "success" => true,
        "message" => "Estatus actualizado correctamente"
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Error al actualizar: " . $conexion->error
    ]);
}

$conexion->close();
?>
