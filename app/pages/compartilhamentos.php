<?php
session_start();
if (!isset($_SESSION['UsuarioID'])) {
    header('location: ../../index.php');
    exit;
}

$usuarioNome = $_SESSION['UsuarioNome'];
include '../../includes/header.php';
?>
<nav class="navbar sticky-top navbar-main">
    <div class="navbar-flexfull">
        <a href="index.php" class="btn btn-link nav-hamburger"><i class="fas fa-arrow-left"></i></a>
        <div class="navbar-title-center">
            <span class="navbar-title">Compartilhamentos</span>
        </div>
        <div class="navbar-right">
            <a href="#" id="themeToggle" class="nav-link px-2"><i class="fas fa-adjust"></i></a>
            <div class="dropdown">
                <a href="#" class="dropdown-toggle nav-link px-2" id="dropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <i class="fas fa-user-ninja text-warning"></i> <?= $usuarioNome ?>
                </a>
                <div class="dropdown-menu dropdown-menu-end shadow text-center" aria-labelledby="dropdown">
                    <a href="../../backend/deslogar.php" class="dropdown-item"><i class="fas fa-sign-out-alt text-warning"></i> Sair</a>
                </div>
            </div>
        </div>
    </div>
</nav>
<div class="container my-4">
    <div class="row mb-3">
        <div class="col-md-6">
            <label>Selecione um recurso</label>
            <select id="selectRecurso" class="form-control"></select>
        </div>
        <div class="col-md-6 text-right align-self-end">
            <button class="btn btn-primary" id="btnNovo">Novo Compartilhamento</button>
        </div>
    </div>
    <table class="table" id="tabelaCompartilhamentos">
        <thead><tr><th>Usuário</th><th>Permissão</th><th>Ações</th></tr></thead>
        <tbody></tbody>
    </table>
    <hr>
    <h5>Recursos compartilhados comigo</h5>
    <ul id="listaComigo"></ul>
</div>

<!-- Modal -->
<div class="modal fade" id="modalCompartilhar" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Adicionar Compartilhamento</h5>
                <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>
            </div>
            <div class="modal-body">
                <input type="hidden" id="modalIdItem">
                <input type="hidden" id="modalTipoItem">
                <div class="form-group">
                    <label for="destinoEmail">Usuário (e-mail)</label>
                    <input type="email" class="form-control" id="destinoEmail">
                </div>
                <div class="form-group">
                    <label for="destinoPermissao">Permissão</label>
                    <select id="destinoPermissao" class="form-control">
                        <option value="visualizar">Visualizar</option>
                        <option value="editar">Editar</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>
                <button type="button" class="btn btn-primary" id="btnSalvarCompart">Salvar</button>
            </div>
        </div>
    </div>
</div>
<?php include '../../includes/footer.php'; ?>
<script src="../assets/js/compartilhamentos.js"></script>
