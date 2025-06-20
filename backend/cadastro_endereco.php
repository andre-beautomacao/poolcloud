<?php
session_start();
include 'db_connect.php';

if (!isset($_SESSION['UsuarioID'])) {
    header('location: ../../index.php');
}

if ($_POST) {
    if (isset($_POST['nome'], $_POST['tipo'],$_POST['logradouro'], $_POST['cep'], $_POST['cidade'], $_POST['estado'], )) {
        $nome = trim($_POST['nome']);
        $tipo = trim($_POST['tipo']);
        $logradouro = trim($_POST['logradouro']);
        $cep = trim($_POST['cep']);
        $cidade = trim($_POST['cidade']);
        $estado = trim($_POST['estado']);
        $tipo = trim($_POST['tipo']);
        $usuarioID = $_SESSION['UsuarioID'];

        $stmt = $pdo->prepare("INSERT INTO enderecos (nome, tipo, logradouro, cep, cidade, estado, usuario_id) VALUES (:nome, :tipo, :logradouro, :cep, :cidade, :estado, :usuarioID)");
        $stmt->bindParam(':nome', $nome);
        $stmt->bindParam(':logradouro', $logradouro);
        $stmt->bindParam(':cep', $cep);
        $stmt->bindParam(':cidade', $cidade);
        $stmt->bindParam(':estado', $estado);
        $stmt->bindParam(':tipo', $tipo);
        $stmt->bindParam(':usuarioID', $usuarioID);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => "Endereço cadastrado com sucesso!"]);
        } else {
            echo json_encode(['success' => false, 'message' => "Erro ao cadastrar o endereço."]);
        }
    }
}
?>
