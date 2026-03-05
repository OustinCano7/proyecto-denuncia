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

date_default_timezone_set('America/Mexico_City');

$conexion = new mysqli("localhost", "root", "", "denuncias_db");

if ($conexion->connect_error) {
    error_log("Error BD: " . $conexion->connect_error);
    echo json_encode([]);
    exit;
}

$conexion->set_charset("utf8mb4");

$sql = "SELECT 
            id,
            denuncia_id,
            fecha AS fecha_inspeccion,
            hora AS hora_inspeccion,
            estado_procedimiento,
            created_at
        FROM inspecciones
        ORDER BY created_at DESC";

$resultado = $conexion->query($sql);

$inspecciones = [];

if ($resultado) {
    while ($row = $resultado->fetch_assoc()) {

        if (empty($row['estado_procedimiento'])) {
            $row['estado_procedimiento'] = "INSPECCION_AGENDADA";
        }

        $inspecciones[] = $row;
    }
}

echo json_encode($inspecciones, JSON_UNESCAPED_UNICODE);

$conexion->close();
exit;
?>