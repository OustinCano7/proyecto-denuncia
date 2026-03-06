<?php
// ==========================
// submit_denuncia.php
// ==========================

// Configuración de errores
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

// CORS para React
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");
header("X-XSS-Protection: 1; mode=block");

header("Referrer-Policy: no-referrer");
header("Content-Security-Policy: default-src 'self'");

$esLocalhost = $_SERVER['SERVER_NAME'] === 'localhost' || $_SERVER['SERVER_NAME'] === '127.0.0.1';

if (!$esLocalhost) {
    if (
        (!isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] !== 'on') &&
        (!isset($_SERVER['HTTP_X_FORWARDED_PROTO']) || $_SERVER['HTTP_X_FORWARDED_PROTO'] !== 'https')
    ) {
        echo json_encode(['success'=>false,'error'=>'Conexión insegura']);
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// ==========================
// CONEXIÓN A BASE DE DATOS
// ==========================
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
    echo json_encode(['success' => false, 'error' => 'Error de conexión a BD']);
    exit;
}

// ==========================
// CAPTURAR DATOS
// ==========================
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

// ==========================
// VALIDACIÓN DE DATOS
// ==========================

$nombre = trim($nombre);
$descripcion = trim($descripcion);
$datos_denunciante = trim($datos_denunciante);
$direccion = trim($direccion);

if (strlen($descripcion) > 2000) {
    echo json_encode(['success'=>false,'error'=>'Descripción demasiado larga']);
    exit;
}

if (strlen($nombre) > 100) {
    echo json_encode(['success'=>false,'error'=>'Nombre demasiado largo']);
    exit;
}

if (!$anonima && empty($nombre)) {
    echo json_encode(['success'=>false,'error'=>'El nombre es obligatorio si no es anónima']);
    exit;
}

if (!empty($correo)) {
    $correo = filter_var($correo, FILTER_VALIDATE_EMAIL);
    if (!$correo) {
        echo json_encode(['success'=>false,'error'=>'Correo inválido']);
        exit;
    }
}

$telefono = preg_replace('/[^0-9]/', '', $telefono);

if (strlen($descripcion) < 10) {
    echo json_encode(['success'=>false,'error'=>'La descripción es demasiado corta']);
    exit;
}

// Validar tipo de denuncia (lista blanca)
$tiposPermitidos = ['Ruido','Aire','Agua','Suelo','Flora Silvestre','Fauna Silvestre'];

if (!in_array($tipo, $tiposPermitidos)) {
    echo json_encode(['success'=>false,'error'=>'Tipo de denuncia inválido']);
    exit;
}

// Validar coordenadas si vienen
if (!empty($lat) && !is_numeric($lat)) {
    echo json_encode(['success'=>false,'error'=>'Latitud inválida']);
    exit;
}

if (!empty($lng) && !is_numeric($lng)) {
    echo json_encode(['success'=>false,'error'=>'Longitud inválida']);
    exit;
}

if (!empty($lat) && ($lat < -90 || $lat > 90)) {
    echo json_encode(['success'=>false,'error'=>'Latitud fuera de rango']);
    exit;
}

if (!empty($lng) && ($lng < -180 || $lng > 180)) {
    echo json_encode(['success'=>false,'error'=>'Longitud fuera de rango']);
    exit;
}

// ==========================
// CONTROL BÁSICO ANTI-SPAM
// ==========================
if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    $ip = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
} else {
    $ip = $_SERVER['REMOTE_ADDR'];
}

$stmtSpam = $pdo->prepare("
    SELECT COUNT(*) as total 
    FROM denuncias 
    WHERE ip = ? 
    AND created_at >= (NOW() - INTERVAL 2 MINUTE)
");
$stmtSpam->execute([$ip]);
$resultSpam = $stmtSpam->fetch();

if ($resultSpam['total'] > 3) {
    echo json_encode(['success'=>false,'error'=>'Demasiadas denuncias desde esta IP. Intente más tarde.']);
    exit;
}

// Forzar coordenadas a tipo float real
$lat = !empty($lat) ? floatval($lat) : null;
$lng = !empty($lng) ? floatval($lng) : null;

// ==========================
// INSERTAR DENUNCIA
// ==========================
try {
    $stmt = $pdo->prepare("
        INSERT INTO denuncias 
        (anonimo, nombre, telefono, correo, tipo_denuncia, descripcion, datos_denunciante, lat, lng, direccion, created_at, estatus, ip)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

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
        $estatus,
        $ip
    ]);

    $lastId = $pdo->lastInsertId();

} catch (Exception $e) {
    error_log($e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Error al guardar denuncia']);
    exit;
}

// ==========================
// GUARDAR EVIDENCIAS
// ==========================
if (!empty($_FILES['evidencias']['name'][0])) {

    $totalSize = array_sum($_FILES['evidencias']['size']);
    $maxTotal = 30 * 1024 * 1024; // 30MB total

    if ($totalSize > $maxTotal) {
        echo json_encode(['success'=>false,'error'=>'Tamaño total de archivos excedido']);
        exit;
    }

    $maxImagenes = 5;
    $maxVideos = 2;
    $imagenes = 0;
    $videos = 0;

    $uploadDir = __DIR__ . "/uploads/denuncia_" . $lastId . "/";

    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
        chmod($uploadDir, 0755);
    }

    // Evitar listado de archivos
    file_put_contents($uploadDir . "index.html", "");

    foreach ($_FILES['evidencias']['tmp_name'] as $key => $tmp_name) {

        if ($_FILES['evidencias']['error'][$key] === UPLOAD_ERR_OK) {

            $maxSize = 10 * 1024 * 1024; // 10MB

            if ($_FILES['evidencias']['size'][$key] > $maxSize) {
                continue; // Ignora archivos demasiado grandes
            }

            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $tipoMime = $finfo->file($tmp_name);

            // Validar tipo
            $mimePermitidos = [
                'image/jpeg',
                'image/png',
                'video/mp4',
                'video/quicktime'
            ];

            if (!in_array($tipoMime, $mimePermitidos)) {
                continue;
            }

            if (str_starts_with($tipoMime, 'image/')) {
                if ($imagenes >= $maxImagenes) continue;
                $tipoArchivoBD = 'imagen';
                $imagenes++;
            } else {
                if ($videos >= $maxVideos) continue;
                $tipoArchivoBD = 'video';
                $videos++;
            }

            $nombreOriginal = basename($_FILES['evidencias']['name'][$key]);
            $nombreOriginal = preg_replace('/[^a-zA-Z0-9._-]/', '', $nombreOriginal);
            $extension = strtolower(pathinfo($nombreOriginal, PATHINFO_EXTENSION));

            $extPermitidas = ['jpg','jpeg','png','mp4','mov'];

            if (!in_array($extension, $extPermitidas)) {
                continue; // Extensión no permitida
            }

            $nombreNuevo = uniqid('evi_', true) . "." . $extension;

            $rutaFisica = $uploadDir . $nombreNuevo;

            if (move_uploaded_file($tmp_name, $rutaFisica)) {

                $rutaBD = "uploads/denuncia_" . $lastId . "/" . $nombreNuevo;

                $stmtEvi = $pdo->prepare("
                    INSERT INTO evidencias 
                    (denuncia_id, file_path, file_type, created_at) 
                    VALUES (?, ?, ?, ?)
                ");

                $stmtEvi->execute([
                    $lastId,
                    $rutaBD,
                    $tipoArchivoBD,
                    date('Y-m-d H:i:s')
                ]);
            }
        }
    }
}

// ==========================
// ENVÍO DE CORREO
// ==========================
$correo_enviado = false;

require_once __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

try {
    if (!empty($correo)) {

        $mail = new PHPMailer(true);

        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username = getenv('MAIL_USER');
        $mail->Password = getenv('MAIL_PASS');
        $mail->SMTPSecure = 'tls';
        $mail->Port       = 587;

        $mail->setFrom(getenv('MAIL_USER'), 'Sistema de Denuncias');
        $mail->addAddress($correo);

        $mail->Subject = "Confirmación de Denuncia #$lastId";
        $mail->Body    = "Tu denuncia fue registrada correctamente.\n\nID: $lastId\n\nGracias por tu reporte.";

        $mail->send();
        $correo_enviado = true;
    }

} catch (Exception $e) {
    error_log("Error enviando correo: " . $mail->ErrorInfo);
}

// ==========================
// RESPUESTA FINAL
// ==========================
echo json_encode([
    'success' => true,
    'id' => $lastId,
    'correo_enviado' => $correo_enviado
]);