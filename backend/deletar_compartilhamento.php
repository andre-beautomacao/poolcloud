<?php
session_start();
include 'db_connect.php'; // Inclua a conexão com o banco de dados

// Verifica se o usuário está logado
if (!isset($_SESSION['UsuarioID'])) {
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado.']);
    exit;
}

// Verifica se o compartilhamento_id foi enviado via POST
if (isset($_POST['compartilhamento_id'])) {
    $compartilhamentoID = $_POST['compartilhamento_id'];

    // Prepara a consulta para deletar o compartilhamento
    $stmt = $pdo->prepare("DELETE FROM compartilhamentos WHERE id = :compartilhamentoID");
    $stmt->bindParam(':compartilhamentoID', $compartilhamentoID);

    // Executa a consulta
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Compartilhamento excluído com sucesso!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao excluir o compartilhamento.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'ID do compartilhamento não fornecido.']);
}
