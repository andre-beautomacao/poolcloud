<?php
if ($_POST) {
    $token = $_POST['token'];
    $nova_senha = password_hash($_POST['senha'], PASSWORD_DEFAULT);

    include 'conexao.php';
    // Verifica o token
    $sql = $pdo->prepare("SELECT idusuario FROM recuperacao_senha WHERE token = :token");
    $sql->bindParam(':token', $token);
    $sql->execute();
    $usuario = $sql->fetch(PDO::FETCH_ASSOC);

    if ($usuario) {
        // Atualiza a senha
        $update = $pdo->prepare("UPDATE usuarios SET senha = :senha WHERE idusuario = :idusuario");
        $update->bindParam(':senha', $nova_senha);
        $update->bindParam(':idusuario', $usuario['idusuario']);
        $update->execute();

        // Apaga o token
        $delete = $pdo->prepare("DELETE FROM recuperacao_senha WHERE token = :token");
        $delete->bindParam(':token', $token);
        $delete->execute();

        echo "Senha alterada com sucesso!";
    } else {
        echo "Token inválido.";
    }
}
?>
