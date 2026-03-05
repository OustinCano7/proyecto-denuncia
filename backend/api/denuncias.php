<?php
include("../conexion.php");

header("Content-Type: application/json");
header("X-Content-Type-Options: nosniff");

$method = $_SERVER['REQUEST_METHOD'];

if ($method === "GET") {

    $stmt = $conexion->prepare("
        SELECT folio, fecha, hora 
        FROM denuncias 
        ORDER BY fecha DESC, hora DESC
        LIMIT 100
    ");

    $stmt->execute();
    $resultado = $stmt->get_result();

    $denuncias = [];

    while ($fila = $resultado->fetch_assoc()) {
        $denuncias[] = $fila;
    }

    echo json_encode($denuncias);
}
?>