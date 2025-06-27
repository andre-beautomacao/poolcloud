<?php
// Funções auxiliares de verificação de permissões

function obterDonoItem(PDO $pdo, string $tipoItem, int $idItem)
{
    switch ($tipoItem) {
        case 'endereco':
            $stmt = $pdo->prepare("SELECT usuario_id FROM enderecos WHERE id = ?");
            break;
        case 'piscina':
            $stmt = $pdo->prepare("SELECT usuario_id FROM piscinas WHERE id = ?");
            break;
        case 'dispositivo':
            $stmt = $pdo->prepare("SELECT usuario_id FROM dispositivos WHERE id = ?");
            break;
        default:
            return null;
    }
    $stmt->execute([$idItem]);
    return $stmt->fetchColumn();
}

function permissaoCompartilhamento(PDO $pdo, int $usuarioID, string $tipoItem, int $idItem)
{
    $stmt = $pdo->prepare("SELECT permissao FROM compartilhamentos WHERE id_destino = :usuario AND tipo_item = :tipo AND id_item = :item");
    $stmt->execute([
        ':usuario' => $usuarioID,
        ':tipo' => $tipoItem,
        ':item' => $idItem
    ]);
    return $stmt->fetchColumn() ?: null;
}

function usuarioTemPermissao(PDO $pdo, int $usuarioID, string $tipoItem, int $idItem, string $requer = 'visualizar'): bool
{
    $dono = obterDonoItem($pdo, $tipoItem, $idItem);
    if ($dono === $usuarioID) {
        return true; // Dono sempre tem permissão total
    }

    $perm = permissaoCompartilhamento($pdo, $usuarioID, $tipoItem, $idItem);
    if (!$perm) {
        return false;
    }

    $niveis = ['visualizar' => 1, 'editar' => 2, 'admin' => 3];
    $nivelAtual = $niveis[$perm] ?? 0;
    $nivelRequer = $niveis[$requer] ?? 0;

    return $nivelAtual >= $nivelRequer;
}
?>
