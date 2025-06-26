<?php

if ($_POST) {
    if (
        isset($_POST['email']) &&
        isset($_POST['senha']) &&
        isset($_POST['nome']) &&
        isset($_POST['telefone'])
    ) {
        include './db_connect.php';

        $nome = trim($_POST['nome']);
        $email = trim($_POST['email']);
        $telefone = trim($_POST['telefone']);
        // Hash de senha usando password_hash
        $senha = password_hash($_POST['senha'], PASSWORD_DEFAULT);

        // Prepara a consulta com placeholders
        $insert = $pdo->prepare("INSERT INTO usuarios (nome, email, telefone, senha) VALUES (:nome, :email, :telefone, :senha)");

        // Bind de forma segura
        $insert->bindParam(':nome', $nome);
        $insert->bindParam(':email', $email);
        $insert->bindParam(':telefone', $telefone);
        $insert->bindParam(':senha', $senha);

        if ($insert->execute()) {
            echo 1;
            exit;
        } else {
            echo 0;
            exit;
        }
    }
} else {
    header('location: ../index.php');
}
?>
