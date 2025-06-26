<?php
session_start();
include 'db_connect.php';

if (!isset($_SESSION['UsuarioID'])) {
    header('location: ../../index.php');
    exit;
}

if ($_POST) {
    // Verifica se os campos obrigatórios foram enviados
    if (isset($_POST['id'], $_POST['tipo'], $_POST['modelo'], $_POST['mac1'], $_POST['mac2'], $_POST['piscina_id'])) {
        $id = trim($_POST['id']);
        $tipo = trim($_POST['tipo']);
        $modelo = trim($_POST['modelo']);
        $mac1 = trim($_POST['mac1']);
        $mac2 = trim($_POST['mac2']);
        $piscina_id = trim($_POST['piscina_id']);
        $temp_habilitada = isset($_POST['temp_habilitada']) ? intval($_POST['temp_habilitada']) : 0;

        $usuarioID = $_SESSION['UsuarioID'];

        // Captura os dados das entradas digitais (de di01 até di08)
        $di01_nome = isset($_POST['di01_nome']) ? trim($_POST['di01_nome']) : '';
        $di01_tipo = isset($_POST['di01_tipo']) ? intval($_POST['di01_tipo']) : 0;
        $di02_nome = isset($_POST['di02_nome']) ? trim($_POST['di02_nome']) : '';
        $di02_tipo = isset($_POST['di02_tipo']) ? intval($_POST['di02_tipo']) : 0;
        $di03_nome = isset($_POST['di03_nome']) ? trim($_POST['di03_nome']) : '';
        $di03_tipo = isset($_POST['di03_tipo']) ? intval($_POST['di03_tipo']) : 0;
        $di04_nome = isset($_POST['di04_nome']) ? trim($_POST['di04_nome']) : '';
        $di04_tipo = isset($_POST['di04_tipo']) ? intval($_POST['di04_tipo']) : 0;
        $di05_nome = isset($_POST['di05_nome']) ? trim($_POST['di05_nome']) : '';
        $di05_tipo = isset($_POST['di05_tipo']) ? intval($_POST['di05_tipo']) : 0;
        $di06_nome = isset($_POST['di06_nome']) ? trim($_POST['di06_nome']) : '';
        $di06_tipo = isset($_POST['di06_tipo']) ? intval($_POST['di06_tipo']) : 0;
        $di07_nome = isset($_POST['di07_nome']) ? trim($_POST['di07_nome']) : '';
        $di07_tipo = isset($_POST['di07_tipo']) ? intval($_POST['di07_tipo']) : 0;
        $di08_nome = isset($_POST['di08_nome']) ? trim($_POST['di08_nome']) : '';
        $di08_tipo = isset($_POST['di08_tipo']) ? intval($_POST['di08_tipo']) : 0;

        // Entradas analógicas
        $ai01_funcao = isset($_POST['ai01_funcao']) ? trim($_POST['ai01_funcao']) : '';
        $ai02_funcao = isset($_POST['ai02_funcao']) ? trim($_POST['ai02_funcao']) : '';
        $ai03_funcao = isset($_POST['ai03_funcao']) ? trim($_POST['ai03_funcao']) : '';
        $ai04_funcao = isset($_POST['ai04_funcao']) ? trim($_POST['ai04_funcao']) : '';

        // Prepara o SQL para atualização do dispositivo, incluindo os campos das entradas digitais.
        $stmt = $pdo->prepare("
            UPDATE dispositivos SET
                tipo = :tipo,
                modelo = :modelo,
                mac1 = :mac1, 
                mac2 = :mac2, 
                piscina_id = :piscina_id,
                temp_habilitada = :temp_habilitada,
                di01_nome = :di01_nome, di01_tipo = :di01_tipo,
                di02_nome = :di02_nome, di02_tipo = :di02_tipo,
                di03_nome = :di03_nome, di03_tipo = :di03_tipo,
                di04_nome = :di04_nome, di04_tipo = :di04_tipo,
                di05_nome = :di05_nome, di05_tipo = :di05_tipo,
                di06_nome = :di06_nome, di06_tipo = :di06_tipo,
                di07_nome = :di07_nome, di07_tipo = :di07_tipo,
                di08_nome = :di08_nome, di08_tipo = :di08_tipo,
                ai01_funcao = :ai01_funcao,
                ai02_funcao = :ai02_funcao,
                ai03_funcao = :ai03_funcao,
                ai04_funcao = :ai04_funcao
            WHERE id = :id
              AND piscina_id IN (SELECT id FROM piscinas WHERE usuario_id = :usuarioID)
        ");
        $stmt->bindParam(':tipo', $tipo);
        $stmt->bindParam(':modelo', $modelo);
        $stmt->bindParam(':mac1', $mac1);
        $stmt->bindParam(':mac2', $mac2);
        $stmt->bindParam(':piscina_id', $piscina_id);
        $stmt->bindParam(':temp_habilitada', $temp_habilitada, PDO::PARAM_INT);
        $stmt->bindParam(':di01_nome', $di01_nome);
        $stmt->bindParam(':di01_tipo', $di01_tipo, PDO::PARAM_INT);
        $stmt->bindParam(':di02_nome', $di02_nome);
        $stmt->bindParam(':di02_tipo', $di02_tipo, PDO::PARAM_INT);
        $stmt->bindParam(':di03_nome', $di03_nome);
        $stmt->bindParam(':di03_tipo', $di03_tipo, PDO::PARAM_INT);
        $stmt->bindParam(':di04_nome', $di04_nome);
        $stmt->bindParam(':di04_tipo', $di04_tipo, PDO::PARAM_INT);
        $stmt->bindParam(':di05_nome', $di05_nome);
        $stmt->bindParam(':di05_tipo', $di05_tipo, PDO::PARAM_INT);
        $stmt->bindParam(':di06_nome', $di06_nome);
        $stmt->bindParam(':di06_tipo', $di06_tipo, PDO::PARAM_INT);
        $stmt->bindParam(':di07_nome', $di07_nome);
        $stmt->bindParam(':di07_tipo', $di07_tipo, PDO::PARAM_INT);
        $stmt->bindParam(':di08_nome', $di08_nome);
        $stmt->bindParam(':di08_tipo', $di08_tipo, PDO::PARAM_INT);
        $stmt->bindParam(':ai01_funcao', $ai01_funcao);
        $stmt->bindParam(':ai02_funcao', $ai02_funcao);
        $stmt->bindParam(':ai03_funcao', $ai03_funcao);
        $stmt->bindParam(':ai04_funcao', $ai04_funcao);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':usuarioID', $usuarioID, PDO::PARAM_INT);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Dispositivo atualizado com sucesso!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao atualizar o dispositivo.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Dados insuficientes para editar o dispositivo.']);
    }
}
?>
