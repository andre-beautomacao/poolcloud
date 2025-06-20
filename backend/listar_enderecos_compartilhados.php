<?php
session_start();
include 'db_connect.php'; // Inclua sua conexão com o banco de dados

if (!isset($_SESSION['UsuarioID'])) {
    header('location: ../../index.php');
    exit; // Encerra o script se o usuário não estiver autenticado
}

// Prepara a consulta para buscar endereços compartilhados
$usuarioID = $_SESSION['UsuarioID'];
$stmt = $pdo->prepare("
    SELECT 
        c.id AS comp_partilhamento_id,
        e.nome AS endereco_nome,
        u.nome AS proprietario_nome,
        e.id AS endereco_id
    FROM 
        compartilhamentos c
    JOIN 
        enderecos e ON c.endereco_id = e.id
    JOIN 
        usuarios u ON c.proprietario_id = u.id
    WHERE 
        c.usuario_id = :usuarioID
");
$stmt->bindParam(':usuarioID', $usuarioID);
$stmt->execute();

// Busca os resultados
$resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Retorna os resultados como JSON
echo json_encode($resultados);
?>
