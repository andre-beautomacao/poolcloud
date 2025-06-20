<?php

if ($_POST) {
    if (isset($_POST['deviceid']) && isset($_POST['nomedispositivo']) && isset($_POST['mac1']) && isset($_POST['mac2']) && isset ($_POST['idusuario'])) {
        include './conexao.php';

        $deviceid = $_POST['deviceid'];
        $nomedispositivo = trim($_POST['nomedispositivo']);
        $mac1 = trim($_POST['mac1']);
        $mac2 = trim($_POST['mac2']);
        $idusuario = trim($_POST['idusuario']);

        $sql = $pdo->prepare("update dispositivos set deviceid = '$deviceid', nomedispositivo = '$nomedispositivo', mac1 = '$mac1', mac2 = '$mac2', idusuario = '$idusuario' where deviceid = $deviceid");

        if ($sql->execute()) {
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
