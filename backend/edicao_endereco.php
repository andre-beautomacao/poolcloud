<?php
session_start();
include 'db_connect.php';

if (!isset($_SESSION['UsuarioID'])) {
    header('location: ../../index.php');
}

if ($_POST) {
    // Verifica se todos os campos obrigatórios estão presentes
    if (isset($_POST['id'], $_POST['nome'], $_POST['logradouro'], $_POST['cep'], $_POST['cidade'], $_POST['estado'], $_POST['tipo'])) {
        $id = trim($_POST['id']);
        $nome = trim($_POST['nome']);
        $logradouro = trim($_POST['logradouro']);
        $cep = trim($_POST['cep']);
        $cidade = trim($_POST['cidade']);
        $estado = trim($_POST['estado']);
        $tipo = trim($_POST['tipo']);
        $usuarioID = $_SESSION['UsuarioID'];

        // Preparar o SQL para atualização
        $stmt = $pdo->prepare("UPDATE enderecos SET nome = :nome, logradouro = :logradouro, cep = :cep, cidade = :cidade, estado = :estado, tipo = :tipo WHERE id = :id AND usuario_id = :usuarioID");
        $stmt->bindParam(':nome', $nome);
        $stmt->bindParam(':logradouro', $logradouro);
        $stmt->bindParam(':cep', $cep);
        $stmt->bindParam(':cidade', $cidade);
        $stmt->bindParam(':estado', $estado);
        $stmt->bindParam(':tipo', $tipo);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':usuarioID', $usuarioID);

        // Executa o SQL de atualização
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Endereço atualizado com sucesso!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao atualizar o endereço.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Dados insuficientes para editar o endereço.']);
    }
}
?>
