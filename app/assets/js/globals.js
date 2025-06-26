let graficoAlcalinidadeInstance, graficoPHInstance, graficoCloroInstance; // Variáveis globais para armazenar as instâncias dos gráficos
let graficoAutTemperaturaInstance, graficoAutPHInstance, graficoAutORPInstance; // Variáveis globais para armazenar as instâncias dos gráficos
let containerCompartilhamentos = document.getElementById("container-compartilhamentos");
let containerLeituras = document.getElementById("containerLeituras");
let containerLeiturasAut = document.getElementById("containerLeiturasAut");
let isLoadingEnderecos = false; // Variável de controle para endereços
let isLoadingPiscinas = false; // Variável de controle para piscinas
let isLoadingDispositivos = false // Variável de controle para dipositivos
let isLoadingLeiturasManuais = false; // Variável de controle para leituras
// Variável global para o modo de visualização
let modoDeVisualizacao = localStorage.getItem("modoDeVisualizacao") || "lista";

document.getElementById('btnAddEndereco')?.addEventListener('click', function(){
    abrirModalEndereco();
});
document.getElementById('btnAddPiscina')?.addEventListener('click', function(){
    abrirModalPiscina();
});
document.getElementById('btnAddDispositivo').onclick = function() {
    abrirModalDispositivo();
}

function atualizarNavbar(titulo, tipo) {
    // Atualiza o título central
    document.querySelector('.navbar-title').textContent = titulo;

    // Alterna botões
    if (tipo === 'piscina') {
        document.getElementById('btnAddPiscina').style.display = 'inline-block';
        document.getElementById('btnAddDispositivo').style.display = 'none';
        document.getElementById('btnAddEndereco').style.display = 'none';
    } else if (tipo === 'dispositivo') {
        document.getElementById('btnAddPiscina').style.display = 'none';
        document.getElementById('btnAddDispositivo').style.display = 'inline-block';
        document.getElementById('btnAddEndereco').style.display = 'none';
    } else if (tipo === 'local') {
        document.getElementById('btnAddPiscina').style.display = 'none';
        document.getElementById('btnAddDispositivo').style.display = 'none';
        document.getElementById('btnAddEndereco').style.display = 'inline-block';
    } else {
        document.getElementById('btnAddPiscina').style.display = 'none';
        document.getElementById('btnAddDispositivo').style.display = 'none';
        document.getElementById('btnAddEndereco').style.display = 'none';
    }
}

// Onload ------------------------------------------------------------------------------------------------------------
window.onload = async function () {
    const sidebarToggleBtn = document.getElementById('toggleSidebar');
    const body = document.body;
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const sidebar = document.getElementById('sidebar-wrapper');
    const modais = document.querySelectorAll('.modal');

    // Função para aplicar o tema
    function aplicarTema(tema) {
        document.body.classList.toggle("light-theme", tema === "light");
        document.body.classList.toggle("dark-theme", tema !== "light");

        sidebar && sidebar.classList.toggle("light-theme", tema === "light");
        sidebar && sidebar.classList.toggle("dark-theme", tema !== "light");

        modais.forEach(modal => {
            modal.classList.toggle('modal-light', tema === "light");
            modal.classList.toggle('modal-dark', tema !== "light");
        });

        const corTitulo = tema === "light" ? "#333" : "#fff";
        [graficoAutTemperaturaInstance, graficoAutPHInstance, graficoAutORPInstance].forEach(instance => {
            if (instance) {
                instance.options.plugins.title.color = corTitulo;
                instance.update();
            }
        });
    }

    // Função para ajustar a visibilidade da sidebar
    function ajustarSidebar() {
        if (mediaQuery.matches) {
            body.classList.add('sidebar-hidden');
        } else {
            body.classList.remove('sidebar-hidden');
        }
    }

    // Botão de alternância da sidebar
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', function () {
            body.classList.toggle('sidebar-hidden');
        });
    } else {
        console.error('Botão de alternância da sidebar não encontrado!');
    }

    ajustarSidebar();
    mediaQuery.addEventListener('change', ajustarSidebar);

    // Inicializar tema com base no localStorage
    const temaAtual = localStorage.getItem("theme") || "dark";
    aplicarTema(temaAtual);

    // Alternância de tema (com validação do botão)
    const themeToggleBtn = document.getElementById("themeToggle");
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", function () {
            const novoTema = document.body.classList.contains("light-theme") ? "dark" : "light";
            aplicarTema(novoTema);
            localStorage.setItem("theme", novoTema);
        });
    } else {
        console.warn('Botão #themeToggle não encontrado.');
    }

    // Inicializar modo de visualização com base no localStorage
    const modoVisualizacaoAtual = localStorage.getItem("modoDeVisualizacao") || "lista";
    modoDeVisualizacao = modoVisualizacaoAtual;
    atualizarIconeVisualizacao();

    inicializarConteudoComBaseNaURL();

    // Carregar dados iniciais
    /*
    try {
        console.log('Iniciando fetch para listar endereços');
        await listar_enderecos();
    } catch (error) {
        console.error('Erro ao listar endereços:', error);
    }
    */

    /*
    try {
        console.log('Iniciando fetch para listar dispositivos');
        await listar_dispositivos();
    } catch (error) {
        console.error('Erro ao listar dispositivos:', error);
    }
    */
};

