<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once __DIR__ . "/conexion.php"; // Asegúrate de que $conn exista

try {
    $query = "SELECT id, usuario, fecha_hora FROM log_sesiones ORDER BY fecha_hora DESC";
    $result = $conn->query($query);

    $sesiones = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $sesiones[] = $row;
        }
    }

    echo json_encode($sesiones);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error al cargar sesiones: " . $e->getMessage()
    ]);
}

$conn->close();
