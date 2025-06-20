<?php
session_start();
include 'db_connect.php'; // Inclua sua conexão com o banco de dados

if (!isset($_SESSION['UsuarioID'])) {
    http_response_code(403); // Não autorizado
    echo json_encode(['message' => 'Usuário não autorizado']);
    exit;
}

$usuarioID = $_SESSION['UsuarioID'];

$stmt = $pdo->prepare("SELECT id, nome FROM piscinas WHERE usuario_id = :usuarioID");
$stmt->bindParam(':usuarioID', $usuarioID);
$stmt->execute();

$locais = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Retorna os locais em formato JSON
header('Content-Type: application/json');
echo json_encode($locais);
?>
