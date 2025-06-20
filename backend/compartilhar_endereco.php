<?php
session_start();
include 'db_connect.php'; // Inclua sua conexão com o banco de dados

if (!isset($_SESSION['UsuarioID'])) {
    header('location: ../../index.php');
    exit; // Adiciona exit após o redirecionamento
}

if ($_POST) {
    if (isset($_POST['email'], $_POST['endereco_id'])) {
        $email = trim($_POST['email']);
        $enderecoID = trim($_POST['endereco_id']);

        // Verifica se o usuário com o e-mail existe
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result) {
            $usuarioID = $result['id'];
            $proprietarioID = $_SESSION['UsuarioID']; // ID do usuário logado

            // Prepara a consulta para inserir os dados na tabela de compartilhamentos
            $stmt = $pdo->prepare("INSERT INTO compartilhamentos (endereco_id, proprietario_id, usuario_id) VALUES (:enderecoID, :proprietarioID, :usuarioID)");
            $stmt->bindParam(':enderecoID', $enderecoID);
            $stmt->bindParam(':proprietarioID', $proprietarioID);
            $stmt->bindParam(':usuarioID', $usuarioID);

            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Compartilhamento criado com sucesso!']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Erro ao criar compartilhamento: ' . $stmt->errorInfo()[2]]);
            }
        } else {
            // Se o usuário não foi encontrado
            echo json_encode(['success' => false, 'message' => 'Usuário não encontrado com este e-mail.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'E-mail e ID do endereço são necessários.']);
    }
}
?>
