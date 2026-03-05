<?php
// 🔐 Headers CORS seguros (solo tu frontend)
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// 🔥 Manejo de preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 🔥 Solo permitir GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Método no permitido"
    ]);
    exit();
}

require_once __DIR__ . "/conexion.php";

// 🔹 Verificar conexión
if ($conn->connect_error) {
    echo json_encode([
        "success" => false,
        "message" => "Error de conexión a la base de datos"
    ]);
    exit;
}

// 🔐 Charset seguro
$conn->set_charset("utf8mb4");

try {

    $query = "SELECT id, usuario, rol, fecha_registro 
              FROM usuarios 
              ORDER BY id ASC";

    $result = $conn->query($query);

    $usuarios = [];

    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $usuarios[] = $row;
        }
    }

    echo json_encode($usuarios, JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {

    error_log($e->getMessage());

    echo json_encode([
        "success" => false,
        "message" => "Error al cargar usuarios"
    ]);
}

$conn->close();
?>