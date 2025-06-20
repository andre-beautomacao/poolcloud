<?php

if ($_POST) {
    if (isset($_POST['idleitura'])) {
        include './conexao.php';

        $idleitura = $_POST['idleitura'];

        $sql = $pdo->prepare("delete from leituras where idleitura = $idleitura");

        if ($sql->execute()) {
          if ($sql->rowCount() > 0) {
              echo 1;
              exit;
          } else {
              echo 0;
              exit;
          }
        } else {
            echo "Erro, sql não executado!";
        }
    }
} else {
    header('location: ../index.php');
}
