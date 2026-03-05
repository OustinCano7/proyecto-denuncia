<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

ini_set('display_errors', 0);
error_reporting(0);

// 🔥 Zona horaria México
date_default_timezone_set('America/Mexico_City');

require "conexion.php";

// ✅ Validar conexión correctamente
if ($conn->connect_error) {
    echo json_encode([
        "success" => false,
        "message" => "Error de conexión: " . $conn->connect_error
    ]);
    exit;
}

// ✅ Leer JSON
$input = json_decode(file_get_contents("php://input"), true);

if (!$input || !isset($input['id']) || !isset($input['estado'])) {
    echo json_encode([
        "success" => false,
        "message" => "Datos incompletos"
    ]);
    exit;
}

$id = intval($input['id']);
$estado = $input['estado'];

// ✅ Estados permitidos
$estadosPermitidos = [
    "ACTA_LEVANTADA",
    "CITATORIO_DEJADO",
    "AUDIENCIA_AGENDADA",
    "RESUELTA"
];

if (!in_array($estado, $estadosPermitidos)) {
    echo json_encode([
        "success" => false,
        "message" => "Estado no permitido"
    ]);
    exit;
}

// 🔥 Preparar UPDATE dependiendo del estado
if ($estado === "RESUELTA") {

    $stmt = $conn->prepare(
        "UPDATE denuncias 
         SET estado_procedimiento = ?, 
             fecha_resolucion = NOW() 
         WHERE id = ?"
    );

} else {

    $stmt = $conn->prepare(
        "UPDATE denuncias 
         SET estado_procedimiento = ?, 
             fecha_resolucion = NULL 
         WHERE id = ?"
    );
}

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Error en prepare: " . $conn->error
    ]);
    exit;
}

$stmt->bind_param("si", $estado, $id);

// ✅ Ejecutar
if ($stmt->execute()) {

    if ($stmt->affected_rows > 0) {
        echo json_encode([
            "success" => true,
            "message" => "Estado actualizado correctamente"
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "No se encontró el ID o no hubo cambios"
        ]);
    }

} else {
    echo json_encode([
        "success" => false,
        "message" => $stmt->error
    ]);
}

$stmt->close();
$conn->close();
exit;