<?php
session_start();
include 'db_connect.php'; // Inclua sua conexão com o banco de dados

// Ativar modo de erro do PDO para capturar exceções
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

if ($_POST) {
    if (isset($_POST['endereco_id']) && isset($_POST['usuario_id'])) {
        $endereco_id = $_POST['endereco_id'];
        $usuario_id = ($_POST['usuario_id']);
        // Verificar se a sessão está ativa
        if (isset($_SESSION['UsuarioID'])) {
            $proprietario_id = $_SESSION['UsuarioID']; // ID do usuário logado
        } else {
            echo json_encode(['success' => false, 'message' => 'Usuário não autenticado.']);
            exit;
        }

        try {
            // Preparar e executar a inserção no banco de dados
            $insert = $pdo->prepare("INSERT INTO compartilhamentos (proprietario_id, usuario_id, endereco_id) VALUES (:proprietario_id,:usuario_id, :endereco_id)");
            $insert->bindParam(':proprietario_id', $proprietario_id);
            $insert->bindParam(':usuario_id', $usuario_id);
            $insert->bindParam(':endereco_id', $endereco_id);

            if ($insert->execute()) {
                echo json_encode(['success' => true, 'message' => 'Endereço compartilhado com sucesso!']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Erro ao compartilhar o endereço.']);
            }
        } catch (Exception $e) {
            // Captura qualquer erro e exibe a mensagem
            echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
        }
    } else {
        http_response_code(400); // Bad Request
        echo json_encode(['success' => false, 'message' => 'Dados insuficientes.']);
    }
} else {
    http_response_code(405); // Método não permitido
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
}
?>
