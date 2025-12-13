<?php
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
    $mail->Username   = 'azkurth@gmail.com';            // Tu correo
    $mail->Password   = 'bnqi wcvv hnfx kods';          // Password de aplicación
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // Modo seguro
    $mail->Port       = 587;

    // Remitente
    $mail->setFrom('azkurth@gmail.com', 'Sistema de Denuncias');

    // Destinatario
    $mail->addAddress('azkurth@hotmail.com');

    // Contenido
    $mail->isHTML(true);
    $mail->Subject = 'Correo de prueba';
    $mail->Body    = '<b>Este es un correo de prueba enviado desde PHPMailer.</b>';

    // Enviar
    $mail->send();

    echo "Correo enviado correctamente :)";

} catch (Exception $e) {
    echo "Error al enviar correo: " . $mail->ErrorInfo;
}
