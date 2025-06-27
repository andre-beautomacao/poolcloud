<?php
session_start();
include 'db_connect.php'; // Inclua sua conexão com o banco de dados

if (!isset($_SESSION['UsuarioID'])) {
    http_response_code(403); // Não autorizado
    echo json_encode(['message' => 'Usuário não autorizado']);
    exit;
}

$usuarioID = $_SESSION['UsuarioID'];
$isAdmin = $_SESSION['UsuarioAdmin'] ?? 0;
$query = $isAdmin
    ? "SELECT id, nome FROM enderecos"
    : "SELECT id, nome FROM enderecos WHERE usuario_id = :usuarioID";

$stmt = $pdo->prepare($query);
if (!$isAdmin) {
    $stmt->bindParam(':usuarioID', $usuarioID);
}
$stmt->execute();

$locais = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Retorna os locais em formato JSON
header('Content-Type: application/json');
echo json_encode($locais);
?>
