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
            p.last_ph,
            p.last_cloro_livre,
            p.last_alcalinidade,
            p.data_hora,
            d.ph AS ph,
            d.orp AS orp,
            d.temperatura AS temperatura,
            d.setpoint,
            d.digipot,
            d.tensao,
            d.corrente,
            d.temp_habilitada,
            d.data_hora AS data_hora_automatic,

            -- Entradas digitais
            d.di01_nome, d.di01_tipo, d.di01_status,
            d.di02_nome, d.di02_tipo, d.di02_status,
            d.di03_nome, d.di03_tipo, d.di03_status,
            d.di04_nome, d.di04_tipo, d.di04_status,
            d.di05_nome, d.di05_tipo, d.di05_status,
            d.di06_nome, d.di06_tipo, d.di06_status,
            d.di07_nome, d.di07_tipo, d.di07_status,
            d.di08_nome, d.di08_tipo, d.di08_status,
            d.ai01_nome, d.ai01_escala,
            d.ai02_nome, d.ai02_escala,
            d.ai03_nome, d.ai03_escala,
            d.ai04_nome, d.ai04_escala

        FROM 
            piscinas p
        JOIN 
            enderecos e ON p.endereco_id = e.id
        LEFT JOIN 
            dispositivos d ON p.id = d.piscina_id
        WHERE 1 = 1
    ";

    // 🔒 Filtro de segurança para usuários comuns
    if (!$isAdmin) {
        $sql .= " AND e.usuario_id = :usuarioID";
    }

    if ($enderecoID) {
        $sql .= " AND p.endereco_id = :enderecoID";
    }

    $stmt = $pdo->prepare($sql);

    if (!$isAdmin) {
        $stmt->bindParam(':usuarioID', $usuarioID, PDO::PARAM_INT);
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
