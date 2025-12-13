<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

// No mostrar errores en pantalla (evita romper JSON)
ini_set('display_errors', 0);
error_reporting(E_ALL);

// -------------------------------------------
//  IMPORTAR PHPMailer (sin USE todavía)
// -------------------------------------------
require __DIR__ . "/PHPMailer/src/PHPMailer.php";
require __DIR__ . "/PHPMailer/src/SMTP.php";
require __DIR__ . "/PHPMailer/src/Exception.php";

// -------------------------------------------
//  AHORA SÍ: LOS USE 📌 (fuera de funciones y fuera del IF)
// -------------------------------------------
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;


// Conexión a BD
$conexion = new mysqli("localhost", "root", "", "denuncias_db");
if ($conexion->connect_error) {
    echo json_encode(["success" => false, "message" => "Error de conexión"]);
    exit;
}

// Recibir datos
$tipo_denuncia = $_POST['tipo_denuncia'] ?? '';
$ubicacion     = $_POST['ubicacion'] ?? '';
$detalle       = $_POST['detalle'] ?? '';

$tipo_denuncia = ucfirst(strtolower($tipo_denuncia));

// Insertar en BD
$stmt = $conexion->prepare("INSERT INTO denuncias (tipo_denuncia, ubicacion_incidente, detalle_problema) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $tipo_denuncia, $ubicacion, $detalle);

$response = [];

if ($stmt->execute()) {

    $id_denuncia = $conexion->insert_id;

    // -------------------------------------------
    //  ENVIAR CORREO
    // -------------------------------------------
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host       = "smtp.gmail.com";
        $mail->SMTPAuth   = true;
        $mail->Username   = "azkurth@gmail.com";
        $mail->Password   = "bnqi wcvv hnfx kods";   // password de APP
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        $mail->setFrom("azkurth@gmail.com", "Sistema de Denuncias");
        $mail->addAddress("azkurth@hotmail.com");

        $mail->isHTML(true);
        $mail->Subject = "Nueva denuncia (ID: $id_denuncia)";
        $mail->Body = "
            <h3>Nueva denuncia registrada</h3>
            <b>ID:</b> $id_denuncia <br>
            <b>Tipo:</b> $tipo_denuncia <br>
            <b>Ubicación:</b> $ubicacion <br>
            <b>Detalle:</b> $detalle
        ";

        $mail->send();

        $response = [
            "success" => true,
            "id" => $id_denuncia,
            "correo" => "ok"
        ];

    } catch (Exception $e) {
        $response = [
            "success" => true,
            "id" => $id_denuncia,
            "correo" => "error",
            "error_correo" => $mail->ErrorInfo
        ];
    }

} else {
    $response = [
        "success" => false,
        "message" => $stmt->error
    ];
}

$stmt->close();
$conexion->close();

echo json_encode($response);
