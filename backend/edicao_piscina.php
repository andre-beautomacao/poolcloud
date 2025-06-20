<?php
session_start();
include 'db_connect.php';

if (!isset($_SESSION['UsuarioID'])) {
    header('location: ../../index.php');
}

if ($_POST) {
    // Verifica se todos os campos obrigatórios estão presentes
    if (isset($_POST['id'], $_POST['nome'], $_POST['volume'], $_POST['controle_cloro'], $_POST['controle_ph'])) {
        $id = trim($_POST['id']);
        $nome = trim($_POST['nome']);
        $volume = trim($_POST['volume']);
        $controle_cloro = trim($_POST['controle_cloro']);
        $controle_ph = trim($_POST['controle_ph']);
        $usuarioID = $_SESSION['UsuarioID'];

        // Preparar o SQL para atualização
        $stmt = $pdo->prepare("UPDATE piscinas SET nome = :nome, volume = :volume, controle_cloro = :controle_cloro, controle_ph = :controle_ph WHERE id = :id AND usuario_id = :usuarioID");
        $stmt->bindParam(':nome', $nome);
        $stmt->bindParam(':volume', $volume);
        $stmt->bindParam(':controle_cloro', $controle_cloro);
        $stmt->bindParam(':controle_ph', $controle_ph);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':usuarioID', $usuarioID);

        // Executa o SQL de atualização
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Piscina atualizada com sucesso!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao atualizar a piscina.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Dados insuficientes para editar a piscina.']);
    }
}
?>
