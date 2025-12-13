<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once "conexion.php";

try {
    $stmt = $pdo->query("SELECT id, usuario, fecha_hora, ip FROM log_sesiones ORDER BY id DESC");
    $sesiones = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($sesiones);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error al obtener sesiones: " . $e->getMessage()]);
}
?>
