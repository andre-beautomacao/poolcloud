<?php
session_start();
include 'db_connect.php'; // Inclua sua conexão com o banco de dados

if (!isset($_SESSION['UsuarioID'])) {
    http_response_code(403); // Não autorizado
    echo json_encode(['message' => 'Usuário não autorizado']);
    exit;
}

if (isset($_POST['id'])) {
    $piscinaID = trim($_POST['id']);
    $usuarioID = $_SESSION['UsuarioID'];

    // Busca a piscina e o endereço correspondente
    $stmt = $pdo->prepare("
        SELECT piscinas.id, piscinas.nome, piscinas.volume, piscinas.controle_cloro, piscinas.controle_ph, piscinas.endereco_id AS local_id, enderecos.logradouro AS local_nome 
        FROM piscinas 
        JOIN enderecos ON piscinas.endereco_id = enderecos.id 
        WHERE piscinas.id = :piscinaID
    ");
    $stmt->bindParam(':piscinaID', $piscinaID, PDO::PARAM_INT);
    $stmt->execute();

    $piscina = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($piscina) {
        header('Content-Type: application/json');
        echo json_encode($piscina);
    } else {
        http_response_code(404); // Não encontrado
        echo json_encode(['message' => 'Piscina não encontrada']);
    }
} else {
    http_response_code(400); // Solicitação inválida
    echo json_encode(['message' => 'ID da piscina não fornecido']);
}
?>
