<?php
// 🔐 CORS seguro (solo React)
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// 🔥 Manejo preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 🔥 Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

// 🔥 Zona horaria México
date_default_timezone_set('America/Mexico_City');

$conexion = new mysqli("localhost","root","","denuncias_db");
$conexion->set_charset("utf8mb4");

if($conexion->connect_error){
    echo json_encode(["error"=>"Error de conexión"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"),true);

if(empty($data)){
    echo json_encode(["error"=>"JSON vacío"]);
    exit;
}

$folio = isset($data["folio"]) ? intval($data["folio"]) : null;
$acciones = trim($data["acciones"] ?? "");
$conclusiones = trim($data["conclusiones"] ?? "");
$responsable = trim($data["responsable"] ?? "");
$estado_reporte = trim($data["estado"] ?? "Abierto");

// 🔥 Validar fecha
$fecha = $data["fecha"] ?? date("Y-m-d");
$fecha = date("Y-m-d", strtotime($fecha));

if(!$folio){
    echo json_encode(["error"=>"Folio requerido"]);
    exit;
}

/* BUSCAR DENUNCIA */
$stmt = $conexion->prepare(
    "SELECT id, estado_procedimiento 
     FROM denuncias 
     WHERE id=?"
);

$stmt->bind_param("i",$folio);
$stmt->execute();
$res = $stmt->get_result();

if(!$fila=$res->fetch_assoc()){
    echo json_encode(["error"=>"No existe la denuncia"]);
    exit;
}

$denuncia_id = $fila["id"];
$estatus_denuncia = $fila["estado_procedimiento"];

/* INSERTAR REPORTE */
$stmt=$conexion->prepare(
"INSERT INTO reportes_denuncia
(denuncia_id,folio,estatus_denuncia,acciones,conclusiones,responsable,estado_reporte,fecha)
VALUES (?,?,?,?,?,?,?,?)"
);

$stmt->bind_param(
"isssssss",
$denuncia_id,
$folio,
$estatus_denuncia,
$acciones,
$conclusiones,
$responsable,
$estado_reporte,
$fecha
);

if($stmt->execute()){
    echo json_encode(["success"=>true]);
}else{
    echo json_encode(["error"=>$stmt->error]);
}

$stmt->close();
$conexion->close();
?>