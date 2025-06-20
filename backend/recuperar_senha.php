<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Caminhos para os arquivos do PHPMailer
require '../PHPMailer/src/Exception.php';
require '../PHPMailer/src/PHPMailer.php';
require '../PHPMailer/src/SMTP.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['email'])) {
        include '../backend/db_connect.php';

        $email = trim($_POST['email']);

        // Verifica se o e-mail está cadastrado
        $sql = $pdo->prepare("SELECT id FROM usuarios WHERE email = :email");
        $sql->bindParam(':email', $email);
        $sql->execute();

        if ($sql->rowCount() > 0) {
            // Gera o token de recuperação de senha
            $token = bin2hex(random_bytes(32));

            // Atualiza token no banco
            $stmt = $pdo->prepare("UPDATE usuarios SET token_recuperacao = :token, token_expira = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE email = :email");
            $stmt->bindParam(':token', $token);
            $stmt->bindParam(':email', $email);
            $stmt->execute();

            // Cria o link de recuperação
            $linkRecuperacao = "https://poolcloud.com.br/recuperar.php?token=$token";

            // Envio de e-mail com PHPMailer
            $mail = new PHPMailer(true);

            try {
                //$mail->SMTPDebug = 2; // ou 3 para mais detalhes
                //$mail->Debugoutput = 'html';
                $mail->isSMTP();
                $mail->Host       = 'smtp.titan.email';
                $mail->SMTPAuth   = true;
                $mail->Username   = 'noreply@poolcloud.com.br';
                $mail->Password   = '9>D}W"22,}R{}-v';
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
                $mail->Port       = 465;

                // ✅ CORREÇÃO AQUI: remetente deve ser igual ao Username configurado
                $mail->setFrom('noreply@poolcloud.com.br', 'PoolCloud');

                $mail->addAddress($email);
                $mail->isHTML(true);
                $mail->CharSet = 'UTF-8';
                $mail->Encoding = 'base64';
                $mail->Subject = 'Recuperação de Senha - PoolCloud';
                $mail->Body    = "
                    <p>Olá,</p>
                    <p>Você solicitou a recuperação da sua senha.</p>
                    <p><a href='$linkRecuperacao'>Clique aqui para redefinir sua senha</a></p>
                    <p>Este link é válido por 1 hora.</p>
                ";

                $mail->send();
                echo json_encode(['success' => true, 'message' => 'Link enviado com sucesso.']);
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'message' => "Erro ao enviar e-mail: {$mail->ErrorInfo}"]);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'E-mail não encontrado.']);
        }
    }
}
?>
