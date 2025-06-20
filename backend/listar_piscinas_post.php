<?php
session_start();
include 'db_connect.php';

if (!isset($_SESSION['UsuarioID'])) {
    http_response_code(403); // Não autorizado
    echo json_encode(['message' => 'Usuário não autorizado']);
    exit;
}

if (isset($_POST['id'])) {
    $enderecoID = trim($_POST['id']);

    if (empty($enderecoID)) {
        http_response_code(400); // Bad Request
        echo json_encode(['message' => 'ID do endereço não fornecido']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("SELECT p.id, p.nome, p.volume, e.nome AS local 
                                FROM piscinas p 
                                JOIN enderecos e ON p.endereco_id = e.id 
                                WHERE e.id = :enderecoID");
        $stmt->bindParam(':enderecoID', $enderecoID, PDO::PARAM_INT);
        $stmt->execute();
        $piscinas = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $localNome = count($piscinas) > 0 ? $piscinas[0]['local'] : null;

        if (!$localNome) {
            $stmt = $pdo->prepare("SELECT nome FROM enderecos WHERE id = :enderecoID");
            $stmt->bindParam(':enderecoID', $enderecoID, PDO::PARAM_INT);
            $stmt->execute();
            $localNome = $stmt->fetchColumn();
        }

        header('Content-Type: application/json');
        echo json_encode(['local' => $localNome, 'localID' => $enderecoID,    'piscinas' => $piscinas]);
    } catch (Exception $e) {
        http_response_code(500); // Internal Server Error
        echo json_encode(['message' => 'Erro no servidor: ' . $e->getMessage()]);
    }
} else {
    http_response_code(400); // Bad Request
    echo json_encode(['message' => 'ID do endereço não fornecido']);
}
?>
