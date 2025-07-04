<?php
session_start();
include 'db_connect.php';
require_once 'permissions.php';

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

        if (!usuarioTemPermissao($pdo, $usuarioID, 'piscina', intval($id), 'editar')) {
            echo json_encode(['success' => false, 'message' => 'Permissão negada']);
            exit;
        }

        // Preparar o SQL para atualização
        $stmt = $pdo->prepare("UPDATE piscinas SET nome = :nome, volume = :volume, controle_cloro = :controle_cloro, controle_ph = :controle_ph WHERE id = :id");
        $stmt->bindParam(':nome', $nome);
        $stmt->bindParam(':volume', $volume);
        $stmt->bindParam(':controle_cloro', $controle_cloro);
        $stmt->bindParam(':controle_ph', $controle_ph);
        $stmt->bindParam(':id', $id);

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
