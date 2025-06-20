<?php

if ($_POST) {
        $sql = $pdo->prepare("ALTER TABLE dispositivos AUTO_INCREMENT  = 1");

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
    }else {
        header('location: ../index.php');
    }