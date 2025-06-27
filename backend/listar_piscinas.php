<?php
session_start();
include 'db_connect.php';

if (!isset($_SESSION['UsuarioID'])) {
    http_response_code(403);
    echo json_encode(['error' => true, 'message' => 'Usuário não autorizado.']);
    exit;
}

header('Content-Type: application/json');

$usuarioID = $_SESSION['UsuarioID'];
$isAdmin = $_SESSION['UsuarioAdmin'] ?? 0;
$enderecoID = isset($_GET['endereco_id']) ? intval($_GET['endereco_id']) : null;

try {
    $sql = "
        SELECT
            p.id AS piscina_id,
            p.nome AS piscina_nome,
            e.nome AS endereco_nome,
            p.data_hora

        FROM
            piscinas p
        JOIN
            enderecos e ON p.endereco_id = e.id
        LEFT JOIN compartilhamentos c ON c.tipo_item='piscina' AND c.id_item=p.id AND c.id_destino=:usuarioID AND c.permissao IN ('visualizar','editar','admin')
        WHERE 1 = 1";

    // 🔒 Filtro de segurança para usuários comuns
    if (!$isAdmin) {
        $sql .= " AND (e.usuario_id = :usuarioID OR c.id IS NOT NULL)";
    }

    if ($enderecoID) {
        $sql .= " AND p.endereco_id = :enderecoID";
    }

    $stmt = $pdo->prepare($sql);

    // Parâmetro sempre utilizado na junção de compartilhamentos
    $stmt->bindParam(':usuarioID', $usuarioID, PDO::PARAM_INT);

    if (!$isAdmin) {
        // Já foi associado acima
    }

    if ($enderecoID) {
        $stmt->bindParam(':enderecoID', $enderecoID, PDO::PARAM_INT);
    }

    $stmt->execute();
    $piscinas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($piscinas);
} catch (Exception $e) {
    echo json_encode(['error' => true, 'message' => $e->getMessage()]);
}
