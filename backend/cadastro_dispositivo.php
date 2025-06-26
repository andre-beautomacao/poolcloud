<?php
session_start();
include 'db_connect.php'; // Inclua o arquivo de conexão com o banco de dados

if (!isset($_SESSION['UsuarioID'])) {
    http_response_code(403); // Não autorizado
    echo 'Usuário não autorizado.';
    exit;
}

// Verifica se os campos obrigatórios foram enviados
if (
    isset($_POST['tipo']) &&
    isset($_POST['modelo']) &&
    isset($_POST['mac1']) &&
    isset($_POST['mac2']) &&
    isset($_POST['piscina_id'])
) {
    $tipo = trim($_POST['tipo']);
    $modelo = trim($_POST['modelo']);
    $mac1 = trim($_POST['mac1']);
    $mac2 = trim($_POST['mac2']);
    $piscina_id = intval($_POST['piscina_id']);
    $temp_habilitada = isset($_POST['temp_habilitada']) ? intval($_POST['temp_habilitada']) : 0;

    // Valida os endereços MAC (apenas caracteres alfanuméricos e 12 caracteres)
    $macRegex = '/^[0-9A-Fa-f]{12}$/';
    if (!preg_match($macRegex, $mac1) || !preg_match($macRegex, $mac2)) {
        http_response_code(400); // Requisição inválida
        echo 'Os endereços MAC devem conter apenas 12 caracteres alfanuméricos (sem separadores).';
        exit;
    }

    // Verifica se o usuário tem acesso à piscina selecionada
    $queryVerifica = "
        SELECT COUNT(*) as total
        FROM piscinas
        WHERE id = :piscina_id AND usuario_id = :usuario_id
    ";
    $stmtVerifica = $pdo->prepare($queryVerifica);
    $stmtVerifica->bindParam(':piscina_id', $piscina_id);
    $stmtVerifica->bindParam(':usuario_id', $_SESSION['UsuarioID']);
    $stmtVerifica->execute();
    $verificacao = $stmtVerifica->fetch(PDO::FETCH_ASSOC);

    if ($verificacao['total'] == 0) {
        http_response_code(403); // Não autorizado
        echo 'Você não tem permissão para adicionar dispositivos a esta piscina.';
        exit;
    }

    // Captura os dados das entradas digitais (de di01 até di08)
    $digitalInputs = [];
    for ($i = 1; $i <= 8; $i++) {
        $index = $i < 10 ? '0' . $i : $i;
        $digitalInputs["di{$index}_nome"] = isset($_POST["di{$index}_nome"]) ? trim($_POST["di{$index}_nome"]) : '';
        $digitalInputs["di{$index}_tipo"] = isset($_POST["di{$index}_tipo"]) ? intval($_POST["di{$index}_tipo"]) : 0;
    }

    $usuario_id = $_SESSION['UsuarioID']; // Obtém o ID do usuário logado

    // Insere os dados na tabela dispositivos, incluindo o novo campo temp_habilitada
    $queryInserir = "
        INSERT INTO dispositivos
        (usuario_id, tipo, modelo, mac1, mac2, piscina_id, temp_habilitada,
         di01_nome, di01_tipo, di02_nome, di02_tipo, di03_nome, di03_tipo,
         di04_nome, di04_tipo, di05_nome, di05_tipo, di06_nome, di06_tipo,
         di07_nome, di07_tipo, di08_nome, di08_tipo)
        VALUES
        (:usuario_id, :tipo, :modelo, :mac1, :mac2, :piscina_id, :temp_habilitada,
         :di01_nome, :di01_tipo, :di02_nome, :di02_tipo, :di03_nome, :di03_tipo,
         :di04_nome, :di04_tipo, :di05_nome, :di05_tipo, :di06_nome, :di06_tipo,
         :di07_nome, :di07_tipo, :di08_nome, :di08_tipo)
    ";

    $stmtInserir = $pdo->prepare($queryInserir);
    $stmtInserir->bindParam(':usuario_id', $usuario_id, PDO::PARAM_INT);
    $stmtInserir->bindParam(':tipo', $tipo);
    $stmtInserir->bindParam(':modelo', $modelo);
    $stmtInserir->bindParam(':mac1', $mac1);
    $stmtInserir->bindParam(':mac2', $mac2);
    $stmtInserir->bindParam(':piscina_id', $piscina_id, PDO::PARAM_INT);
    $stmtInserir->bindParam(':temp_habilitada', $temp_habilitada, PDO::PARAM_INT);

    // Vincula os parâmetros das entradas digitais
    foreach ($digitalInputs as $campo => $valor) {
        $stmtInserir->bindValue(":$campo", $valor);
    }

    // Executa
    if ($stmtInserir->execute()) {
        echo 'Dispositivo cadastrado com sucesso!';
    } else {
        http_response_code(500); // Erro interno
        echo 'Erro ao cadastrar o dispositivo.';
    }
} else {
    http_response_code(400); // Requisição inválida
    echo 'Todos os campos são obrigatórios.';
}
?>
