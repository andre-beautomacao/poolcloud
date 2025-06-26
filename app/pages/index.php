<?php
session_start();

if (!isset($_SESSION['UsuarioID'])) {
    header('location: ../../index.php');
    exit;
}

$usuarioID = $_SESSION['UsuarioID'];
$usuarioNome = $_SESSION['UsuarioNome'];

include '../../includes/header.php';
?>

<nav class="navbar sticky-top navbar-main">
    <div class="navbar-flexfull">
        <!-- Esquerda -->
        <button id="toggleSidebar" class="btn btn-link nav-hamburger" type="button">
            <i class="fas fa-bars"></i>
        </button>
        
        <!-- Centro -->
        <div class="navbar-title-center">
            <span class="navbar-title">Piscinas </span>
                <button class="btn btn-link btn-add-pool" id="btnAddPiscina" title="Adicionar Piscina">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="btn btn-link btn-add-device" id="btnAddDispositivo" title="Adicionar Dispositivo" style="display:none;">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="btn btn-link btn-add-endereco" id="btnAddEndereco" title="Adicionar Local" style="display:none;">
                    <i class="fas fa-plus"></i>
                </button>
                            
        </div>
        
        <!-- Direita -->
        <div class="navbar-right">
            <a href="#" id="themeToggle" class="nav-link px-2">
                <i class="fas fa-adjust" title="Alternar tema"></i>
            </a>
            <!-- Botão de visualização oculto por padrão -->
            <a href="#" id="viewToggle" class="nav-link px-2" style="display:none">
                <i class="fas fa-th-list" title="Card/Lista"></i>
            </a>
            <div class="dropdown">
            <a href="#" class="dropdown-toggle nav-link px-2" id="dropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <i class="fas fa-user-ninja text-warning"></i> <?= $usuarioNome ?>
            </a>
            <div class="dropdown-menu dropdown-menu-end shadow text-center" aria-labelledby="dropdown">
                <button class="dropdown-item" onclick="abrirModalUsuario()">
                    <i class="fas fa-edit text-warning"></i> Alterar Dados
                </button>
                <div class="dropdown-divider"></div>
                <a href="../../backend/deslogar.php" class="dropdown-item">
                    <i class="fas fa-sign-out-alt text-warning"></i> Sair
                </a>
            </div>
        </div>

        </div>
    </div>
</nav>




<div class="d-flex">
    <!-- Sidebar mantida -->
    <div id="sidebar-wrapper" class="sidebar">
        <div class="list-group list-group-flush">
            <button class="btn btn-secondary list-group-item list-group-item-action mb-2" id="btnEnderecos">
                <i class="fas fa-map-marked-alt"></i> Locais
            </button>
            <button class="btn btn-secondary list-group-item list-group-item-action mb-2" id="btnPiscinas">
                <i class="fas fa-swimming-pool"></i> Piscinas
            </button>
            <button class="btn btn-secondary list-group-item list-group-item-action mb-2" id="btnDispositivos">
                <i class="fas fa-microchip"></i> Dispositivos
            </button>
        </div>
    </div>

    <div class="container-fluid">
        <div id="conteudoPrincipal" class="row">
            <!-- ----------- ENDEREÇOS (CARROSSEL SWIPER) ----------- -->
            <div id="containerEnderecos" class="col-12 mb-4">
                <div class="swiper-container" id="swiperEnderecos" style="position:relative;">
                    <button id="btnPrevEndereco" class="btn btn-link swiper-arrow swiper-arrow-left">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button id="btnNextEndereco" class="btn btn-link swiper-arrow swiper-arrow-right">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                    <div class="swiper-wrapper" id="enderecosWrapper">
                        <!-- Slides (cards de endereço) serão inseridos via JS -->
                    </div>
                </div>
            </div>
            <!-- ----------- FIM ENDEREÇOS ----------- -->




            <!-- ----------- PISCINAS (CARROSSEL SWIPER) ----------- -->
            <div id="containerPiscinas" class="col-12 mb-4">

                <!-- Swiper -->
                <div class="swiper-container" id="swiperPiscinas" style="position:relative;">
                    <!-- Setas sobrepostas no card -->
                    <button id="btnPrevPool" class="btn btn-link swiper-arrow swiper-arrow-left">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button id="btnNextPool" class="btn btn-link swiper-arrow swiper-arrow-right">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                    <div class="swiper-wrapper" id="piscinasWrapper">
                        <!-- Slides (cards) -->
                    </div>
                </div>

            </div>
            <!-- ----------- FIM PISCINAS ----------- -->
            <!-- ----------- DISPOSITIVOS (CARROSSEL SWIPER) ----------- -->
            <div id="containerDispositivos" class="col-12 mb-4">
                <!-- Swiper dos dispositivos -->
                <div class="swiper-container" id="swiperDispositivos" style="position:relative;">
                    <!-- Setas sobrepostas no card -->
                    <button id="btnPrevDisp" class="btn btn-link swiper-arrow swiper-arrow-left">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button id="btnNextDisp" class="btn btn-link swiper-arrow swiper-arrow-right">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                    <div class="swiper-wrapper" id="dispositivosWrapper">
                        <!-- Slides (cards) dos dispositivos serão inseridos via JS -->
                    </div>
                </div>
            </div>
            <!-- ----------- FIM DISPOSITIVOS ----------- -->

            <!-- ----------- OUTROS CONTAINERS ----------- -->
            <div id="containerLeiturasManuais" class="col-12 mb-4" style="display: none;">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h4 id="containerLeiturasTitle">Leituras Manuais</h4>
                    <div>
                        <button class="btn btn-primary" onclick="abrirModalLeituraManual()">Adicionar Leitura</button>
                    </div>
                </div>
                <div id="listaLeiturasManuais">
                    <!-- Cada piscina terá sua própria seção, incluindo tabela e container de cards -->
                </div>
            </div>
        </div>
    </div>
</div>


    <!-- Modal  Endereço-->
        <div class="modal fade" id="modal_endereco" name="modal_endereco" tabindex="-1" role="dialog" aria-labelledby="modal_enderecoLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modal_enderecoLabel">Locais</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
                <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <!-- Coloque o formulário aqui -->
                <div class="col-lg-3.5">
                    <div class="form-group">
                        <label for="enderecoID"><small>ID</small></label>
                        <input type="text" class="form-control" name="enderecoID" id="enderecoID" disabled>
                    </div>
                    <div class="form-group">
                        <label for="enderecoNome"><small>Nome</small></label>
                        <input type="text" class="form-control" name="enderecoNome" id="enderecoNome">
                    </div>
                    <div class="form-group">
                        <label for="enderecoTipo"><small>Tipo</small></label>
                        <select class="form-control" name="enderecoTipo" id="enderecoTipo">
                            <option value="" selected disabled>Selecione um tipo de local</option> <!-- Placeholder -->
                            <option value="Academia">Academia</option>
                            <option value="Clube">Clube</option>
                            <option value="Condominio">Condomínio</option>
                            <!-- Você pode adicionar mais opções aqui -->
                            <option value="Residencia">Residência</option>
                            <option value="Outro">Outro</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="enderecoCep"><small>CEP</small></label>
                        <input type="text" class="form-control" name="enderecoCep" id="enderecoCep" oninput="buscarEnderecoPorCEP()" maxlength="8">
                    </div>
                    <div class="form-group">
                        <label for="enderecoLogradouro"><small>Logradouro</small></label>
                        <input type="text" class="form-control" name="enderecoLogradouro" id="enderecoLogradouro">
                    </div>
                    <div class="form-group">
                        <label for="enderecoCidade"><small>Cidade</small></label>
                        <input type="text" class="form-control" name="enderecoCidade" id="enderecoCidade">
                    </div>
                    <div class="form-group">
                        <label for="enderecoEstado"><small>Estado</small></label>
                        <input type="text" class="form-control" name="enderecoEstado" id="enderecoEstado">
                    </div>
                </div>
                </div>
            <div class="modal-footer">
                <button class="btn btn-primary" id="btnAtualizarEnderecoModal" onclick="editar_endereco()">Atualizar</button>
                <button class="btn btn-primary" id="btnCadastrarEnderecoModal" onclick="cadastrar_endereco()">Cadastrar</button>
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>
            </div>
            </div>
            </div>
        </div>
        <div class="container mt-4">
    <!-- Modal  Piscinas-->
        <div class="modal fade" id="modal_piscina" name="modal_piscina" tabindex="-1" role="dialog" aria-labelledby="modal_piscinasLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modal_piscinaLabel">Piscinas</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
                    <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <!-- Coloque o formulário aqui -->
                    <div class="col-lg-3.5">
                        <div class="form-group">
                            <label for="piscinaID"><small>ID</small></label>
                            <input type="text" class="form-control" name="piscinaID" id="piscinaID" disabled>
                        </div>
                        <div class="form-group">
                            <label for="piscinaLocal"><small>Local</small></label>
                            <select class="form-control" name="piscinaLocal" id="piscinaLocal">
                            <option value="" selected disabled>Selecione um local</option> <!-- Placeholder -->
                                <!-- As opções serão adicionadas via JavaScript -->
                            </select>
                        </div>
                        <div class="form-group" style= "display:none">
                            <label for="piscinaLocalID"><small>LocalID</small></label>
                            <input type="text" class="form-control" name="piscinaLocalID" id="piscinaLocalID" disabled>
                        </div>
                        <div class="form-group">
                            <label for="piscinaNome"><small>Nome</small></label>
                            <input type="text" class="form-control" name="piscinaNome" id="piscinaNome">
                        </div>
                        <div class="form-group">
                            <label for="piscinaVolume"><small>Volume</small></label>
                            <input type="text" class="form-control" name="piscinaVolume" id="piscinaVolume"placeholder="m³">
                        </div>
                        <div class="form-group">
                        <label for="piscinaControleCloro"><small>Controle do cloro</small></label>
                            <select class="form-control" name="piscinaControleCloro" id="piscinaControleCloro">
                                <option value="Automatico">Automático</option>
                                <option value="Manual">Manual</option>
                                <!-- Você pode adicionar mais opções aqui -->
                            </select>
                        </div>
                        <label for="piscinaControlePh"><small>Controle do pH</small></label>
                            <select class="form-control" name="piscinaControlePh" id="piscinaControlePh">
                                <option value="Automatico">Automático</option>
                                <option value="Manual">Manual</option>
                                <!-- Você pode adicionar mais opções aqui -->
                            </select>
                        </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="btnAtualizarPiscinaModal" onclick="editar_piscina()">Atualizar</button>
                    <button class="btn btn-primary" id="btnCadastrarPiscinaModal" onclick="cadastrar_piscina()">Cadastrar</button>
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>
                </div>
                </div>
                </div>
            </div>
            <div class="container mt-4">

    <!-- Modal Dispositivo -->
    <div id="modal_dispositivo" class="modal fade" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
        <div class="modal-header">
            <h5 class="modal-title">Dispositivo</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
            <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div class="modal-body">
            <input type="hidden" id="dispositivoID">
            <input type="hidden" id="dispositivoPiscinaID">
            
            <div class="form-group">
            <label for="dispositivoPiscina"><small>Local</small></label>
            <select class="form-control" name="dispositivoPiscina" id="dispositivoPiscina">
                <option value="" selected disabled>Selecione uma piscina</option>
                <!-- As opções serão adicionadas via JavaScript -->
            </select>
            </div>
            <div class="mb-3">
            <label for="dispositivoTipo">Tipo</label>
            <select id="dispositivoTipo" class="form-control">
                <option value="">Selecione o tipo</option>
                <option value="Central de monitoramento">Central de monitoramento</option>
                <option value="Gerador de cloro - Passagem">Gerador de cloro - Passagem</option>
                <option value="Gerador de cloro - Usina">Gerador de cloro - Usina</option>
            </select>
            </div>
            <div class="mb-3">
            <label for="dispositivoModelo">Modelo</label>
            <select id="dispositivoModelo" class="form-control">
                <option value="">Selecione o modelo</option>
            </select>
            </div>
            <div class="mb-3">
            <label for="dispositivoMac1">MAC 1</label>
            <input type="text" id="dispositivoMac1" class="form-control">
            </div>
            <div class="form-check mb-3">
            <input class="form-check-input" type="checkbox" id="dispositivoTempHabilitada">
            <label class="form-check-label" for="dispositivoTempHabilitada">Habilitar Sensor de Temperatura</label>
            </div>

            <!-- Novo campo: Entradas Digitais -->
            <fieldset class="mb-3" id="digitalFieldset">
            <legend>Entradas Digitais (Defina o nome e o tipo)</legend>
            <!-- Entrada 01 -->
            <div class="form-row">
                <div class="col-md-6 mb-2">
                <label for="di01_nome">Entrada 01 - Nome</label>
                <input type="text" id="di01_nome" class="form-control">
                </div>
                <div class="col-md-6 mb-2">
                <label for="di01_tipo">Entrada 01 - Tipo</label>
                <select id="di01_tipo" class="form-control">
                    <option value="0">NA</option>
                    <option value="1">NF</option>
                </select>
                </div>
            </div>
            <!-- Entrada 02 -->
            <div class="form-row">
                <div class="col-md-6 mb-2">
                <label for="di02_nome">Entrada 02 - Nome</label>
                <input type="text" id="di02_nome" class="form-control">
                </div>
                <div class="col-md-6 mb-2">
                <label for="di02_tipo">Entrada 02 - Tipo</label>
                <select id="di02_tipo" class="form-control">
                    <option value="0">NA</option>
                    <option value="1">NF</option>
                </select>
                </div>
            </div>
            <!-- Entrada 03 -->
            <div class="form-row">
                <div class="col-md-6 mb-2">
                <label for="di03_nome">Entrada 03 - Nome</label>
                <input type="text" id="di03_nome" class="form-control">
                </div>
                <div class="col-md-6 mb-2">
                <label for="di03_tipo">Entrada 03 - Tipo</label>
                <select id="di03_tipo" class="form-control">
                    <option value="0">NA</option>
                    <option value="1">NF</option>
                </select>
                </div>
            </div>
            <!-- Entrada 04 -->
            <div class="form-row">
                <div class="col-md-6 mb-2">
                <label for="di04_nome">Entrada 04 - Nome</label>
                <input type="text" id="di04_nome" class="form-control">
                </div>
                <div class="col-md-6 mb-2">
                <label for="di04_tipo">Entrada 04 - Tipo</label>
                <select id="di04_tipo" class="form-control">
                    <option value="0">NA</option>
                    <option value="1">NF</option>
                </select>
                </div>
            </div>
            <!-- Entrada 05 -->
            <div class="form-row">
                <div class="col-md-6 mb-2">
                <label for="di05_nome">Entrada 05 - Nome</label>
                <input type="text" id="di05_nome" class="form-control">
                </div>
                <div class="col-md-6 mb-2">
                <label for="di05_tipo">Entrada 05 - Tipo</label>
                <select id="di05_tipo" class="form-control">
                    <option value="0">NA</option>
                    <option value="1">NF</option>
                </select>
                </div>
            </div>
            <!-- Entrada 06 -->
            <div class="form-row">
                <div class="col-md-6 mb-2">
                <label for="di06_nome">Entrada 06 - Nome</label>
                <input type="text" id="di06_nome" class="form-control">
                </div>
                <div class="col-md-6 mb-2">
                <label for="di06_tipo">Entrada 06 - Tipo</label>
                <select id="di06_tipo" class="form-control">
                    <option value="0">NA</option>
                    <option value="1">NF</option>
                </select>
                </div>
            </div>
            <!-- Entrada 07 -->
            <div class="form-row">
                <div class="col-md-6 mb-2">
                <label for="di07_nome">Entrada 07 - Nome</label>
                <input type="text" id="di07_nome" class="form-control">
                </div>
                <div class="col-md-6 mb-2">
                <label for="di07_tipo">Entrada 07 - Tipo</label>
                <select id="di07_tipo" class="form-control">
                    <option value="0">NA</option>
                    <option value="1">NF</option>
                </select>
                </div>
            </div>
            <!-- Entrada 08 -->
            <div class="form-row">
                <div class="col-md-6 mb-2">
                <label for="di08_nome">Entrada 08 - Nome</label>
                <input type="text" id="di08_nome" class="form-control">
                </div>
                <div class="col-md-6 mb-2">
                <label for="di08_tipo">Entrada 08 - Tipo</label>
                <select id="di08_tipo" class="form-control">
                    <option value="0">NA</option>
                    <option value="1">NF</option>
                </select>
                </div>
            </div>
            </fieldset>

            <!-- Campo: Entradas Analógicas -->
            <fieldset id="analogInputsFieldset" class="mb-3" style="display:none;">
            <legend>Entradas Analógicas</legend>
            <?php for ($i = 1; $i <= 4; $i++): $idx = sprintf('%02d', $i); ?>
            <div class="form-row">
                <div class="col-md-12 mb-2">
                    <label for="ai<?= $idx ?>_funcao">Entrada <?= $idx ?> - Função</label>
                    <select id="ai<?= $idx ?>_funcao" class="form-control">
                        <option value="">Selecione</option>
                        <option value="Sensor de pH">Sensor de pH</option>
                        <option value="Sensor de ORP">Sensor de ORP</option>
                        <option value="Sensor de corrente">Sensor de corrente</option>
                    </select>
                </div>
            </div>
            <?php endfor; ?>
            </fieldset>
        </div>
        <div class="modal-footer">
            <button id="btnCadastrarDispositivoModal" class="btn btn-success" onclick="cadastrar_dispositivo()">Cadastrar</button>
            <button id="btnAtualizarDispositivoModal" class="btn btn-primary" onclick="editar_dispositivo()" disabled>Atualizar</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>
        </div>
        </div>
    </div>
    </div>

    <!-- Modal para exibir dados completos das entradas digitais -->
        <div class="modal fade" id="modalDigitalInputs" tabindex="-1" role="dialog" aria-labelledby="modalDigitalInputsLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalDigitalInputsLabel">Detalhes das Entradas Digitais</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
                <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body" id="modalDigitalInputsBody">
                <!-- Os dados serão carregados via JavaScript -->
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>
            </div>
            </div>
        </div>
        </div>

    <!-- Modal  compartilhamento-->
        <div class="modal fade" id="modal_compartilhar" tabindex="-1" role="dialog" aria-labelledby="modal_compartilharLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modal_compartilharLabel">Compartilhar Piscina</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="enderecoIDCompartilhado">ID do endereço</label>
                        <input type="text" class="form-control" id="enderecoIDCompartilhado" disabled>
                    </div>
                    <div class="form-group">
                        <label for="emailUsuario">E-mail do Usuário</label>
                        <input type="email" class="form-control" id="emailUsuario" placeholder="Digite o e-mail do usuário">
                    </div>
                    <div id="mensagemErro" class="text-danger" style="display:none;"></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>
                    <button type="button" class="btn btn-primary" onclick="compartilhar_endereco()">Compartilhar</button>
                </div>
                </div>
            </div>
        </div>
    
    <!-- Modal Leitura Manual -->
        <div class="modal fade" id="modal_leitura" tabindex="-1" role="dialog" aria-labelledby="modal_leituraLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modal_leituraLabel">Leituras Manuais</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
                <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <!-- IDs ocultos para identificação da leitura e piscina -->
                <input type="hidden" id="leituraID" />
                <input type="hidden" id="leituraPiscinaID" />

                <div class="form-group">
                <label for="selectPiscinaLeitura"><small>Selecione a Piscina</small></label>
                <select class="form-control" id="selectPiscinaLeitura">
                    <!-- Preenchido dinamicamente -->
                </select>
                </div>

                <div class="form-group">
                <label for="alcalinidade"><small>Alcalinidade</small></label>
                <input type="text" class="form-control" id="alcalinidade" placeholder="ppm">
                </div>
                <div class="form-group">
                <label for="ph"><small>pH</small></label>
                <input type="text" class="form-control" id="ph">
                </div>
                <div class="form-group">
                <label for="cloroLivre"><small>Cloro Livre</small></label>
                <input type="text" class="form-control" id="cloroLivre" placeholder="ppm">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" id="btnCadastrarLeituraModal" onclick="cadastrar_leitura()">Cadastrar</button>
                <button class="btn btn-primary" id="btnAtualizarLeituraModal" onclick="editar_leitura()">Atualizar</button>
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>
            </div>
            </div>
            </div>
        </div>

    <!-- Modal  Usuario-->
        <div class="modal fade" id="modal_usuario" tabindex="-1" role="dialog" aria-labelledby="modal_usuarioLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="modal_usuarioLabel">Alterar Dados do Usuário</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form>
                            <div class="form-group">
                                <label for="usuarioNome">Nome</label>
                                <input type="text" class="form-control" id="usuarioNome" required>
                            </div>
                            <div class="form-group">
                                <label for="usuarioEmail">Email</label>
                                <input type="email" class="form-control" id="usuarioEmail" required>
                            </div>
                            <div class="form-group">
                                <label for="novaSenha">Nova Senha</label>
                                <input type="password" class="form-control" id="novaSenha"autocomplete="off">
                            </div>
                            <div class="form-group">
                                <label for="confirmarSenha">Confirmar Nova Senha</label>
                                <input type="password" class="form-control" id="confirmarSenha"autocomplete="off">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>
                        <button type="button" class="btn btn-primary" id="btnSalvarAlteracoesModal" onclick="editar_usuario()">Salvar Alterações</button>
                    </div>
                </div>
            </div>
        </div>
    <!-- Modal para exibir dados MQTT -->
        <div id="mqttDataModal" class="modal" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Dados MQTT Recebidos</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <p id="mqttDataContent">Aguardando dados...</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>
                </div>
                </div>
            </div>
        </div>    
<!-- FIM DO MODAL-------------------------------------------------------------------------------------------------------------------------------------------------------------------- -->
 
<?php
// ... (TODOS OS MODAIS COMO JÁ ESTAVAM, não vou repetir aqui para facilitar leitura)
// Basta deixar tudo do jeito que você já colou acima!
?>

<?php
include '../../includes/footer.php';
?>
