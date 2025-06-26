<?php
// Definindo as configurações de conexão a partir de variáveis de ambiente ou valores padrão
$dbConfig = [
    'host' => getenv('DB_HOST') ?: 'localhost',
    'dbname' => getenv('DB_NAME') ?: 'poolcl46_poolcloud',
    'username' => getenv('DB_USER') ?: 'poolcl46_andresilva986',
    'password' => getenv('DB_PASS') ?: 'W2QhcgaKYL95T@5',
];

$host = $dbConfig['host'];
$dbname = $dbConfig['dbname'];
$username = $dbConfig['username'];
$password = $dbConfig['password'];

// Criando a conexão com o banco de dados usando PDO
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    // Configurar o modo de erro do PDO para exceção
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo "Erro de conexão: " . $e->getMessage();
}
?>
