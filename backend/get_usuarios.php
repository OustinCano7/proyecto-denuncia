<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once "conexion.php";

try {
    $stmt = $pdo->query("SELECT id, usuario, rol, fecha_registro FROM usuarios ORDER BY id ASC");
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($usuarios);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error al obtener usuarios: " . $e->getMessage()]);
}
?>
