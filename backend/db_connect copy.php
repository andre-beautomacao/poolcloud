<?php
class Database {
    private $host = 'localhost'; // Endereço do servidor
    private $db_name = 'poolcl46_poolcloud'; // Nome do banco de dados
    private $username = 'poolcl46_andresilva986'; // Usuário do banco de dados
    private $password = 'W2QhcgaKYL95T@5'; // Senha do banco de dados (deixe vazio se for local)
    private $conn;
    private static $instance;

    // Implementa o Singleton pattern para a classe Database
    public static function getInstance() {
        if (!self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    // Construtor privado para evitar múltiplas instâncias
    private function __construct() {
        try {
            $this->conn = new PDO("mysql:host={$this->host};dbname={$this->db_name}", $this->username, $this->password);
            // Configurar o modo de erro do PDO para exceção
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            echo "Erro de conexão: " . $exception->getMessage();
        }
    }

    // Método para obter a conexão
    public function getConnection() {
        return $this->conn;
    }
}

// Uso da conexão
$db = Database::getInstance();
$conn = $db->getConnection();

//Incluir nos outros arquivos que precisem da conexão 
/*  include 'db_connect.php';
$conn = Database::getInstance()->getConnection();*/

?>

