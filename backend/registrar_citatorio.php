<?php
header("Content-Type: application/json");
require "conexion.php";

$data = json_decode(file_get_contents("php://input"), true);
$denuncia_id = $data['denuncia_id'] ?? 0;

if ($denuncia_id > 0) {
    $stmt = $conexion->prepare("INSERT INTO citatorios (denuncia_id, fecha) VALUES (?, NOW())");
    $stmt->bind_param("i", $denuncia_id);

    if ($stmt->execute()) {
        // Actualizar estatus a EN PROCESO
        $update = $conexion->prepare("UPDATE denuncias SET estatus='EN PROCESO' WHERE id=?");
        $update->bind_param("i", $denuncia_id);
        $update->execute();

        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false]);
    }
} else {
    echo json_encode(["success" => false]);
}
