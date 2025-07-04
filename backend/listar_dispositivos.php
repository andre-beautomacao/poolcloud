<?php
require_once 'db_connect.php';
session_start();

if (!isset($_SESSION['UsuarioID'])) {
    echo json_encode(['error' => 'Usuário não autenticado']);
    exit;
}

$usuario_id = $_SESSION['UsuarioID'];
$is_admin = $_SESSION['UsuarioAdmin'] ?? 0;
$piscina_id = isset($_GET['piscina_id']) ? intval($_GET['piscina_id']) : null;

try {
    if ($piscina_id) {
        $sql = "
            SELECT
                d.id AS dispositivo_id,
                d.nome AS dispositivo_nome,
                d.tipo,
                d.mac1,
                d.mac2,
                d.temp_habilitada,
                d.ph,
                d.orp,
                d.temperatura,
                d.setpoint,
                d.digipot,
                d.tensao,
                d.corrente,
                d.data_hora,
                p.nome AS piscina_nome,
                e.nome AS endereco_nome,
                d.di01_nome, d.di01_tipo, d.di01_status,
                d.di02_nome, d.di02_tipo, d.di02_status,
                d.di03_nome, d.di03_tipo, d.di03_status,
                d.di04_nome, d.di04_tipo, d.di04_status,
                d.di05_nome, d.di05_tipo, d.di05_status,
                d.di06_nome, d.di06_tipo, d.di06_status,
                d.di07_nome, d.di07_tipo, d.di07_status,
                d.di08_nome, d.di08_tipo, d.di08_status
            FROM dispositivos d
            INNER JOIN piscinas p ON d.piscina_id = p.id
            INNER JOIN enderecos e ON p.endereco_id = e.id
        ";

        if (!$is_admin) {
            $sql .= " LEFT JOIN compartilhamentos c ON c.tipo_item='dispositivo' AND c.id_item=d.id AND c.id_destino=:usuario_id AND c.permissao IN ('visualizar','editar','admin')";
            $sql .= " WHERE (e.usuario_id = :usuario_id OR c.id IS NOT NULL) AND d.piscina_id = :piscina_id";
        } else {
            $sql .= " WHERE d.piscina_id = :piscina_id";
        }

        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':piscina_id', $piscina_id, PDO::PARAM_INT);
        if (!$is_admin) {
            $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_INT);
        }
    } else {
        $sql = "
            SELECT
                d.id AS dispositivo_id,
                d.nome AS dispositivo_nome,
                d.tipo,
                d.mac1,
                d.mac2,
                d.temp_habilitada,
                d.ph,
                d.orp,
                d.temperatura,
                d.setpoint,
                d.digipot,
                d.tensao,
                d.corrente,
                d.data_hora,
                p.nome AS piscina_nome,
                e.nome AS endereco_nome,
                d.di01_nome, d.di01_tipo, d.di01_status,
                d.di02_nome, d.di02_tipo, d.di02_status,
                d.di03_nome, d.di03_tipo, d.di03_status,
                d.di04_nome, d.di04_tipo, d.di04_status,
                d.di05_nome, d.di05_tipo, d.di05_status,
                d.di06_nome, d.di06_tipo, d.di06_status,
                d.di07_nome, d.di07_tipo, d.di07_status,
                d.di08_nome, d.di08_tipo, d.di08_status
            FROM dispositivos d
            INNER JOIN piscinas p ON d.piscina_id = p.id
            INNER JOIN enderecos e ON p.endereco_id = e.id
        ";

        if (!$is_admin) {
            $sql .= " LEFT JOIN compartilhamentos c ON c.tipo_item='dispositivo' AND c.id_item=d.id AND c.id_destino=:usuario_id AND c.permissao IN ('visualizar','editar','admin')";
            $sql .= " WHERE e.usuario_id = :usuario_id OR c.id IS NOT NULL";
        }

        $stmt = $pdo->prepare($sql);
        if (!$is_admin) {
            $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_INT);
        }

    }

    $stmt->execute();
    $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($piscina_id) {
        $piscinaQuery = $pdo->prepare("SELECT nome FROM piscinas WHERE id = :piscina_id");
        $piscinaQuery->bindParam(':piscina_id', $piscina_id, PDO::PARAM_INT);
        $piscinaQuery->execute();
        $piscinaNome = $piscinaQuery->fetchColumn();

        echo json_encode(['piscina_nome' => $piscinaNome, 'dispositivos' => $resultados]);
    } else {
        echo json_encode($resultados);
    }
} catch (PDOException $e) {
    echo json_encode(['error' => 'Erro ao buscar dispositivos: ' . $e->getMessage()]);
}
