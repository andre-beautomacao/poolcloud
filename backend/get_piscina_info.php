<?php
session_start();
include 'db_connect.php';

if (!isset($_POST['piscina_id'])) {
    echo json_encode(['error' => 'ID da piscina não enviado.']);
    exit;
}

$piscinaID = $_POST['piscina_id'];

try {
    $stmt = $pdo->prepare("
        SELECT p.nome AS nome_piscina, e.nome AS nome_local
        FROM piscinas p
        LEFT JOIN enderecos e ON p.endereco_id = e.id
        WHERE p.id = :piscinaID
    ");
    $stmt->bindParam(':piscinaID', $piscinaID, PDO::PARAM_INT);
    $stmt->execute();

    $dados = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode($dados ?: ['error' => 'Piscina não encontrada.']);
} catch (Exception $e) {
    echo json_encode(['error' => 'Erro ao buscar dados da piscina.']);
}
