<?php
session_start();
include 'db_connect.php'; // Inclua sua conexão com o banco de dados

// Verifica se o usuário está autenticado
if (!isset($_SESSION['UsuarioID'])) {
    http_response_code(403); // Não autorizado
    echo json_encode(['message' => 'Usuário não autorizado']);
    exit;
}

// Verifica se o ID do dispositivo foi fornecido
if (isset($_POST['id'])) {
    $dispositivoID = trim($_POST['id']);
    $usuarioID = $_SESSION['UsuarioID'];

    // Prepara a consulta para buscar o dispositivo com base no ID e validar o usuário
    $stmt = $pdo->prepare("
        SELECT 
            dispositivos.id, 
            dispositivos.tipo, 
            dispositivos.modelo, 
            dispositivos.mac1, 
            dispositivos.mac2,
            dispositivos.temp_habilitada,
            dispositivos.di01_nome, dispositivos.di01_tipo, 
            dispositivos.di02_nome, dispositivos.di02_tipo, 
            dispositivos.di03_nome, dispositivos.di03_tipo, 
            dispositivos.di04_nome, dispositivos.di04_tipo, 
            dispositivos.di05_nome, dispositivos.di05_tipo, 
            dispositivos.di06_nome, dispositivos.di06_tipo, 
            dispositivos.di07_nome, dispositivos.di07_tipo,
            dispositivos.di08_nome, dispositivos.di08_tipo,
            dispositivos.ai01_funcao, dispositivos.ai02_funcao,
            dispositivos.ai03_funcao, dispositivos.ai04_funcao,
            dispositivos.piscina_id
        FROM dispositivos
        JOIN piscinas ON dispositivos.piscina_id = piscinas.id
        WHERE dispositivos.id = :dispositivoID AND piscinas.usuario_id = :usuarioID
    ");
    $stmt->bindParam(':dispositivoID', $dispositivoID, PDO::PARAM_INT);
    $stmt->bindParam(':usuarioID', $usuarioID, PDO::PARAM_INT);
    $stmt->execute();

    // Busca o resultado
    $dispositivo = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($dispositivo) {
        // Retorna os dados do dispositivo em JSON
        header('Content-Type: application/json');
        echo json_encode($dispositivo);
    } else {
        http_response_code(404); // Não encontrado
        echo json_encode(['message' => 'Dispositivo não encontrado ou não autorizado']);
    }
} else {
    http_response_code(400); // Solicitação inválida
    echo json_encode(['message' => 'ID do dispositivo não fornecido']);
}
?>
