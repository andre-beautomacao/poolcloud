<?php
header('Content-Type: application/json');
include 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $_POST['token'] ?? '';
    $novaSenha = $_POST['nova_senha'] ?? '';

    if (empty($token) || empty($novaSenha)) {
        echo json_encode(['success' => false, 'message' => 'Token ou senha não fornecidos.']);
        exit;
    }

    // Verifica se o token ainda é válido
    $sql = $pdo->prepare("SELECT id FROM usuarios WHERE token_recuperacao = :token AND token_expira > NOW()");
    $sql->bindParam(':token', $token);
    $sql->execute();

    if ($sql->rowCount() === 1) {
        $usuario = $sql->fetch();
        // Gera novo hash de senha de forma segura
        $novaSenhaHash = password_hash($novaSenha, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE usuarios SET senha = :senha, token_recuperacao = NULL, token_expira = NULL WHERE id = :id");
        $stmt->bindParam(':senha', $novaSenhaHash);
        $stmt->bindParam(':id', $usuario['id']);
        $stmt->execute();

        echo json_encode(['success' => true, 'message' => 'Senha atualizada com sucesso.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Token inválido ou expirado.']);
    }
}
?>
