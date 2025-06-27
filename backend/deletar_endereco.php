<?php
session_start();
include 'db_connect.php'; // Inclua a conexão com o banco de dados

// Verifica se o usuário está logado
if (!isset($_SESSION['UsuarioID'])) {
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado.']);
    exit;
}

// Verifica se o endereco_id foi enviado via POST
if (isset($_POST['endereco_id'])) {
    $enderecoID = $_POST['endereco_id'];

    // Prepara a consulta para deletar o endereco
    $stmt = $pdo->prepare("DELETE FROM enderecos WHERE id = :enderecoID");
    $stmt->bindParam(':enderecoID', $enderecoID);

    // Executa a consulta
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Endereço excluído com sucesso!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao excluir o endereco.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'ID do endereco não fornecido.']);
}
