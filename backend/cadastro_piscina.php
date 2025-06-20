<?php
session_start();
include 'db_connect.php'; // Inclua sua conexão com o banco de dados

if (!isset($_SESSION['UsuarioID'])) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Usuário não autorizado.']);
    exit;
}

if ($_POST) {
    if (isset($_POST['nome'], $_POST['volume'], $_POST['controle_cloro'], $_POST['controle_ph'], $_POST['endereco_id'])) {
        $nome = trim($_POST['nome']);
        $volume = trim($_POST['volume']);
        $controle_cloro = trim($_POST['controle_cloro']);
        $controle_ph = trim($_POST['controle_ph']);
        $usuarioID = $_SESSION['UsuarioID'];
        $enderecoID = trim($_POST['endereco_id']);

        $stmt = $pdo->prepare("INSERT INTO piscinas (nome, volume, controle_cloro, controle_ph, usuario_id, endereco_id) VALUES (:nome, :volume, :controle_cloro, :controle_ph, :usuarioID, :enderecoID)");
        $stmt->bindParam(':nome', $nome);
        $stmt->bindParam(':volume', $volume);
        $stmt->bindParam(':controle_cloro', $controle_cloro);
        $stmt->bindParam(':controle_ph', $controle_ph);
        $stmt->bindParam(':usuarioID', $usuarioID);
        $stmt->bindParam(':enderecoID', $enderecoID);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => "Piscina cadastrado com sucesso!"]);
        } else {
            echo json_encode(['success' => false, 'message' => "Erro ao cadastrar a piscina."]);
        }
    }
}
?>
