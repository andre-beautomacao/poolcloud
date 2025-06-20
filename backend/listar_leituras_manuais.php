<?php
session_start();
include 'db_connect.php'; // Conexão com o banco

// Verifica se o usuário está logado
if (!isset($_SESSION['UsuarioID'])) {
    http_response_code(403); // Não autorizado
    echo json_encode(['error' => true, 'message' => 'Usuário não autorizado']);
    exit;
}

header('Content-Type: application/json');

// ID do usuário logado
$usuarioID = $_SESSION['UsuarioID'];

// Verifica se recebemos um ID de piscina via POST
$piscinaID = isset($_POST['piscina_id']) ? trim($_POST['piscina_id']) : null;

try {
    if ($piscinaID) {
        // ----------------------------------------------------------------------
        // 1) BUSCAR APENAS AS LEITURAS DA PISCINA ESPECÍFICA
        //    Garantindo que essa piscina pertença ao usuário logado
        // ----------------------------------------------------------------------

        // Primeiro, garantir que a piscina pertença ao usuário
        $sqlCheckPiscina = "
            SELECT p.id AS piscina_id, p.nome AS nome_piscina, e.nome AS nome_local
            FROM piscinas p
            JOIN enderecos e ON e.id = p.endereco_id
            WHERE p.id = :piscinaID
              AND e.usuario_id = :usuarioID
            LIMIT 1
        ";
        $stmt = $pdo->prepare($sqlCheckPiscina);
        $stmt->bindParam(':piscinaID', $piscinaID, PDO::PARAM_INT);
        $stmt->bindParam(':usuarioID', $usuarioID, PDO::PARAM_INT);
        $stmt->execute();
        $piscinaInfo = $stmt->fetch(PDO::FETCH_ASSOC);

        // Se não encontrar a piscina ou ela não pertencer ao usuário
        if (!$piscinaInfo) {
            echo json_encode(['piscinas' => []]);
            exit; // ou retornar alguma mensagem de erro
        }

        // Agora buscamos as leituras dessa piscina
        $sqlLeituras = "
            SELECT id, ph, cloro_livre, alcalinidade, data_leitura
            FROM leituras_manuais
            WHERE piscina_id = :piscinaID
            ORDER BY data_leitura ASC
        ";
        $stmt = $pdo->prepare($sqlLeituras);
        $stmt->bindParam(':piscinaID', $piscinaID, PDO::PARAM_INT);
        $stmt->execute();
        $leituras = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Monta a resposta no mesmo formato de quando trazemos várias piscinas
        $piscinas = [[
            'piscina_id'   => $piscinaInfo['piscina_id'],
            'nome_piscina' => $piscinaInfo['nome_piscina'] ?: 'Piscina não encontrada',
            'nome_local'   => $piscinaInfo['nome_local']   ?: '',
            'leituras'     => $leituras ?: []
        ]];

        echo json_encode(['piscinas' => $piscinas]);

    } else {
        // ----------------------------------------------------------------------
        // 2) BUSCAR TODAS AS PISCINAS COM SUAS LEITURAS (DO USUÁRIO LOGADO)
        // ----------------------------------------------------------------------

        // 2.1) Selecionar todas as piscinas do usuário
        $sqlPiscinas = "
            SELECT p.id AS piscina_id, p.nome AS nome_piscina, e.nome AS nome_local
            FROM piscinas p
            JOIN enderecos e ON e.id = p.endereco_id
            WHERE e.usuario_id = :usuarioID
            ORDER BY p.id ASC
        ";
        $stmt = $pdo->prepare($sqlPiscinas);
        $stmt->bindParam(':usuarioID', $usuarioID, PDO::PARAM_INT);
        $stmt->execute();
        $listaPiscinas = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $piscinas = [];
        // 2.2) Para cada piscina, buscar as leituras
        foreach ($listaPiscinas as $row) {
            $pId         = $row['piscina_id'];
            $nomePiscina = $row['nome_piscina'];
            $nomeLocal   = $row['nome_local'];

            // Buscar leituras da piscina atual
            $sqlLeituras = "
                SELECT id, ph, cloro_livre, alcalinidade, data_leitura
                FROM leituras_manuais
                WHERE piscina_id = :piscinaID
                ORDER BY data_leitura ASC
            ";
            $stmtLeituras = $pdo->prepare($sqlLeituras);
            $stmtLeituras->bindParam(':piscinaID', $pId, PDO::PARAM_INT);
            $stmtLeituras->execute();
            $leituras = $stmtLeituras->fetchAll(PDO::FETCH_ASSOC);

            // Monta o array final
            $piscinas[] = [
                'piscina_id'   => $pId,
                'nome_piscina' => $nomePiscina,
                'nome_local'   => $nomeLocal,
                'leituras'     => $leituras
            ];
        }

        echo json_encode(['piscinas' => $piscinas]);
    }
} catch (Exception $e) {
    echo json_encode([
        'error'   => true,
        'message' => $e->getMessage()
    ]);
}
?>
