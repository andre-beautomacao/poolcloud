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

// Desabilita a exibição de erros (produção)
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(0);

// ID do usuário logado
$usuarioID = $_SESSION['UsuarioID'];

// Recebe os dados via POST
$piscinaID = isset($_POST['piscina_id']) ? trim($_POST['piscina_id']) : null;
$alcalinidade = isset($_POST['alcalinidade']) ? trim($_POST['alcalinidade']) : null;
$ph = isset($_POST['ph']) ? trim($_POST['ph']) : null;
$cloroLivre = isset($_POST['cloro_livre']) ? trim($_POST['cloro_livre']) : null;

if ($piscinaID && $alcalinidade !== null && $ph !== null && $cloroLivre !== null) {
    try {
        // Verifica se a piscina pertence ao usuário
        $sqlCheck = "
            SELECT p.id
            FROM piscinas p
            JOIN enderecos e ON e.id = p.endereco_id
            WHERE p.id = :piscinaID
              AND e.usuario_id = :usuarioID
            LIMIT 1
        ";
        $stmt = $pdo->prepare($sqlCheck);
        $stmt->bindParam(':piscinaID', $piscinaID, PDO::PARAM_INT);
        $stmt->bindParam(':usuarioID', $usuarioID, PDO::PARAM_INT);
        $stmt->execute();
        $piscinaInfo = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$piscinaInfo) {
            // Piscina não encontrada ou não pertence ao usuário
            echo json_encode(['success' => false, 'message' => 'Piscina não encontrada ou não autorizada.']);
            exit;
        }

        // Iniciar uma transação para garantir que ambas as operações ocorram com sucesso
        $pdo->beginTransaction();

        // Insere a nova leitura
        $sqlInsert = "
            INSERT INTO leituras_manuais (piscina_id, alcalinidade, ph, cloro_livre, data_leitura)
            VALUES (:piscinaID, :alcalinidade, :ph, :cloroLivre, NOW())
        ";
        $stmtInsert = $pdo->prepare($sqlInsert);
        $stmtInsert->bindParam(':piscinaID', $piscinaID, PDO::PARAM_INT);
        $stmtInsert->bindParam(':alcalinidade', $alcalinidade);
        $stmtInsert->bindParam(':ph', $ph);
        $stmtInsert->bindParam(':cloroLivre', $cloroLivre);

        if (!$stmtInsert->execute()) {
            // Se a inserção falhar, faz rollback
            $pdo->rollBack();
            echo json_encode(['success' => false, 'message' => 'Erro ao cadastrar a leitura.']);
            exit;
        }

        // Atualiza os campos da piscina com os valores da nova leitura
        $sqlUpdatePiscina = "
            UPDATE piscinas
            SET last_ph = :ph,
                last_cloro_livre = :cloroLivre,
                last_alcalinidade = :alcalinidade,
                data_leitura = NOW()
            WHERE id = :piscinaID
        ";
        $stmtUpdate = $pdo->prepare($sqlUpdatePiscina);
        $stmtUpdate->bindParam(':ph', $ph);
        $stmtUpdate->bindParam(':cloroLivre', $cloroLivre);
        $stmtUpdate->bindParam(':alcalinidade', $alcalinidade);
        $stmtUpdate->bindParam(':piscinaID', $piscinaID, PDO::PARAM_INT);

        if (!$stmtUpdate->execute()) {
            // Se a atualização falhar, faz rollback
            $pdo->rollBack();
            echo json_encode(['success' => false, 'message' => 'Erro ao atualizar os dados da piscina.']);
            exit;
        }

        // Se tudo ocorrer bem, faz commit
        $pdo->commit();

        echo json_encode(['success' => true, 'message' => 'Leitura cadastrada e piscina atualizada com sucesso.']);
        exit;

    } catch (Exception $e) {
        // Em caso de erro, faz rollback e retorna a mensagem de erro
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        // Registre o erro no log do servidor para depuração
        error_log($e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'Ocorreu um erro ao processar a leitura. Por favor, tente novamente.'
        ]);
        exit;
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Dados incompletos fornecidos.']);
    exit;
}
?>
