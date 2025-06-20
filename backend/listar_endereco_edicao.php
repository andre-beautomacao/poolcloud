<?php
session_start();
include 'db_connect.php'; // Inclua sua conexão com o banco de dados

if (!isset($_SESSION['UsuarioID'])) {
    http_response_code(403); // Não autorizado
    echo json_encode(['message' => 'Usuário não autorizado']);
    exit;
}

// Verifica se o id foi enviado via POST
if (isset($_POST['id'])) {
    $usuarioID = $_SESSION['UsuarioID'];
    $enderecoID = trim($_POST['id']); // Obtém o ID do endereço enviado via POST

    // Busca o endereço do usuário logado com o ID especificado
    $stmt = $pdo->prepare("SELECT id, nome, tipo, logradouro, cep, cidade, estado FROM enderecos WHERE id = :enderecoID");
    $stmt->bindParam(':enderecoID', $enderecoID);
    $stmt->execute();
    $endereco = $stmt->fetch(PDO::FETCH_ASSOC); // Obtém apenas um endereço

    // Verifica se o endereço foi encontrado
    if ($endereco) {
        // Retorna o endereço em formato JSON
        header('Content-Type: application/json');
        echo json_encode($endereco);
    } else {
        // Se não encontrar, retorna um erro
        http_response_code(404); // Não encontrado
        echo json_encode(['message' => 'Endereço não encontrado']);
    }
} else {
    // Se o id não foi fornecido
    http_response_code(400); // Solicitação inválida
    echo json_encode(['message' => 'ID do endereço não fornecido']);
}
?>
