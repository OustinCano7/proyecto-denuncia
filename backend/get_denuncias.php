<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$conexion = new mysqli("localhost", "root", "", "denuncias_db"); // 🔥 ESTA ES LA BD CORRECTA

if ($conexion->connect_error) {
    echo json_encode([]);
    exit;
}

$query = "SELECT * FROM denuncias ORDER BY id DESC";
$result = $conexion->query($query);

$denuncias = [];

while ($row = $result->fetch_assoc()) {
    $denuncias[] = $row;
}

echo json_encode($denuncias);

$conexion->close();
?>
