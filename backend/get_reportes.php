<?php

// 🔐 CORS restringido (solo React)
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
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

// 🔥 Zona horaria correcta
date_default_timezone_set('America/Mexico_City');

// 🔹 Conexión
$conexion = new mysqli("localhost", "root", "", "denuncias_db");

// 🔹 Verificar conexión
if ($conexion->connect_error) {
    error_log("Error BD: " . $conexion->connect_error);
    echo json_encode([
        "success" => false,
        "message" => "Error de conexión a la base de datos"
    ]);
    exit;
}

// 🔐 Charset seguro
$conexion->set_charset("utf8mb4");

$sql = "SELECT 
            r.id,
            r.folio,
            d.estado_procedimiento AS estatus_denuncia,
            r.acciones,
            r.conclusiones,
            r.responsable,
            r.estado_reporte,
            DATE(r.fecha) AS fecha
        FROM reportes_denuncia r
        INNER JOIN denuncias d ON r.folio = d.id
        ORDER BY r.id DESC";

$resultado = $conexion->query($sql);

if (!$resultado) {
    error_log("Error SQL: " . $conexion->error);
    echo json_encode([
        "success" => false,
        "message" => "Error en la consulta"
    ]);
    exit;
}

$datos = [];

while ($fila = $resultado->fetch_assoc()) {
    $datos[] = $fila;
}

echo json_encode($datos, JSON_UNESCAPED_UNICODE);

$conexion->close();
exit;
?>