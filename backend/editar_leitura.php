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

// Recebe os dados via POST
$leituraID = isset($_POST['leitura_id']) ? trim($_POST['leitura_id']) : null;
$piscinaID = isset($_POST['piscina_id']) ? trim($_POST['piscina_id']) : null;
$alcalinidade = isset($_POST['alcalinidade']) ? trim($_POST['alcalinidade']) : null;
$ph = isset($_POST['ph']) ? trim($_POST['ph']) : null;
$cloroLivre = isset($_POST['cloro_livre']) ? trim($_POST['cloro_livre']) : null;

if ($leituraID && $piscinaID && $alcalinidade !== null && $ph !== null && $cloroLivre !== null) {
    try {
        // Verifica se a leitura pertence ao usuário
        $sqlCheck = "
            SELECT l.id
            FROM leituras l
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

        // Verifica se a nova piscina pertence ao usuário
        $sqlCheckPiscina = "
            SELECT p.id
            FROM piscinas p
            JOIN enderecos e ON e.id = p.endereco_id
            WHERE p.id = :piscinaID
              AND e.usuario_id = :usuarioID
            LIMIT 1
        ";
        $stmtPiscina = $pdo->prepare($sqlCheckPiscina);
        $stmtPiscina->bindParam(':piscinaID', $piscinaID, PDO::PARAM_INT);
        $stmtPiscina->bindParam(':usuarioID', $usuarioID, PDO::PARAM_INT);
        $stmtPiscina->execute();
        $piscinaInfo = $stmtPiscina->fetch(PDO::FETCH_ASSOC);

        if (!$piscinaInfo) {
            // Piscina não encontrada ou não pertence ao usuário
            echo json_encode(['success' => false, 'message' => 'Piscina não encontrada ou não autorizada.']);
            exit;
        }

        // Atualiza a leitura
        $sqlUpdate = "
            UPDATE leituras_manuais
            SET piscina_id = :piscinaID,
                alcalinidade = :alcalinidade,
                ph = :ph,
                cloro_livre = :cloroLivre
            WHERE id = :leituraID
        ";
        $stmtUpdate = $pdo->prepare($sqlUpdate);
        $stmtUpdate->bindParam(':piscinaID', $piscinaID, PDO::PARAM_INT);
        $stmtUpdate->bindParam(':alcalinidade', $alcalinidade);
        $stmtUpdate->bindParam(':ph', $ph);
        $stmtUpdate->bindParam(':cloroLivre', $cloroLivre);
        $stmtUpdate->bindParam(':leituraID', $leituraID, PDO::PARAM_INT);

        if ($stmtUpdate->execute()) {
            echo json_encode(['success' => true, 'message' => 'Leitura atualizada com sucesso.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao atualizar a leitura.']);
        }

    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Dados incompletos fornecidos.']);
}
?>
