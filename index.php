<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PoolCloud</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/css/toastr.min.css">
    <link rel="stylesheet" href="./login.css">
</head>

<body>
    <!-- CARD DE LOGIN -->
    <div class="text-center pt-5">
        <a href="https://q1a.com.br/" target="__blank" class="nav-link"><code><i class="fab fa-github-alt"></i> Desenvolvido por Q1 Ambiental</code></a>
    </div>
    <div class="row justify-content-center">
        <div>
            <div class="card mb-3 shadow login" id="cardLogin" style="max-width: 540px;">
                <div class="row no-gutters">
                    <div class="col-md-4 align-self-center d-none d-md-block">
                        <img src="./app/storage/logoq1.png" class="card-img" alt="...">
                    </div>
                    <div class="col-md-8">
                        <div class="card-body">
                            <h5 class="card-title">PoolCloud - Login</h5>
                            <div class="row">
                                <div class="col-md-12 form-group">
                                    <label for="login"><small>Email</small></label>
                                    <input type="email" class="form-control" name="email" id="email" required placeholder="Digite seu email">
                                </div>
                                <div class="col-md-12 form-group">
                                    <label for="senha"><small>Senha</small></label>
                                    <input type="password" class="form-control" name="senha" id="senha" required placeholder="Digite sua senha">
                                </div>
                                <div class="ml-3 col-md-12 form-group form-check">
                                    <input type="checkbox" class="form-check-input" id="check">
                                    <label for="check" class="form-check-label"><small>Lembrar-me</small></label>
                                </div>
                                <div class="col-md-12">
                                    <button type="button" class="btn btn-primary btn-block" onclick="login()">Entrar</button>
                                </div>
                                <div class="col-md-2 mt-3 text-center">
                                    <div class="spinner-grow text-primary" id="loading" role="status">
                                        <span class="sr-only">Carregando...</span>
                                    </div>
                                </div>
                                <div class="col-md-12 mt-4">
                                    <a href="#" data-toggle="modal" data-target="#modalRecuperacaoSenha">Esqueci minha senha</a>
                                </div>
                                <div class="col-md-12 mt-4">
                                    <a href="#" onclick="fnToggle('cardCadastro', 'cardLogin')">Não tenho uma conta</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- CARD DE CADASTRO -->
            <div class="card mb-3 shadow login" id="cardCadastro" style="max-width: 540px; display: none">
                <div class="row no-gutters">
                    <div class="col-md-4 align-self-center d-none d-md-block">
                        <img src="./app/storage/logoq1.png" class="card-img" alt="...">
                    </div>
                    <div class="col-md-8">
                        <div class="card-body">
                            <h5 class="card-title">PoolCloud - Cadastro</h5>
                            <div class="row">
                                <div class="col-md-12 form-group">
                                    <label for="nome">Nome</label>
                                    <input type="text" class="form-control" name="nome" id="nome" placeholder="Digite seu nome">
                                </div>
                                <div class="col-md-12 form-group">
                                    <label for="email2"><small>E-mail</small></label>
                                    <input type="email" class="form-control" name="email2" id="email2" placeholder="Digite seu login" onblur="verificar_usuario(this.value)">
                                </div>
                                <div class="col-md-12 form-group">
                                    <label for="telefone"><small>Telefone</small></label>
                                    <input type="tel" class="form-control" name="telefone" id="telefone" placeholder="DDD + número">
                                </div>
                                <div class="col-md-12 form-group">
                                    <label for="senha2"><small>Senha</small></label>
                                    <input type="password" class="form-control" name="senha2" id="senha2" placeholder="Digite sua senha">
                                </div>
                                <div class="col-md-12 form-group">
                                    <label for="confirmaSenha"><small>Confirma Senha 
                                        <i id="certo" class="fas fa-check text-success"></i>
                                        <i id="errado" class="fas fa-times text-danger"></i></small>
                                    </label>
                                    <input type="password" class="form-control" name="confirmaSenha" id="confirmaSenha" placeholder="Confirme sua senha" onkeyup="verificar_senha(this.value)">
                                </div>
                                <div class="col-5 my-2">
                                    <button type="button" class="btn btn-danger btn-block" onclick="fnToggle('cardLogin', 'cardCadastro')">Cancelar</button>
                                </div>
                                <div class="col-7 my-2">
                                    <button id="btnCadastrar" type="button" class="btn btn-primary btn-block" onclick="cadastrar_usuario()" disabled>Cadastrar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>



        </div>
    </div>

    <!-- Modal de Recuperação de Senha -->
    <div class="modal fade" id="modalRecuperacaoSenha" tabindex="-1" role="dialog" aria-labelledby="modalRecuperacaoSenhaLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalRecuperacaoSenhaLabel">Recuperação de Senha</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                <form id="formRecuperacaoSenha">
                    <div class="form-group">
                        <label for="emailRecuperacao">Digite seu e-mail</label>
                         <input type="email" class="form-control" id="emailRecuperacao" required placeholder="Seu e-mail">
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Enviar link de recuperação</button>

                    <!-- Spinner oculto -->
                    <div id="spinnerRecuperacao" class="text-center mt-3" style="display: none;">
                        <div class="spinner-border text-primary" role="status">
                            <span class="sr-only">Enviando...</span>
                        </div>
                    </div>

                    </form>

                    <div id="mensagemRecuperacao" class="mt-3"></div>

                </div>
            </div>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/js/toastr.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@9"></script>
    <script src="https://kit.fontawesome.com/5ae85dff3f.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.inputmask/5.0.9/jquery.inputmask.min.js"></script>


    <script src="./login.js"></script>

</body>

</html>
