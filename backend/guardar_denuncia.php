<?php
// 🔐 CORS seguro (solo tu frontend)
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
    echo json_encode(["success" => false, "message" => "Método no permitido"]);
    exit();
}

ini_set('display_errors', 0);
error_reporting(E_ALL);

require __DIR__ . "/PHPMailer/src/PHPMailer.php";
require __DIR__ . "/PHPMailer/src/SMTP.php";
require __DIR__ . "/PHPMailer/src/Exception.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// ================= CONEXIÓN =================
$conexion = new mysqli("localhost", "root", "", "denuncias_db");

if ($conexion->connect_error) {
    echo json_encode(["success" => false, "message" => "Error de conexión"]);
    exit;
}

$conexion->set_charset("utf8mb4");

// ================= RECIBIR DATOS =================
$tipo_denuncia = $_POST['tipo_denuncia'] ?? '';
$ubicacion     = $_POST['ubicacion'] ?? '';
$detalle       = $_POST['detalle'] ?? '';

$tipo_denuncia = ucfirst(strtolower($tipo_denuncia));

// 🔐 Generar token seguro
$token = bin2hex(random_bytes(16));

// ================= INSERTAR =================
$stmt = $conexion->prepare("
    INSERT INTO denuncias 
    (tipo_denuncia, ubicacion_incidente, detalle_problema, token) 
    VALUES (?, ?, ?, ?)
");

$stmt->bind_param("ssss", $tipo_denuncia, $ubicacion, $detalle, $token);

$response = [];

if ($stmt->execute()) {

    $id_denuncia = $conexion->insert_id;

    // ================= CREAR CARPETA SEGURA =================
    $uploadDir = __DIR__ . "/uploads/denuncia_" . $id_denuncia . "/";

    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    file_put_contents($uploadDir . "index.html", "");

    // ================= GUARDAR EVIDENCIAS =================
    if (!empty($_FILES['evidencias']['name'][0])) {

        foreach ($_FILES['evidencias']['tmp_name'] as $key => $tmp_name) {

            if ($_FILES['evidencias']['error'][$key] !== UPLOAD_ERR_OK) {
                continue;
            }

            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $mime = $finfo->file($tmp_name);

            $mimePermitidos = [
                'image/jpeg',
                'image/png',
                'video/mp4'
            ];

            if (!in_array($mime, $mimePermitidos)) {
                continue;
            }

            $extension = pathinfo($_FILES['evidencias']['name'][$key], PATHINFO_EXTENSION);
            $nombreArchivo = time() . "_" . $key . "." . $extension;

            $rutaFisica = $uploadDir . $nombreArchivo;

            if (move_uploaded_file($tmp_name, $rutaFisica)) {

                $rutaGuardarBD = "uploads/denuncia_" . $id_denuncia . "/" . $nombreArchivo;

                $stmtEvidencia = $conexion->prepare("
                    INSERT INTO evidencias (denuncia_id, file_path) 
                    VALUES (?, ?)
                ");

                $stmtEvidencia->bind_param("is", $id_denuncia, $rutaGuardarBD);
                $stmtEvidencia->execute();
                $stmtEvidencia->close();
            }
        }
    }

    // ================= ENVIAR CORREO =================
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host       = "smtp.gmail.com";
        $mail->SMTPAuth   = true;
        $mail->Username   = getenv("MAIL_USER");
        $mail->Password   = getenv("MAIL_PASS");
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        $mail->setFrom(getenv("MAIL_USER"), "Sistema de Denuncias");
        $mail->addAddress("azkurth@hotmail.com");

        $mail->isHTML(true);
        $mail->Subject = "Denuncia registrada (ID: $id_denuncia)";

        $enlace = "http://localhost/consultar-denuncia.php?id=$id_denuncia&token=$token";

        $mail->Body = "
            <h3>Tu denuncia fue enviada correctamente</h3>
            <b>ID:</b> $id_denuncia <br>
            <b>Tipo:</b> $tipo_denuncia <br>
            <b>Ubicación:</b> $ubicacion <br><br>
            <a href='$enlace'>Consultar mi denuncia</a>
        ";

        $mail->send();

    } catch (Exception $e) {
        error_log($mail->ErrorInfo);
    }

    $response = [
        "success" => true,
        "id" => $id_denuncia
    ];

} else {
    $response = [
        "success" => false,
        "message" => $stmt->error
    ];
}

$stmt->close();
$conexion->close();

echo json_encode($response);