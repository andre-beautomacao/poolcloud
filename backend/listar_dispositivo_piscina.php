<?php
session_start();
include 'db_connect.php';

if (!isset($_SESSION['UsuarioID'])) {
    http_response_code(403);
    echo json_encode(['message' => 'Usuário não autorizado']);
    exit;
}

$usuarioID = $_SESSION['UsuarioID'];
$piscinaID = isset($_GET['piscina_id']) ? intval($_GET['piscina_id']) : null;

if ($piscinaID === null) {
    http_response_code(400);
    echo json_encode(['message' => 'ID da piscina não fornecido']);
    exit;
}

$query = "
    SELECT id, mac1, temp_habilitada
    FROM dispositivos
    WHERE piscina_id = :piscinaID
";

$stmt = $pdo->prepare($query);
$stmt->bindParam(':piscinaID', $piscinaID, PDO::PARAM_INT);
$stmt->execute();

$dispositivos = $stmt->fetchAll(PDO::FETCH_ASSOC);

header('Content-Type: application/json');
echo json_encode($dispositivos);
