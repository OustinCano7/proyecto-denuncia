<?php
header("Content-Type: application/json; charset=UTF-8");

/* 🔐 CORS más seguro (ajusta a tu dominio en producción) */
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("HTTP/1.1 200 OK");
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Método no permitido"
    ]);
    exit;
}

// Conexión
$conexion = new mysqli("localhost", "root", "", "denuncias_db");

if ($conexion->connect_error) {
    echo json_encode([
        "success" => false,
        "message" => "Error de conexión"
    ]);
    exit;
}

$conexion->set_charset("utf8");

// Obtener JSON
$input = json_decode(file_get_contents("php://input"), true);

if (
    !isset($input['id']) ||
    !isset($input['fecha_inspeccion']) ||
    !isset($input['hora_inspeccion'])
) {
    echo json_encode([
        "success" => false,
        "message" => "Datos incompletos"
    ]);
    exit;
}

// 🔐 Sanitización básica
$id = filter_var($input['id'], FILTER_VALIDATE_INT);
$fecha = trim($input['fecha_inspeccion']);
$hora = trim($input['hora_inspeccion']);

if (!$id) {
    echo json_encode([
        "success" => false,
        "message" => "ID inválido"
    ]);
    exit;
}

// 🔐 Validar formato fecha
$fechaObj = DateTime::createFromFormat('Y-m-d', $fecha);
if (!$fechaObj || $fechaObj->format('Y-m-d') !== $fecha) {
    echo json_encode([
        "success" => false,
        "message" => "Formato de fecha inválido"
    ]);
    exit;
}

// 🔐 Validar formato hora (permite H:i o H:i:s)
$horaValida = false;
$formatoHora1 = DateTime::createFromFormat('H:i', $hora);
$formatoHora2 = DateTime::createFromFormat('H:i:s', $hora);

if (($formatoHora1 && $formatoHora1->format('H:i') === $hora) ||
    ($formatoHora2 && $formatoHora2->format('H:i:s') === $hora)) {
    $horaValida = true;
}

if (!$horaValida) {
    echo json_encode([
        "success" => false,
        "message" => "Formato de hora inválido"
    ]);
    exit;
}

// Insertar inspección
$stmt = $conexion->prepare(
    "INSERT INTO inspecciones (denuncia_id, fecha, hora)
     VALUES (?, ?, ?)"
);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Error en prepare (insert)"
    ]);
    exit;
}

$stmt->bind_param("iss", $id, $fecha, $hora);

if (!$stmt->execute()) {
    echo json_encode([
        "success" => false,
        "message" => "Error al insertar"
    ]);
    $stmt->close();
    exit;
}

$stmt->close();

// Actualizar estado en denuncias
$stmt2 = $conexion->prepare(
    "UPDATE denuncias
     SET estado_procedimiento = 'INSPECCION_AGENDADA',
         fecha_inspeccion = ?
     WHERE id = ?"
);

if (!$stmt2) {
    echo json_encode([
        "success" => false,
        "message" => "Error en prepare (update)"
    ]);
    exit;
}

$stmt2->bind_param("si", $fecha, $id);

if (!$stmt2->execute()) {
    echo json_encode([
        "success" => false,
        "message" => "Error al actualizar denuncia"
    ]);
    $stmt2->close();
    exit;
}

$stmt2->close();

echo json_encode([
    "success" => true,
    "message" => "Inspección agendada correctamente"
]);

$conexion->close();
exit;
?>