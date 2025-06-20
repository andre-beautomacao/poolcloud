<?php
session_start();
require_once 'db_connect.php'; // Inclui a conexão ao banco de dados

// Verifica se a sessão do usuário está ativa
if (!isset($_SESSION['UsuarioID'])) {
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado.']);
    exit;
}

if ($_POST) {
    if (isset($_POST['piscina_id'])) {
        $piscina_id = $_POST['piscina_id'];
        $proprietario_id = $_SESSION['UsuarioID']; // ID do usuário logado

        // Verifica se a piscina pertence ao usuário logado
        $stmt = $pdo->prepare("SELECT id, endereco_id FROM piscinas WHERE id = :piscina_id AND usuario_id = :proprietario_id");
        $stmt->bindParam(':piscina_id', $piscina_id);
        $stmt->bindParam(':proprietario_id', $proprietario_id);
        $stmt->execute();

        // Se a piscina pertence ao usuário logado
        if ($stmt->rowCount() > 0) {
            // Verifica se a piscina tem dispositivos ou leituras associadas
            $checkDependenciesStmt = $pdo->prepare("SELECT COUNT(*) FROM dispositivos WHERE piscina_id = :piscina_id");
            $checkDependenciesStmt->bindParam(':piscina_id', $piscina_id);
            $checkDependenciesStmt->execute();
            $dispositivosCount = $checkDependenciesStmt->fetchColumn();

            $checkLeiturasStmt = $pdo->prepare("SELECT COUNT(*) FROM leituras WHERE piscina_id = :piscina_id");
            $checkLeiturasStmt->bindParam(':piscina_id', $piscina_id);
            $checkLeiturasStmt->execute();
            $leiturasCount = $checkLeiturasStmt->fetchColumn();

            // Se houver dispositivos ou leituras, não pode excluir
            if ($dispositivosCount > 0 || $leiturasCount > 0) {
                // Exibe um alerta de erro utilizando o SweetAlert
                echo "<script>
                        Swal.fire({
                            icon: 'error',
                            title: 'Erro',
                            text: 'Não é possível excluir a piscina. Existem dispositivos ou leituras associadas a ela.'
                        });
                      </script>";
                exit;
            }

            // Exclui a piscina
            $deleteStmt = $pdo->prepare("DELETE FROM piscinas WHERE id = :piscina_id");
            $deleteStmt->bindParam(':piscina_id', $piscina_id);

            if ($deleteStmt->execute()) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                // Exibe um alerta de sucesso utilizando o SweetAlert
                echo "<script>
                        Swal.fire({
                            icon: 'success',
                            title: 'Sucesso',
                            text: 'Piscina deletada com sucesso!',
                            footer: 'Endereço ID: " . $row['endereco_id'] . "'
                        });
                      </script>";
            } else {
                // Exibe um alerta de erro utilizando o SweetAlert
                echo "<script>
                        Swal.fire({
                            icon: 'error',
                            title: 'Erro',
                            text: 'Erro ao deletar a piscina.'
                        });
                      </script>";
            }
        } else {
            // Se o usuário não for o proprietário
            echo "<script>
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro',
                        text: 'Você não tem permissão para deletar esta piscina.'
                    });
                  </script>";
        }
    } else {
        // Se não houver ID da piscina fornecido
        echo "<script>
                Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: 'ID da piscina não fornecido.'
                });
              </script>";
    }
}
?>
