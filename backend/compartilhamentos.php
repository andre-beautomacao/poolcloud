<?php
session_start();
require_once 'db_connect.php';
require_once 'permissions.php';

header('Content-Type: application/json');

if (!isset($_SESSION['UsuarioID'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Usuário não autenticado']);
    exit;
}

$usuarioID = $_SESSION['UsuarioID'];
$action = $_GET['action'] ?? $_POST['action'] ?? 'listar';

switch ($action) {
    case 'listar':
        $tipo = $_GET['tipo_item'] ?? null;
        $id   = isset($_GET['id_item']) ? intval($_GET['id_item']) : 0;

        if (!$tipo || !$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Parâmetros inválidos']);
            exit;
        }

        $dono = obterDonoItem($pdo, $tipo, $id);
        if ($dono != $usuarioID) {
            http_response_code(403);
            echo json_encode(['error' => 'Acesso negado']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT c.id, u.nome, u.email, c.permissao FROM compartilhamentos c JOIN usuarios u ON u.id = c.id_destino WHERE c.tipo_item = :tipo AND c.id_item = :id");
        $stmt->execute([':tipo' => $tipo, ':id' => $id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'adicionar':
        $tipo = $_POST['tipo_item'] ?? null;
        $idItem = isset($_POST['id_item']) ? intval($_POST['id_item']) : 0;
        $destino = isset($_POST['id_destino']) ? intval($_POST['id_destino']) : 0;
        $permissao = $_POST['permissao'] ?? 'visualizar';

        if (!$tipo || !$idItem || !$destino) {
            http_response_code(400);
            echo json_encode(['error' => 'Dados incompletos']);
            exit;
        }

        if (obterDonoItem($pdo, $tipo, $idItem) != $usuarioID) {
            http_response_code(403);
            echo json_encode(['error' => 'Você não é o dono do recurso']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO compartilhamentos (id_item, tipo_item, id_dono, id_destino, permissao, criado_em) VALUES (:item, :tipo, :dono, :destino, :permissao, NOW())");
        $ok = $stmt->execute([
            ':item' => $idItem,
            ':tipo' => $tipo,
            ':dono' => $usuarioID,
            ':destino' => $destino,
            ':permissao' => $permissao
        ]);

        echo json_encode(['success' => $ok]);
        break;

    case 'atualizar':
        $compId = isset($_POST['id']) ? intval($_POST['id']) : 0;
        $permissao = $_POST['permissao'] ?? null;

        if (!$compId || !$permissao) {
            http_response_code(400);
            echo json_encode(['error' => 'Dados inválidos']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT id_item, tipo_item FROM compartilhamentos WHERE id = :id");
        $stmt->execute([':id' => $compId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row || obterDonoItem($pdo, $row['tipo_item'], $row['id_item']) != $usuarioID) {
            http_response_code(403);
            echo json_encode(['error' => 'Acesso negado']);
            exit;
        }

        $upd = $pdo->prepare("UPDATE compartilhamentos SET permissao = :permissao WHERE id = :id");
        $ok = $upd->execute([':permissao' => $permissao, ':id' => $compId]);
        echo json_encode(['success' => $ok]);
        break;

    case 'remover':
        $compId = isset($_POST['id']) ? intval($_POST['id']) : 0;
        if (!$compId) {
            http_response_code(400);
            echo json_encode(['error' => 'ID inválido']);
            exit;
        }
        $stmt = $pdo->prepare("SELECT id_item, tipo_item FROM compartilhamentos WHERE id = :id");
        $stmt->execute([':id' => $compId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row || obterDonoItem($pdo, $row['tipo_item'], $row['id_item']) != $usuarioID) {
            http_response_code(403);
            echo json_encode(['error' => 'Acesso negado']);
            exit;
        }
        $del = $pdo->prepare("DELETE FROM compartilhamentos WHERE id = :id");
        $ok = $del->execute([':id' => $compId]);
        echo json_encode(['success' => $ok]);
        break;

    case 'meus':
        $stmt = $pdo->prepare("SELECT c.id, c.tipo_item, c.id_item, c.permissao FROM compartilhamentos c WHERE c.id_destino = :id");
        $stmt->execute([':id' => $usuarioID]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    default:
        http_response_code(400);
        echo json_encode(['error' => 'Ação desconhecida']);
}
?>
