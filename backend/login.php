<?php

// 🔐 CORS seguro (solo React)
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// 🔥 Manejo de preflight
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

require_once __DIR__ . "/conexion.php";

// Obtener datos JSON
$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['usuario']) || !isset($input['clave'])) {
    echo json_encode([
        "success" => false,
        "message" => "Datos incompletos"
    ]);
    exit;
}

$usuario = trim($input['usuario']);
$clave   = $input['clave'];

try {

    // Consulta segura con prepared statement
    $stmt = $conn->prepare("SELECT id, usuario, rol, clave FROM usuarios WHERE usuario = ?");
    $stmt->bind_param("s", $usuario);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result && $result->num_rows === 1) {

        $row = $result->fetch_assoc();

        if (password_verify($clave, $row['clave'])) {

            echo json_encode([
                "success" => true,
                "id" => $row['id'],
                "usuario" => $row['usuario'],
                "rol" => $row['rol']
            ]);

        } else {

            echo json_encode([
                "success" => false,
                "message" => "Usuario o contraseña incorrecta"
            ]);
        }

    } else {

        echo json_encode([
            "success" => false,
            "message" => "Usuario no encontrado"
        ]);
    }

    $stmt->close();
    $conn->close();

} catch (Exception $e) {

    // No mostrar error real en producción
    echo json_encode([
        "success" => false,
        "message" => "Error en el servidor"
    ]);
}