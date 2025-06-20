<?php
session_start();
include 'db_connect.php'; // Conexão com o banco

// Verifica se o usuário está logado
if (!isset($_SESSION['UsuarioID'])) {
    http_response_code(403); // Não autorizado
    echo json_encode(['success' => false, 'message' => 'Usuário não autorizado']);
    exit;
}

header('Content-Type: application/json');

// ID do usuário logado
$usuarioID = $_SESSION['UsuarioID'];

// Verifica se recebemos o ID da leitura via POST
$leituraID = isset($_POST['leitura_id']) ? trim($_POST['leitura_id']) : null;

if ($leituraID) {
    try {
        // Primeiro, verificar se a leitura pertence a uma piscina do usuário
        $sqlCheck = "
            SELECT l.id
            FROM leituras_manuais l
            JOIN piscinas p ON p.id = l.piscina_id
            JOIN enderecos e ON e.id = p.endereco_id
            WHERE l.id = :leituraID
              AND e.usuario_id = :usuarioID
            LIMIT 1
        ";
        $stmt = $pdo->prepare($sqlCheck);
        $stmt->bindParam(':leituraID', $leituraID, PDO::PARAM_INT);
        $stmt->bindParam(':usuarioID', $usuarioID, PDO::PARAM_INT);
        $stmt->execute();
        $leituraInfo = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$leituraInfo) {
            // Leitura não encontrada ou não pertence ao usuário
            echo json_encode(['success' => false, 'message' => 'Leitura não encontrada ou não autorizada.']);
            exit;
        }

        // Procede com a exclusão
        $sqlDelete = "DELETE FROM leituras_manuais WHERE id = :leituraID";
        $stmtDelete = $pdo->prepare($sqlDelete);
        $stmtDelete->bindParam(':leituraID', $leituraID, PDO::PARAM_INT);

        if ($stmtDelete->execute()) {
            echo json_encode(['success' => true, 'message' => 'Leitura excluída com sucesso.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao excluir a leitura.']);
        }

    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'ID da leitura não fornecido.']);
}
?>
