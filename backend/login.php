<?php

if ($_POST) {
    if (isset($_POST['email']) && isset($_POST['senha'])) {
        include './db_connect.php';

        $email = trim($_POST['email']);
        $senha = trim($_POST['senha']);
        $senhaHash = md5($senha); // Gera o hash MD5 da senha

        $consulta = $pdo->prepare("SELECT * FROM usuarios WHERE email = :email AND senha = :senha LIMIT 1");
        $consulta->bindValue(':email', $email);
        $consulta->bindValue(':senha', $senhaHash);
        $consulta->execute();

        if ($consulta->rowCount() > 0) {
            session_start();
            while ($row = $consulta->fetch(PDO::FETCH_ASSOC)) {
                $_SESSION['UsuarioID'] = $row['id'];
                $_SESSION['UsuarioEmail'] = $row['email'];
                $_SESSION['UsuarioNome'] = $row['nome'];
                $_SESSION['UsuarioAdmin'] = $row['is_admin']; // 👈 novo campo
            }
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
