<?php

header("Access-Control-Allow-Origin: http://localhost:3000"); // 🔐 no usar *
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Método no permitido"
    ]);
    exit;
}

require_once __DIR__ . "/conexion.php";

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input["id"])) {
  echo json_encode([
    "success" => false,
    "message" => "ID no recibido"
  ]);
  exit;
}

$id = intval($input["id"]);

try {

    $stmt = $conn->prepare("DELETE FROM usuarios WHERE id = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
      echo json_encode(["success" => true]);
    } else {
      echo json_encode([
        "success" => false,
        "message" => "No se pudo eliminar"
      ]);
    }

    $stmt->close();

} catch (Exception $e) {

    error_log("Error eliminar usuario: " . $e->getMessage());

    echo json_encode([
        "success" => false,
        "message" => "Error interno"
    ]);
}

$conn->close();