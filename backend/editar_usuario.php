<?php
session_start();
include 'db_connect.php'; // Inclua sua conexão com o banco de dados

// Verifique se o usuário está logado
if (!isset($_SESSION['UsuarioID'])) {
    http_response_code(403); // Não autorizado
    echo json_encode(['message' => 'Usuário não autorizado']);
    exit;
}

// Obtém o ID do usuário da sessão
$usuarioID = $_SESSION['UsuarioID'];

// Verifique se todos os dados necessários foram enviados
if (isset($_POST['nome'], $_POST['email'])) {
    $nome = trim($_POST['nome']);
    $email = trim($_POST['email']);
    $novaSenha = isset($_POST['senha']) ? trim($_POST['senha']) : null;

    try {
        // Inicie uma transação
        $pdo->beginTransaction();

        // Atualize o nome e o email do usuário
        $stmt = $pdo->prepare("UPDATE usuarios SET nome = :nome, email = :email WHERE id = :usuarioID");
        $stmt->bindParam(':nome', $nome);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':usuarioID', $usuarioID);
        $stmt->execute();

        // Se uma nova senha foi fornecida, atualize a senha
        if ($novaSenha) {
            // Utiliza password_hash para armazenar a senha de forma segura
            $senhaHashed = password_hash($novaSenha, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("UPDATE usuarios SET senha = :senha WHERE id = :usuarioID");
            $stmt->bindParam(':senha', $senhaHashed);
            $stmt->bindParam(':usuarioID', $usuarioID);
            $stmt->execute();
        }

        // Confirme a transação
        $pdo->commit();

        // Retorne sucesso
        echo json_encode(['success' => true, 'message' => 'Dados atualizados com sucesso!']);

    } catch (Exception $e) {
        // Reverte a transação em caso de erro
        $pdo->rollBack();
        http_response_code(500); // Erro interno do servidor
        echo json_encode(['success' => false, 'message' => 'Erro ao atualizar dados: ' . $e->getMessage()]);
    }

} else {
    http_response_code(400); // Solicitação inválida
    echo json_encode(['success' => false, 'message' => 'Dados incompletos']);
}
?>
