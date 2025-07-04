<?php
session_start();
include 'db_connect.php';
require_once 'permissions.php';

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

        if (!usuarioTemPermissao($pdo, $usuarioID, 'endereco', intval($id), 'editar')) {
            echo json_encode(['success' => false, 'message' => 'Permissão negada']);
            exit;
        }

        // Preparar o SQL para atualização
        $stmt = $pdo->prepare("UPDATE enderecos SET nome = :nome, logradouro = :logradouro, cep = :cep, cidade = :cidade, estado = :estado, tipo = :tipo WHERE id = :id");
        $stmt->bindParam(':nome', $nome);
        $stmt->bindParam(':logradouro', $logradouro);
        $stmt->bindParam(':cep', $cep);
        $stmt->bindParam(':cidade', $cidade);
        $stmt->bindParam(':estado', $estado);
        $stmt->bindParam(':tipo', $tipo);
        $stmt->bindParam(':id', $id);

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
