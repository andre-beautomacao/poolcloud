<?php
session_start();
include 'db_connect.php';

if (!isset($_SESSION['UsuarioID'])) {
    http_response_code(403); // Não autorizado
    echo json_encode(['message' => 'Usuário não autorizado']);
    exit;
}

$usuarioID = $_SESSION['UsuarioID'];
$isAdmin = $_SESSION['UsuarioAdmin'] ?? 0;

try {
    if ($isAdmin) {
        // Admin acessa todos os endereços
        $stmt = $pdo->query("SELECT id, nome, tipo, logradouro, cep, cidade, estado FROM enderecos");
    } else {
        // Inclui endereços compartilhados com permissão de visualização
        $sql = "SELECT e.id, e.nome, e.tipo, e.logradouro, e.cep, e.cidade, e.estado
                FROM enderecos e
                LEFT JOIN compartilhamentos c ON c.tipo_item='endereco' AND c.id_item=e.id AND c.id_destino=:usuarioID AND c.permissao IN ('visualizar','editar','admin')
                WHERE e.usuario_id = :usuarioID OR c.id IS NOT NULL";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':usuarioID', $usuarioID, PDO::PARAM_INT);
        $stmt->execute();
    }

    $enderecos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    header('Content-Type: application/json');
    echo json_encode($enderecos);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Erro ao buscar endereços', 'erro' => $e->getMessage()]);
}
