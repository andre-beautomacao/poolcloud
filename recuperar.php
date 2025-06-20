<?php
$token = $_GET['token'] ?? '';
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <title>Redefinir Senha</title>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css">
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body class="container mt-5">
  <h3>Redefinir Senha</h3>
  <form id="formNovaSenha">
    <input type="hidden" id="token" value="<?= htmlspecialchars($token) ?>">

    <div class="form-group">
      <label for="novaSenha">Nova Senha</label>
      <input type="password" class="form-control" id="novaSenha" required>
    </div>
    <div class="form-group">
      <label for="confirmarSenha">Confirmar Nova Senha</label>
      <input type="password" class="form-control" id="confirmarSenha" required>
    </div>
    <button type="submit" class="btn btn-primary">Atualizar Senha</button>
  </form>

  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <script>
    $('#formNovaSenha').on('submit', function (e) {
      e.preventDefault();
      const token = $('#token').val();
      const senha = $('#novaSenha').val();
      const confirmar = $('#confirmarSenha').val();

      if (senha !== confirmar) {
        Swal.fire('Erro!', 'As senhas não coincidem.', 'error');
        return;
      }

      $.ajax({
        url: './backend/resetar_senha.php',
        type: 'POST',
        data: {
          token: token,
          nova_senha: senha
        },
        success: function (resposta) {
          if (resposta.success) {
            let segundos = 10;
            Swal.fire({
              icon: 'success',
              title: resposta.message,
              html: `Você será redirecionado para a tela de login em <b>${segundos}</b> segundos.`,
              timer: segundos * 1000,
              timerProgressBar: true,
              allowOutsideClick: false,
              didOpen: () => {
                const content = Swal.getHtmlContainer().querySelector('b');
                const timer = setInterval(() => {
                  segundos--;
                  if (content) content.textContent = segundos;
                  if (segundos <= 0) clearInterval(timer);
                }, 1000);
              },
              willClose: () => {
                window.location.href = './index.php';
              }
            });
          } else {
            Swal.fire('Erro!', resposta.message, 'error');
          }
        },
        error: function (err) {
          console.log(err);
          Swal.fire('Erro!', 'Erro ao atualizar a senha.', 'error');
        }
      });
    });
  </script>
</body>
</html>
