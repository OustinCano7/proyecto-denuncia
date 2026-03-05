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

if($conexion->connect_error){
    error_log("Error BD: ".$conexion->connect_error);
    echo json_encode(null);
    exit;
}

$conexion->set_charset("utf8mb4");

$folio = $_GET["folio"] ?? "";

if(empty($folio)){
    echo json_encode(null);
    exit;
}

/* 🔐 CONSULTA SEGURA (PREPARED STATEMENT) */
$stmt = $conexion->prepare("
    SELECT 
        id,
        tipo_denuncia,
        descripcion,
        estado_procedimiento,
        created_at
    FROM denuncias
    WHERE id = ?
");

$stmt->bind_param("i", $folio);
$stmt->execute();

$result = $stmt->get_result();

if($row = $result->fetch_assoc()){
    echo json_encode($row, JSON_UNESCAPED_UNICODE);
}else{
    echo json_encode(null);
}

$stmt->close();
$conexion->close();
exit;

?>