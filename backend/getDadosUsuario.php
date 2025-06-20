<?php
include 'db_connect.php';
session_start();

// Exibir erros
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if (!isset($_SESSION['UsuarioID'])) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Usuário não autenticado']);
    exit;
}

$usuarioID = $_SESSION['UsuarioID'];

// Consultas para recuperar os dados do usuário
$sqlEnderecos = "SELECT id, nome FROM enderecos WHERE usuario_id = :usuarioID";
$sqlPiscinas = "SELECT id, nome, endereco_id FROM piscinas WHERE usuario_id = :usuarioID";

// Consulta para recuperar endereços compartilhados com o usuário
$sqlEnderecosCompartilhados = "
    SELECT e.id, e.nome 
    FROM enderecos e 
    INNER JOIN compartilhamentos c ON e.id = c.endereco_id 
    WHERE c.usuario_id = :usuarioID";
    
$sqlPiscinasCompartilhadas = "
    SELECT p.id, p.nome, p.endereco_id 
    FROM piscinas p 
    INNER JOIN compartilhamentos c ON p.endereco_id = c.endereco_id 
    WHERE c.usuario_id = :usuarioID";

// Prepare as consultas
$stmtEnderecos = $pdo->prepare($sqlEnderecos);
$stmtPiscinas = $pdo->prepare($sqlPiscinas);
$stmtEnderecosCompartilhados = $pdo->prepare($sqlEnderecosCompartilhados);
$stmtPiscinasCompartilhadas = $pdo->prepare($sqlPiscinasCompartilhadas);

// Bind do parâmetro
$stmtEnderecos->bindParam(':usuarioID', $usuarioID);
$stmtPiscinas->bindParam(':usuarioID', $usuarioID);
$stmtEnderecosCompartilhados->bindParam(':usuarioID', $usuarioID);
$stmtPiscinasCompartilhadas->bindParam(':usuarioID', $usuarioID);

// Executa as consultas
$stmtEnderecos->execute();
$stmtPiscinas->execute();
$stmtEnderecosCompartilhados->execute();
$stmtPiscinasCompartilhadas->execute();

// Fetch dos resultados
$enderecos = $stmtEnderecos->fetchAll(PDO::FETCH_ASSOC);
$piscinas = $stmtPiscinas->fetchAll(PDO::FETCH_ASSOC);
$enderecosCompartilhados = $stmtEnderecosCompartilhados->fetchAll(PDO::FETCH_ASSOC);
$piscinasCompartilhadas = $stmtPiscinasCompartilhadas->fetchAll(PDO::FETCH_ASSOC);

// Organizando os dados em uma hierarquia para os endereços do usuário
$hierarquia = [];
foreach ($enderecos as $endereco) {
    $hierarquia[$endereco['id']] = [
        'id' => $endereco['id'],
        'nome' => $endereco['nome'],
        'piscinas' => []
    ];
}

// Associar piscinas aos endereços
foreach ($piscinas as $piscina) {
    $hierarquia[$piscina['endereco_id']]['piscinas'][] = [
        'id' => $piscina['id'],
        'nome' => $piscina['nome']
    ];
}

// Organizando os dados em uma hierarquia para endereços compartilhados
$hierarquiaCompartilhada = [];
foreach ($enderecosCompartilhados as $endereco) {
    $hierarquiaCompartilhada[$endereco['id']] = [
        'id' => $endereco['id'],
        'nome' => $endereco['nome'],
        'piscinas' => []
    ];
}

// Associar piscinas compartilhadas aos endereços
foreach ($piscinasCompartilhadas as $piscina) {
    $hierarquiaCompartilhada[$piscina['endereco_id']]['piscinas'][] = [
        'id' => $piscina['id'],
        'nome' => $piscina['nome']
    ];
}

// Retorno em JSON
header('Content-Type: application/json');
echo json_encode([
    'hierarquia' => array_values($hierarquia),
    'hierarquiaCompartilhada' => array_values($hierarquiaCompartilhada)
]);

// Verificar se houve erro ao codificar JSON
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_last_error_msg();
}
?>
