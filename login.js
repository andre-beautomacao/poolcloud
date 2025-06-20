// FUNÇÃO QUE VERIFICA LOGIN NO BACKEND
function login() {
    let email = document.querySelector('#email').value; // Alterado para email
    let senha = document.querySelector('#senha').value;
    document.querySelector('#loading').style.display = 'block';

    setTimeout(() => {
        if (email.trim() != '' && senha.trim() != '') {
            $.ajax({
                url: './backend/login.php',
                type: 'post',
                async: true,
                data: {
                    email, // Alterado para email
                    senha
                },
                success: function (result) {
                    if (result == 1) {
                        window.location.href = './app/pages/#piscinas';
                    } else {
                        Swal.fire('Erro!', 'E-mail ou senha incorretos!', 'error');
                        console.log(result);
                    }
                },
                error: function (result) {
                    console.log(result);
                }
            });
        } else {
            Swal.fire('Erro!', 'Digite um e-mail válido!', 'error');
        }
        document.querySelector('#loading').style.display = 'none';
    }, 1000)
}

// FUNÇÃO PARA LOGAR COM ENTER
const enterLogin = document.querySelector('#senha');
enterLogin.addEventListener('keyup', (e) => {
    let tecla = e.which || e.keyCode; // Corrigido para keyCode
    if (tecla == 13) {
        login()
    }
});

// FUNCÃO QUE VERIFICA SE O USUARIO JÁ ESTA CADASTRADO
function verificar_usuario(email) { // Alterado para email
    $.ajax({
        url: './backend/verificar_usuario.php',
        type: 'post',
        async: true,
        data: {
            email // Alterado para email
        },
        success: (resultado) => {
            if (resultado == 1) {
                fnValidar(`login2`, `is-invalid`, `is-valid`);
            } else {
                fnValidar(`login2`, `is-valid`, `is-invalid`);
            }
        },
        error: (resultado) => {
            console.log(resultado);
        }
    });
}

// FUNÇÃO PARA VALIDAR CAMPOS
function fnValidar(id, add, remove) {
    document.querySelector(`#${id}`).classList.add(`${add}`);
    document.querySelector(`#${id}`).classList.remove(`${remove}`);
}

// FUNÇÃO PARA VALIDAR SENHA
function verificar_senha(p) {
    let senha = document.querySelector('#senha2').value;
    if (senha == p) {
        fnValidar(`confirmaSenha`, `is-valid`, `is-invalid`);
        document.querySelector('#btnCadastrar').disabled = false;
    } else {
        fnValidar(`confirmaSenha`, `is-invalid`, `is-valid`);
        document.querySelector('#btnCadastrar').disabled = true;
    }
}

// ALTERNAR ENTRE OS CARDS LOGIN X CADASTRAR
function fnToggle(mostrar, esconder) {
    document.querySelector(`#${mostrar}`).style.display = 'block';
    document.querySelector(`#${esconder}`).style.display = 'none';
}

// FUNÇÃO QUE CADASTRA NOVO USUÁRIO
function cadastrar_usuario() {
    let nome = document.querySelector('#nome').value;
    let email = document.querySelector('#email2').value;
    let telefone = document.querySelector('#telefone').value;
    let senha = document.querySelector('#senha2').value;
    let confirmaSenha = document.querySelector('#confirmaSenha').value;

    // Validação de telefone: apenas números, com 10 ou 11 dígitos
    const telefoneLimpo = telefone.replace(/\D/g, '');
    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
        Swal.fire('Erro!', 'Informe um número de telefone válido com DDD.', 'error');
        return;
    }

    if (senha == confirmaSenha) {
        if (email.trim() != '' && senha.trim() != '') {
            $.ajax({
                url: './backend/cadastro_usuario.php',
                type: 'post',
                async: true,
                data: {
                    nome,
                    email,
                    telefone: telefoneLimpo,
                    senha
                },
                success: function (result) {
                    console.log(result);
                    if (result == 1) {
                        Swal.fire('Sucesso!', 'Usuário cadastrado com sucesso!', 'success');
                        setTimeout(function () {
                            window.location.href = './index.php';
                        }, 3000);
                    } else {
                        Swal.fire('Erro!', 'Esse e-mail já está cadastrado!', 'error');
                        setTimeout(function () {
                            window.location.href = './index.php';
                        }, 3000);
                    }
                },
                error: function (result) {
                    console.log(result);
                    Swal.fire('Erro', 'Usuário não cadastrado!', 'error');
                }
            });
        } else {
            Swal.fire('Erro!', 'Preencha com um e-mail válido!', 'error');
        }
    } else {
        Swal.fire('Erro!', 'As senhas não conferem!', 'error');
    }
}


// RECUPERAR SENHA
document.getElementById('formRecuperacaoSenha').addEventListener('submit', function (e) {
    e.preventDefault();
  
    const email = document.getElementById('emailRecuperacao').value;
    const mensagem = $('#mensagemRecuperacao');
    const spinner = $('#spinnerRecuperacao');
  
    mensagem.html('');        // Limpa mensagens antigas
    spinner.show();           // Mostra o spinner
  
    $.ajax({
      url: './backend/recuperar_senha.php',
      type: 'POST',
      data: { email: email },
      success: function (response) {
        spinner.hide(); // Esconde o spinner
        mensagem.html('<div class="alert alert-success">Um link foi enviado ao seu e-mail, se ele estiver cadastrado.</div>');
      },
      error: function (error) {
        spinner.hide(); // Esconde o spinner
        console.error('Erro ao enviar o e-mail de recuperação:', error);
        mensagem.html('<div class="alert alert-danger">Erro ao processar a solicitação.</div>');
      }
    });
  });
  

// APLICAR MÁSCARA DE TELEFONE AO CAMPO DE CADASTRO
document.addEventListener('DOMContentLoaded', function () {
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        Inputmask({
            mask: ['(99) 9999-9999', '(99) 99999-9999'],
            keepStatic: true
        }).mask(telefoneInput);
    }
});

