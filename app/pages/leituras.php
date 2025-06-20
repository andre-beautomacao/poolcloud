<?php
session_start();

if (!isset($_SESSION['UsuarioID'])) {
    header('location: ../../index.php');
}

$usuarioID = $_SESSION['UsuarioID'];
$usuarioNome = $_SESSION['UsuarioNome'];

include '../../includes/header.php';
?>
<nav class="navbar sticky-top">
    <div class="container-fluid d-flex justify-content-between">
        <ul class="nav ml-auto">
            <li class="nav-item">
                <a href="#" id="themeToggle" class="nav-link">
                    <i class="fas fa-adjust" title="Alternar tema"></i>
                </a>
            </li>
            <li class="nav-item dropdown">
                <a href="#" class="dropdown-toggle nav-link" id="dropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <i class="fas fa-user-ninja text-warning"></i> <?= $usuarioID ?> <?= $usuarioNome ?>
                </a>
                <div class="dropdown-menu shadow text-center" aria-labelledby="dropdown">
                    <div class="dropdown-divider"></div>
                    <a href="../../backend/deslogar.php" class="dropdown-item">
                        <i class="fas fa-sign-out-alt text-warning"></i> Sair
                    </a>
                </div>
            </li>
        </ul>
    </div>
</nav>

<div class="container-fluid my-4 px-0">
    <h4><strong>Relatório de leituras automáticas</strong></h4>
    <div id="leituraHeader" class="mb-4"></div>

    <div class="row mb-4">
        <!-- Coluna do filtro -->
        <div class="col-md-auto d-flex align-items-end gap-2 flex-wrap">
            <!-- Campo mês -->
            <div>
                <label for="filtroMesAno" class="form-label">Mês:</label>
                <input type="month" id="filtroMesAno" class="form-control" value="<?= date('Y-m') ?>">
            </div>

            <!-- Campo dia (opcional) -->
            <div>
                <label for="filtroDia" class="form-label">Dia (opcional):</label>
                <input type="number" id="filtroDia" class="form-control" min="1" max="31" placeholder="ex: 15">
            </div>

            <!-- Botão -->
            <div class="d-flex align-items-end">
                <button class="btn btn-primary" onclick="aplicarFiltro()">Buscar</button>
            </div>
        </div>

        <!-- Coluna dos botões de exportação -->
        <div class="col d-flex justify-content-end align-items-end mt-3 mt-md-0" style="gap: 0.5rem;">
            <button id="btnExportGraficosPNG" class="btn btn-outline-primary" style="display: none;" onclick="exportarGraficos('png')">Exportar PNG</button>
            <button id="btnExportGraficosPDF" class="btn btn-outline-secondary" style="display: none;" onclick="exportarGraficos('pdf')">Exportar PDF</button>
        </div>
    </div>
    <!-- Container Leituras Automáticas -->
    <div id="containerLeiturasAut" style="display:none;">

        <!-- Gráfico pH -->
        <div class="grafico-scroll mb-4">
            <div class="grafico-container border rounded p-2 position-relative" style="min-height: 300px; min-width: 900px;">
                <button onclick="exportarGraficos('png', 'graficoAutPH')"
                        class="btn btn-sm btn-outline-light position-absolute btn-export-interno"
                        style="top: 10px; right: 10px; z-index: 10;"
                        title="Exportar pH">
                    <i class="fas fa-download"></i>
                </button>
                <canvas id="graficoAutPH"></canvas>
            </div>
        </div>

        <!-- Gráfico ORP -->
        <div class="grafico-scroll mb-4">
            <div class="grafico-container border rounded p-2 position-relative" style="min-height: 300px; min-width: 900px;">
                <button onclick="exportarGraficos('png', 'graficoAutORP')"
                        class="btn btn-sm btn-outline-light position-absolute btn-export-interno"
                        style="top: 10px; right: 10px; z-index: 10;"
                        title="Exportar ORP">
                    <i class="fas fa-download"></i>
                </button>
                <canvas id="graficoAutORP"></canvas>
            </div>
        </div>

        <!-- Gráfico Temperatura -->
        <div class="grafico-scroll mb-4">
            <div id="containerGraficoAutTemperatura" class="grafico-container border rounded p-2 position-relative" style="min-height: 300px; min-width: 900px;">
                <button onclick="exportarGraficos('png', 'graficoAutTemperatura')"
                        class="btn btn-sm btn-outline-light position-absolute btn-export-interno"
                        style="top: 10px; right: 10px; z-index: 10;"
                        title="Exportar Temperatura">
                    <i class="fas fa-download"></i>
                </button>
                <canvas id="graficoAutTemperatura"></canvas>
            </div>
        </div>

        <hr>

        <!-- Botões de tabela -->
        <div class="d-flex justify-content-between align-items-center mb-3">
            <button id="btnToggleTabela" class="btn btn-secondary" onclick="toggleTabela()">Mostrar Tabela</button>
            
            <div class="d-flex flex-wrap justify-content-md-end align-self-md-end" style="gap: 0.5rem;">
                <button id="btnExporXLS" class="btn btn-outline-primary" onclick="exportarXLS()">Exportar XLS</button>
                <button id="btnExportTabela" class="btn btn-outline-secondary" onclick="exportarTabela('pdf')">Exportar PDF</button>
            </div>
        </div>

        <!-- Tabela de Leituras -->
        <table id="tabelaAutLeituras" class="table table-striped">
            <thead id="cabecalhoTabelaLeituras"></thead>
            <tbody id="listaleiturasauttab"></tbody>
        </table>
    </div>
</div>


<?php include '../../includes/footer.php'; ?>
