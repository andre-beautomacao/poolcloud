<?php
session_start();

include './conexao.php';

// Ativar modo de erro do PDO para capturar exceções
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

if ($_POST) {
    if (isset($_POST['deviceIdCompartilhado']) && isset($_POST['idusuariocompartilhado'])&& isset($_POST['nomedispositivocompartilhado'])) {
        $deviceid = $_POST['deviceIdCompartilhado'];
        $idusuario = ($_POST['idusuariocompartilhado']);
        $nomedevice = trim($_POST['nomedispositivocompartilhado']);

        // Verificar se a sessão está ativa
        if (isset($_SESSION['UsuarioID'])) {
            $idproprietario = $_SESSION['UsuarioID']; // ID do usuário logado
        } else {
            echo json_encode(['success' => false, 'message' => 'Usuário não autenticado.']);
            exit;
        }

        try {
            // Preparar e executar a inserção no banco de dados
            $insert = $pdo->prepare("INSERT INTO compartilhamentos (idproprietario, idusuario, deviceid, nomedevice) VALUES (:idproprietario,:idusuario, :deviceid, :nomedevice)");
            $insert->bindParam(':idproprietario', $idproprietario);
            $insert->bindParam(':idusuario', $idusuario);
            $insert->bindParam(':deviceid', $deviceid);
            $insert->bindParam(':nomedevice', $nomedevice);

            if ($insert->execute()) {
                echo json_encode(['success' => true, 'message' => 'Dispositivo compartilhado com sucesso!']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Erro ao compartilhar o dispositivo.']);
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
