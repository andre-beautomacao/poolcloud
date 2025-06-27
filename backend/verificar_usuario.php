<?php

if ($_POST) {
    if (isset($_POST['email'])) {
        include './db_connect.php';
        $email = trim($_POST['email']);

        $stmt = $pdo->prepare('SELECT id FROM usuarios WHERE email = :email');
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo $row['id'];
            exit;
        } else {
            echo 0;
            exit;
        }
    }
} else {
    header('location: ../index.php');
}
