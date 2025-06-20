<?php
session_start();
ob_clean();
header('Content-Type: application/json; charset=utf-8');
include 'db_connect.php';

// Aceita tanto POST quanto GET
$piscinaID = $_POST['piscina_id'] ?? $_GET['piscina_id'] ?? null;
$dia = isset($_POST['dia']) ? (int)$_POST['dia'] : (isset($_GET['dia']) ? (int)$_GET['dia'] : null);
$mesRequisitado = (int) ($_POST['mes'] ?? $_GET['mes'] ?? date('m'));
$anoRequisitado = (int) ($_POST['ano'] ?? $_GET['ano'] ?? date('Y'));

if ($piscinaID) {
    $piscinaID = (int) $piscinaID;
    $ano = $anoRequisitado;
    $mes = $mesRequisitado;

    $stmt = $pdo->prepare("SELECT mac1 FROM dispositivos WHERE piscina_id = :piscinaID LIMIT 1");
    $stmt->execute([':piscinaID' => $piscinaID]);
    $mac = $stmt->fetchColumn();

    if (!$mac) {
        echo json_encode(['error' => 'Nenhum dispositivo encontrado para essa piscina.']);
        exit;
    }

    $leituras_aut = [];
    $ano_mes_consultado = null;
    $mensagem = null;

    // Dia específico fornecido
    if ($dia !== null) {
        $inicio = sprintf('%04d-%02d-%02d 00:00:00', $ano, $mes, $dia);
        $fim = sprintf('%04d-%02d-%02d 23:59:59', $ano, $mes, $dia);

        $sql = "SELECT id, data_hora, ph, orp, temperatura
                FROM leituras_iot
                WHERE mac = :mac AND data_hora BETWEEN :inicio AND :fim
                ORDER BY data_hora ASC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':mac' => $mac,
            ':inicio' => $inicio,
            ':fim' => $fim
        ]);
        $leituras_aut = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $ano_mes_consultado = (int) sprintf('%04d%02d', $ano, $mes);
    } else {
        // Sem dia definido → buscar por mês, com fallback para meses anteriores
        $maxTentativas = 6;
        $sql = "SELECT id, data_hora, ph, orp, temperatura
                FROM leituras_iot
                WHERE mac = :mac AND ano_mes = :ano_mes
                ORDER BY data_hora ASC";
        $stmt = $pdo->prepare($sql);

        while ($maxTentativas-- > 0 && empty($leituras_aut)) {
            $ano_mes = (int) sprintf('%04d%02d', $ano, $mes);
            $stmt->execute([
                ':mac' => $mac,
                ':ano_mes' => $ano_mes
            ]);
            $leituras_aut = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (!empty($leituras_aut)) {
                $ano_mes_consultado = $ano_mes;
                break;
            }

            $mes--;
            if ($mes === 0) {
                $mes = 12;
                $ano--;
            }
        }

        // Ajuste de período (mensagem de fallback)
        $ano_mes_requisitado = (int) sprintf('%04d%02d', $anoRequisitado, $mesRequisitado);
        if ($ano_mes_consultado !== null && $ano_mes_consultado !== $ano_mes_requisitado) {
            $mensagem = "Não encontramos leituras para {$mesRequisitado}/{$anoRequisitado}. " .
                        "As últimas disponíveis são de " .
                        substr($ano_mes_consultado, 4, 2) . "/" . substr($ano_mes_consultado, 0, 4) . ".";
        }
    }

    // Dados da piscina
    $stmt = $pdo->prepare("SELECT p.nome AS nome_piscina, e.nome AS nome_local
                           FROM piscinas p
                           JOIN enderecos e ON p.endereco_id = e.id
                           WHERE p.id = :piscinaID");
    $stmt->execute([':piscinaID' => $piscinaID]);
    $dadosPiscina = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'nome_piscina' => $dadosPiscina['nome_piscina'] ?? 'Nome não encontrado',
        'nome_local' => $dadosPiscina['nome_local'] ?? 'Local não encontrado',
        'leituras_aut' => $leituras_aut,
        'ano_mes_consultado' => $ano_mes_consultado,
        'mensagem_ajuste_periodo' => $mensagem
    ]);
} else {
    echo json_encode(['error' => 'ID da piscina não fornecido.']);
}
