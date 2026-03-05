<?php

// 🔐 Respuesta JSON
header("Content-Type: application/json; charset=UTF-8");

// 🔐 Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método no permitido"]);
    exit;
}

// RUTA CORRECTA A PHPMailer
require __DIR__ . '/PHPMailer/src/PHPMailer.php';
require __DIR__ . '/PHPMailer/src/SMTP.php';
require __DIR__ . '/PHPMailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Crear instancia
$mail = new PHPMailer(true);

try {

    // Config SMTP
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;

    // 🔐 RECOMENDADO: usar variables de entorno
    $mail->Username   = getenv('MAIL_USER');  
    $mail->Password   = getenv('MAIL_PASS');  

    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    // Remitente
    $mail->setFrom(getenv('MAIL_USER'), 'Sistema de Denuncias');

    // Destinatario
    $mail->addAddress('azkurth@hotmail.com');

    // Contenido
    $mail->isHTML(true);
    $mail->Subject = 'Correo de prueba';
    $mail->Body    = '<b>Este es un correo de prueba enviado desde PHPMailer.</b>';

    // Enviar
    $mail->send();

    echo json_encode([
        "success" => true,
        "message" => "Correo enviado correctamente"
    ]);

} catch (Exception $e) {

    echo json_encode([
        "success" => false,
        "message" => "Error al enviar correo"
    ]);
}