<?php
// Definindo as configurações de conexão
$host = 'localhost'; // Endereço do servidor
$dbname = 'poolcl46_poolcloud'; // Nome do banco de dados
$username = 'poolcl46_andresilva986'; // Usuário do banco de dados
$password = 'W2QhcgaKYL95T@5'; // Senha do banco de dados (deixe vazio se for local)

// Criando a conexão com o banco de dados usando PDO
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    // Configurar o modo de erro do PDO para exceção
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo "Erro de conexão: " . $e->getMessage();
}
?>
