<?php
session_start();
require_once 'db_connect.php'; // Inclui a conexão ao banco de dados
require_once 'permissions.php';

// Verifica se a sessão do usuário está ativa
if (!isset($_SESSION['UsuarioID'])) {
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado.']);
    exit;
}

if ($_POST) {
    if (isset($_POST['dispositivo_id'])) {
        $dispositivo_id = intval($_POST['dispositivo_id']);
        $proprietario_id = $_SESSION['UsuarioID'];

        if (!usuarioTemPermissao($pdo, $proprietario_id, 'dispositivo', $dispositivo_id, 'admin')) {
            echo json_encode(['success' => false, 'message' => 'Permissão negada.']);
            exit;
        }

        $stmt = $pdo->prepare(
            "SELECT dispositivos.id AS dispositivo_id, piscinas.id AS piscina_id
            FROM dispositivos
            INNER JOIN piscinas ON dispositivos.piscina_id = piscinas.id
            WHERE dispositivos.id = :dispositivo_id"
        );
        $stmt->bindParam(':dispositivo_id', $dispositivo_id);
        $stmt->execute();

        // Se o dispositivo pertence a uma piscina do usuário logado
        if ($stmt->rowCount() > 0) {
            // Exclui o dispositivo
            $deleteStmt = $pdo->prepare("DELETE FROM dispositivos WHERE id = :dispositivo_id");
            $deleteStmt->bindParam(':dispositivo_id', $dispositivo_id);

            if ($deleteStmt->execute()) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                echo json_encode(['success' => true, 'message' => 'Dispositivo deletado com sucesso!', 'piscina_id' => $row['piscina_id']]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Erro ao deletar o dispositivo.']);
            }
        } else {
            // Se o usuário não for o proprietário do dispositivo
            echo json_encode(['success' => false, 'message' => 'Você não tem permissão para deletar este dispositivo.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'ID do dispositivo não fornecido.']);
    }
}
?>
