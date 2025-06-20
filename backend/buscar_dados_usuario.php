<?php
session_start();
include 'db_connect.php'; // Inclua sua conexão com o banco de dados

if (!isset($_SESSION['UsuarioID'])) {
    http_response_code(403); // Não autorizado
    echo json_encode(['message' => 'Usuário não autorizado']);
    exit;
}

$usuarioID = $_SESSION['UsuarioID'];

// Busca os dados do usuário
$stmt = $pdo->prepare("SELECT nome, email FROM usuarios WHERE id = :usuarioID");
$stmt->bindParam(':usuarioID', $usuarioID);
$stmt->execute();

$usuario = $stmt->fetch(PDO::FETCH_ASSOC);

if ($usuario) {
    header('Content-Type: application/json');
    echo json_encode($usuario);
} else {
    http_response_code(404); // Não encontrado
    echo json_encode(['message' => 'Dados do usuário não encontrados']);
}
?>
