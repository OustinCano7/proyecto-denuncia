<?php
// ==========================
// submit_denuncia.php
// ==========================

// Registrar errores en un archivo log
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

// Permitir CORS desde React (ajusta tu dominio)
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

// Conexión a base de datos
$host = 'localhost';
$db   = 'denuncias_db';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (Exception $e) {
    error_log($e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Error al conectar a la base de datos']);
    exit;
}

// Capturar datos POST
$anonima = isset($_POST['anonima']) ? intval($_POST['anonima']) : 0;
$nombre  = $_POST['nombre_completo'] ?? '';
$telefono= $_POST['telefono'] ?? '';
$correo  = $_POST['correo'] ?? '';
$tipo    = $_POST['tipo_denuncia'] ?? '';
$descripcion = $_POST['descripcion'] ?? '';
$datos_denunciante = $_POST['datos_involucrados'] ?? '';
$lat     = $_POST['latitud'] ?? '';
$lng     = $_POST['longitud'] ?? '';
$direccion = $_POST['direccion'] ?? '';
$created_at = date('Y-m-d H:i:s');
$estatus = 'Pendiente';

// Insertar en base de datos
try {
    $stmt = $pdo->prepare("INSERT INTO denuncias 
        (anonimo, nombre, telefono, correo, tipo_denuncia, descripcion, datos_denunciante, lat, lng, direccion, created_at, estatus)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $stmt->execute([
        $anonima,
        $nombre,
        $telefono,
        $correo,
        $tipo,
        $descripcion,
        $datos_denunciante,
        $lat,
        $lng,
        $direccion,
        $created_at,
        $estatus
    ]);

    $lastId = $pdo->lastInsertId();

} catch (Exception $e) {
    error_log($e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Error al guardar la denuncia en la base de datos']);
    exit;
}

// ==========================
// Envío de correo (opcional)
// ==========================
$correo_enviado = false;

require_once '../PHPMailer/src/Exception.php';
require_once '../PHPMailer/src/PHPMailer.php';
require_once '../PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

try {
    $mail = new PHPMailer(true);
    // Configuración básica de PHPMailer
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'azkurth@gmail.com';
    $mail->Password   = 'bnqi wcvv hnfx kods';
    $mail->SMTPSecure = 'tls';
    $mail->Port       = 587;

    $mail->setFrom('tu-correo@dominio.com', 'Denuncias');
    $mail->addAddress($correo);

    $mail->Subject = 'Confirmación de Denuncia';
    $mail->Body    = "Tu denuncia ha sido recibida. ID: $lastId";

    $mail->send();
    $correo_enviado = true;

} catch (Exception $e) {
    error_log("Error enviando correo: " . $mail->ErrorInfo);
}

// Retornar JSON
echo json_encode([
    'success' => true,
    'id' => $lastId,
    'correo_enviado' => $correo_enviado
]);
