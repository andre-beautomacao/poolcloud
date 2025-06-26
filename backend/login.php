<?php

if ($_POST) {
    if (isset($_POST['email']) && isset($_POST['senha'])) {
        include './db_connect.php';

        $email = trim($_POST['email']);
        $senha = trim($_POST['senha']);

        $consulta = $pdo->prepare("SELECT * FROM usuarios WHERE email = :email LIMIT 1");
        $consulta->bindValue(':email', $email);
        $consulta->execute();

        if ($consulta->rowCount() > 0) {
            $row = $consulta->fetch(PDO::FETCH_ASSOC);

            if (password_verify($senha, $row['senha'])) {
                session_start();
                $_SESSION['UsuarioID'] = $row['id'];
                $_SESSION['UsuarioEmail'] = $row['email'];
                $_SESSION['UsuarioNome'] = $row['nome'];
                $_SESSION['UsuarioAdmin'] = $row['is_admin'];
                echo 1;
                exit;
            }
        }

        echo 0;
        exit;
    }
} else {
    header('location: ../index.php');
}
