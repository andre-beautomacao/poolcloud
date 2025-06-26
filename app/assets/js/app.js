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

// CONFIGURAÇÕES DE EXIBIÇÃO DE CONTEÚDO -------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);
    const piscinaId = params.get('id');

    // Se for a tela de leitura, carrega cabeçalho
    if (document.getElementById('leituraHeader')) {
        if (piscinaId) {
            carregarHeaderPiscina(piscinaId);
        } else {
            Swal.fire('Erro', 'Nenhuma piscina selecionada.', 'error');
        }
    }

    // Sidebar: binds por botão, com segurança
    document.getElementById('btnEnderecos')?.addEventListener('click', function () {
        listar_enderecos();
        atualizarURL('enderecos', true);
        mostrarConteudo('containerEnderecos');
    });
    
    document.getElementById('btnPiscinas')?.addEventListener('click', function () {
        listar_piscinas();
        atualizarURL('piscinas', true);
        mostrarConteudo('containerPiscinas');
    });
document.getElementById('btnDispositivos')?.addEventListener('click', function () {
    listar_dispositivos();
    atualizarURL('dispositivos', true);
    mostrarConteudo('containerDispositivos');
});

// Observa o tipo do dispositivo para alternar exibição dos fieldsets
const tipoSelect = document.getElementById('dispositivoTipo');
if (tipoSelect) {
    tipoSelect.addEventListener('change', atualizarFieldsetsPorTipo);
}

    
    document.getElementById('btnLeituras')?.addEventListener('click', function () {
        listar_leituras_manuais(); 
        atualizarURL('leituras', true);
        mostrarConteudo('containerLeiturasManuais');
    });
    
    document.getElementById('btnHome')?.addEventListener('click', function () {
        atualizarURL('home', true);
        mostrarConteudo('todos');
    });
    

    // Alternância entre card/lista
    const viewToggleBtn = document.getElementById('viewToggle');
    if (viewToggleBtn) {
        viewToggleBtn.addEventListener('click', function (e) {
            e.preventDefault(); // Impede comportamento padrão do <a href="#">
            alternarVisualizacaoGlobal();
        });
    } else {
        console.warn('Botão #viewToggle não encontrado.');
    }
});



// Atualiza a URL com base no estado de navegação
function atualizarURL(pagina, forcarAtualizacao = false) {
    const baseUrl = window.location.origin + window.location.pathname;
    const novaUrl = `${baseUrl}#${pagina}`;

    if (window.location.href !== novaUrl || forcarAtualizacao) {
        window.history.pushState({}, '', novaUrl);
        inicializarConteudoComBaseNaURL(); // executa a lógica de exibição
    }
}


// Determina qual conteúdo exibir com base no hash da URL
function inicializarConteudoComBaseNaURL() {
    const hash = window.location.hash.replace('#', '') || 'home';

    switch (hash) {
        case 'enderecos':
            mostrarConteudo('containerEnderecos');
            listar_enderecos(); // Dentro dela já chama atualizarNavbar('Locais', 'local')
            break;
        case 'piscinas':
            mostrarConteudo('containerPiscinas');
            listar_piscinas();  // Dentro dela já chama atualizarNavbar('Piscinas', 'piscina')
            break;
        case 'dispositivos':
            mostrarConteudo('containerDispositivos');
            listar_dispositivos(); // Dentro dela já chama atualizarNavbar('Dispositivos', 'dispositivo')
            break;
        case 'home':
        default:
            mostrarConteudo('containerPiscinas');
            listar_piscinas();  // Dentro dela já chama atualizarNavbar('Piscinas', 'piscina')
            break;
    }
}



// Alterna o modo de exibição global (lista/card)
function alternarVisualizacaoGlobal() {
    modoDeVisualizacao = modoDeVisualizacao === 'lista' ? 'card' : 'lista';
    localStorage.setItem("modoDeVisualizacao", modoDeVisualizacao);
    atualizarIconeVisualizacao();

    // Atualiza todos os containers visíveis
    const visiveis = document.querySelectorAll('#conteudoPrincipal > div');
    visiveis.forEach(container => {
        if (container.style.display !== 'none') {
            aplicarModoDeVisualizacao(container.id);
        }
    });
}


function atualizarIconeVisualizacao() {
    const viewToggleIcon = document.querySelector('#viewToggle i');
    if (modoDeVisualizacao === 'lista') {
        viewToggleIcon.classList.remove('fa-th-list');
        viewToggleIcon.classList.add('fa-columns');
    } else {
        viewToggleIcon.classList.remove('fa-columns');
        viewToggleIcon.classList.add('fa-th-list');
    }
}


// Exibe apenas o container desejado
function mostrarConteudo(containerId) {
    const containers = document.querySelectorAll('#conteudoPrincipal > div');

    containers.forEach(container => {
        container.classList.add('d-none');
    });

    if (containerId === 'todos') {
        containers.forEach(container => {
            container.classList.remove('d-none');
            aplicarModoDeVisualizacao(container.id);
        });
    } else {
        const containerAlvo = document.getElementById(containerId);
        if (containerAlvo) {
            containerAlvo.classList.remove('d-none');
            aplicarModoDeVisualizacao(containerId);
        } else {
            console.warn(`Container com ID "${containerId}" não encontrado.`);
        }
    }
}


// Aplica o modo de visualização (lista/card) a um container específico
function aplicarModoDeVisualizacao(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const tabelas = container.querySelectorAll('table');
    const cardContainers = container.querySelectorAll('.row.g-2');

    tabelas.forEach(tabela => {
        tabela.style.display = (modoDeVisualizacao === 'lista') ? 'table' : 'none';
    });

    cardContainers.forEach(cardContainer => {
        cardContainer.style.display = (modoDeVisualizacao === 'card') ? 'flex' : 'none';
    });
}



//OUTRAS FUNÇÕES-------------------------------------------------------------------------------------------------------------------------------------------------

///-------------------------------------
async function carregarDadosUsuario() {
    fetch('../../backend/getDadosUsuario.php')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error(data.error);
                return;
            }

            const listaEnderecos = document.getElementById('listaEnderecos');
            const listaEnderecosCompartilhados = document.getElementById('listaEnderecosCompartilhados');
            
            // Limpa as listas antes de preencher
            listaEnderecos.innerHTML = '';
            listaEnderecosCompartilhados.innerHTML = '';

            // Adiciona a estrutura hierárquica para endereços do usuário
            data.hierarquia.forEach(endereco => {
                const enderecoHtml = `
                    <li>
                        <button class="sidebar-button" onclick="togglePiscinas(${endereco.id}, 'user'); listar_piscinasPost(${endereco.id})">
                            ${endereco.nome}
                        </button>
                        <ul id="piscinas-endereco-user-${endereco.id}">`;

                let piscinasHtml = '';
                for (const piscina of endereco.piscinas) {
                    piscinasHtml += `
                        <li>
                            <button class="sidebar-button sidebar-button-secondary" onclick="
                                listar_leituras(${piscina.id}), 
                                ocultarTabelaEnderecos(0),
                                ocultarTabelaPiscinas(0)
                                " >
                                ${piscina.nome}
                            </button>
                        </li>`;
                }

                listaEnderecos.innerHTML += enderecoHtml + piscinasHtml + `</ul></li>`;
            });

            // Adiciona a estrutura hierárquica para endereços compartilhados
            data.hierarquiaCompartilhada.forEach(endereco => {
                const enderecoHtml = `
                    <li>
                        <button class="sidebar-button" onclick="togglePiscinas(${endereco.id},'shared'); listar_piscinasPost(${endereco.id})">
                            ${endereco.nome} (Compartilhado)
                        </button>
                        <ul id="piscinas-endereco-shared-${endereco.id}">`;
                        //<ul id="piscinas-endereco-shared-${endereco.id}" style="display: none;">`;

                let piscinasHtml = '';
                for (const piscina of endereco.piscinas) {
                    piscinasHtml += `
                        <li>
                            <button class="sidebar-button sidebar-button-secondary" onclick="listar_leituras(${piscina.id})">
                                ${piscina.nome}
                            </button>
                        </li>`;
                }

                listaEnderecosCompartilhados.innerHTML += enderecoHtml + piscinasHtml + `</ul></li>`;
            });
        })
        .catch(error => console.error('Erro ao buscar dados do usuário:', error));
}

//LISTAGENS------------------------------------------------------------------------------------------------------------------------------

async function listar_enderecos() {
    if (isLoadingEnderecos) return;
    isLoadingEnderecos = true;

    // Atualize o título da navbar
    atualizarNavbar('Locais', 'local');


    const enderecosWrapper = document.getElementById('enderecosWrapper');
    // Limpa os slides antigos
    if (enderecosWrapper) enderecosWrapper.innerHTML = '';

    try {
        const response = await fetch('../../backend/listar_enderecos.php', {
            method: 'GET',
            headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        });
        const enderecos = await response.json();

        if (!enderecos.length) {
            if (enderecosWrapper) {
                enderecosWrapper.innerHTML = '<div class="swiper-slide"><p class="text-center">Nenhum endereço encontrado.</p></div>';
            }
            // Destroi swiper se já existir
            if (window.swiperEnderecos && typeof window.swiperEnderecos.destroy === "function") {
                window.swiperEnderecos.destroy(true, true);
            }
            window.swiperEnderecos = null;
            return;
        }

        // Monta slides do swiper (um card por endereço)
        enderecos.forEach((endereco) => {
            const {
                id,
                nome,
                tipo,
                logradouro,
                cidade,
                estado
            } = endereco;

            // Card padrão igual piscinas/dispositivos
            const cardHtml = `
                <div class="pool-card position-relative">
                    <div class="d-flex flex-column align-items-center text-center card-header-top">
                        <h5 class="mb-0" style="font-size:1.09rem;">${nome || ''}</h5>
                    </div>
                    <hr class="my-2">
                    <div class="row parametros-row g-2 mb-3 row-locais">
                        <div class="col-12">
                            <div class="param-card">
                                <span class="param-label">Tipo</span>
                                <span class="param-value" style="font-size:1.08em;">${tipo ?? ''}</span>
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="param-card">
                                <span class="param-label">Endereço</span>
                                <span class="param-value" style="font-size:1.08em;">
                                    ${logradouro ?? ''}${(cidade || estado) ? '<br>' : ''}
                                    <span style="font-size:0.99em;">
                                        ${cidade ? cidade : ''}${(cidade && estado) ? ' - ' : ''}${estado ? estado : ''}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex justify-content-around align-items-center mt-2 gap-3">
                        <i class="fas fa-cogs text-success pointer" title="Editar" onclick="abrirModalEndereco(${id})"></i>
                        <i class="fas fa-trash text-danger pointer" title="Excluir" onclick="deletar_endereco(${id})"></i>
                    </div>
                </div>
            `;

            if (enderecosWrapper) {
                const slide = document.createElement('div');
                slide.className = 'swiper-slide';
                slide.innerHTML = cardHtml;
                enderecosWrapper.appendChild(slide);
            }
        });

        // Swiper destroy/recreate (ID igual ao do HTML!)
        if (window.swiperEnderecos && typeof window.swiperEnderecos.destroy === "function") {
            window.swiperEnderecos.destroy(true, true);
        }
        window.swiperEnderecos = new Swiper('#swiperEnderecos', {
            slidesPerView: 'auto',
            spaceBetween: 24,
            centeredSlides: false,
            navigation: {
                nextEl: '#btnNextEndereco',
                prevEl: '#btnPrevEndereco'
            },
            breakpoints: {
                0:   { slidesPerView: 1, spaceBetween: 8, centeredSlides: true },
                600: { slidesPerView: 2, spaceBetween: 14 },
                900: { slidesPerView: 'auto', spaceBetween: 24, centeredSlides: false }
            }
        });

    } catch (error) {
        console.error('Erro ao listar endereços:', error);
        if (enderecosWrapper)
            enderecosWrapper.innerHTML = `<div class="swiper-slide"><p class="text-center text-danger">Erro ao carregar endereços.</p></div>`;
    } finally {
        isLoadingEnderecos = false;
    }
}


// Função para listar piscinas no novo padrão mobile-first/carrossel
async function listar_piscinas(enderecoID = null) {
    if (isLoadingPiscinas) return;
    isLoadingPiscinas = true;

    // Atualize o título da navbar
    atualizarNavbar('Piscinas', 'piscina');


    // Swiper DOM
    const poolSecondBar = document.getElementById('poolSecondBar');
    const poolNameSpan = document.getElementById('poolName');
    const btnPrevPool = document.getElementById('btnPrevPool');
    const btnNextPool = document.getElementById('btnNextPool');
    const piscinasWrapper = document.getElementById('piscinasWrapper');

    // Limpa slides antigos
    if (piscinasWrapper) piscinasWrapper.innerHTML = '';

    let swiperPiscinas = window.swiperPiscinas; // global

    try {
        const url = enderecoID
            ? `../../backend/listar_piscinas.php?endereco_id=${enderecoID}`
            : '../../backend/listar_piscinas.php';

        const resposta = await fetch(url);
        const textoResposta = await resposta.text();
        const piscinas = JSON.parse(textoResposta);

        if (!piscinas.length) {
            if (piscinasWrapper) {
                piscinasWrapper.innerHTML = '<div class="swiper-slide"><p class="text-center">Nenhuma piscina encontrada.</p></div>';
            }
            if (swiperPiscinas) swiperPiscinas.destroy(true, true);
            window.swiperPiscinas = null;
            if (poolNameSpan) poolNameSpan.textContent = '';
            if (btnPrevPool) btnPrevPool.disabled = true;
            if (btnNextPool) btnNextPool.disabled = true;
            return;
        }

        // Monta slides swiper
        piscinas.forEach((piscina, idx) => {
            const {
                piscina_id,
                piscina_nome,
                endereco_nome,
                last_ph_automatic,
                last_orp_automatic,
                last_temperatura_automatic,
                data_hora_automatic,
                temp_habilitada
            } = piscina;

            const exibirTemperatura = parseInt(temp_habilitada) === 1;
            const arredondar = (val, casas) => (typeof val === 'number' && !isNaN(val)) ? val.toFixed(casas) : '—';
            const ph = arredondar(last_ph_automatic, 1);
            const orp = arredondar(last_orp_automatic, 0);
            const temperatura = exibirTemperatura ? arredondar(last_temperatura_automatic, 1) + ' °C' : '—';

            let cardHtml = `
            <div class="pool-card position-relative">
                <div class="d-flex flex-column align-items-center text-center card-header-top">
                    <h5 class="mb-0">${piscina_nome || 'Piscina sem nome'}</h5>
                    <span class="small text-muted mb-2">${endereco_nome || 'Endereço não especificado'}</span>
                </div>
                <hr class="my-2">
                <div class="row parametros-row g-2 mb-3">
                    <div class="col-6">
                        <div class="param-card">
                            <span class="param-label">pH</span>
                            <span class="param-value" style="color:#2276c3;">${ph}</span>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="param-card">
                            <span class="param-label">ORP</span>
                            <span class="param-value" style="color:#b58c0a;">${orp} mV</span>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="param-card">
                            <span class="param-label">Temperatura</span>
                            <span class="param-value" style="color:#1ca441;">${temperatura}</span>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="param-card">
                            <span class="param-label">Última Leitura</span>
                            <span class="param-value" style="font-size:0.96em;">${data_hora_automatic ? new Date(data_hora_automatic).toLocaleString() : '—'}</span>
                        </div>
                    </div>
                </div>
                <div class="entradas-digitais-label fw-bold mb-1 text-center">Equipamentos:</div>
                <div class="row parametros-row g-2">
                    ${[1,2,3,4,5,6,7,8].map(i => {
                        const nome = piscina[`di${String(i).padStart(2, '0')}_nome`];
                        const status = piscina[`di${String(i).padStart(2, '0')}_status`];
                        if (nome && nome.trim() !== '') {
                            return `
                            <div class="col-6">
                                <div class="digital-card">
                                    <span class="digital-nome">${nome}</span>
                                    <span class="digital-icon"><i class="fas fa-plug" style="color:${status == 1 ? '#1ca441' : '#888'};"></i></span>
                                    <span class="digital-status ${status == 1 ? 'status-ligado' : 'status-desligado'}">${status == 1 ? 'Ligado' : 'Desligado'}</span>
                                </div>
                            </div>`;
                        }
                        return '';
                    }).join('')}
                </div>
                <div class="d-flex justify-content-around align-items-center mt-3 gap-3">
                    <i class="fas fa-cogs text-success pointer" title="Editar" onclick="abrirModalPiscina(${piscina_id})"></i>
                    <i class="fas fa-chart-line text-primary pointer" title="Leituras automáticas" onclick="abrirLeiturasGuiaNova(${piscina_id})"></i>
                    <i class="fas fa-trash text-danger pointer" title="Excluir" onclick="deletar_piscina(${piscina_id})"></i>
                </div>
            </div>
            `;

            if (piscinasWrapper) {
                const slide = document.createElement('div');
                slide.className = 'swiper-slide';
                slide.innerHTML = cardHtml;
                piscinasWrapper.appendChild(slide);
            }
        });

        // Swiper destroy/recreate
        if (window.swiperPiscinas && typeof window.swiperPiscinas.destroy === "function") {
            window.swiperPiscinas.destroy(true, true);
        }

        window.swiperPiscinas = new Swiper('#swiperPiscinas', {
        slidesPerView: 'auto', // <- Mostra o máximo possível
        spaceBetween: 24,
        centeredSlides: false,
        navigation: {
            nextEl: '#btnNextPool',
            prevEl: '#btnPrevPool'
        },
        breakpoints: {
            0: {  // mobile
            slidesPerView: 1,
            spaceBetween: 8,
            centeredSlides: true
            },
            600: { // tablet
            slidesPerView: 2,
            spaceBetween: 14
            },
            900: { // desktop
            slidesPerView: 'auto',
            spaceBetween: 24,
            centeredSlides: false
            }
        }
        });



        function atualizarBarraNomeSwiper(idx, arr) {
            if (!arr.length) {
                if (poolNameSpan) poolNameSpan.textContent = '';
                if (btnPrevPool) btnPrevPool.disabled = true;
                if (btnNextPool) btnNextPool.disabled = true;
            } else {
                if (poolNameSpan) poolNameSpan.textContent = arr[idx]?.piscina_nome ?? '--';
                if (btnPrevPool) btnPrevPool.disabled = idx === 0;
                if (btnNextPool) btnNextPool.disabled = idx === arr.length - 1;
            }
        }

        if (btnPrevPool) btnPrevPool.onclick = () => window.swiperPiscinas.slidePrev();
        if (btnNextPool) btnNextPool.onclick = () => window.swiperPiscinas.slideNext();
        atualizarBarraNomeSwiper(0, piscinas);

        // Exibe carrossel e barra
        if (poolSecondBar) poolSecondBar.style.display = '';
        const swiperPiscinasEl = document.getElementById('swiperPiscinas');
        if (swiperPiscinasEl) swiperPiscinasEl.style.display = '';

    } catch (error) {
        console.error('Erro ao listar piscinas:', error);
        if (piscinasWrapper) {
            piscinasWrapper.innerHTML = '<div class="swiper-slide"><p class="text-center text-danger">Erro ao carregar piscinas.</p></div>';
        }
    } finally {
        isLoadingPiscinas = false;
    }
}

async function listar_dispositivos(piscinaId = null) {
    if (isLoadingDispositivos) return;
    isLoadingDispositivos = true;

    // Atualize o título da navbar
    atualizarNavbar('Dispositivos', 'dispositivo');


    // Swiper DOM
    const wrapper = document.getElementById('dispositivosWrapper');
    if (wrapper) wrapper.innerHTML = '';

    let swiperDispositivos = window.swiperDispositivos;

    try {
        const url = piscinaId
            ? `../../backend/listar_dispositivos.php?piscina_id=${piscinaId}`
            : `../../backend/listar_dispositivos.php`;

        const resposta = await fetch(url);
        const dados = await resposta.json();
        const dispositivos = piscinaId ? dados.dispositivos : dados;

        if (!dispositivos || !dispositivos.length) {
            if (wrapper) {
                wrapper.innerHTML = '<div class="swiper-slide"><p class="text-center">Nenhum dispositivo encontrado.</p></div>';
            }
            if (swiperDispositivos) swiperDispositivos.destroy(true, true);
            window.swiperDispositivos = null;
            return;
        }

        // Monta slides swiper no padrão das piscinas
        dispositivos.forEach((dispositivo) => {
            const {
                dispositivo_id,
                dispositivo_nome,
                mac1,
                ph,
                orp,
                temperatura,
                data_hora,
                temp_habilitada
            } = dispositivo;

            const arredondar = (val, casas) => (typeof val === 'number' && !isNaN(val)) ? val.toFixed(casas) : '—';
            const phVal = arredondar(ph, 1);
            const orpVal = arredondar(orp, 0);
            const tempHabilitada = parseInt(temp_habilitada) === 1;
            const temperaturaVal = tempHabilitada ? arredondar(temperatura, 1) + ' °C' : '—';
            const ultimaLeitura = data_hora ? new Date(data_hora).toLocaleString() : '—';

            let cardHtml = `
            <div class="pool-card position-relative">
                <div class="d-flex flex-column align-items-center text-center card-header-top">
                    <h5 class="mb-0">${dispositivo_nome || 'Dispositivo sem nome'}</h5>
                    <span class="small text-muted mb-2">${mac1 || '—'}</span>
                </div>
                <hr class="my-2">
                <div class="row parametros-row g-2 mb-3">
                    <div class="col-6">
                        <div class="param-card" style="border: 1.5px solid #2276c3; background: #f6faff;">
                            <span class="param-label">MAC</span>
                            <span class="param-value" style="font-size:1em; font-family: monospace; letter-spacing:1px;">${mac1 || '—'}</span>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="param-card">
                            <span class="param-label">pH</span>
                            <span class="param-value" style="color:#2276c3;">${phVal}</span>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="param-card">
                            <span class="param-label">ORP</span>
                            <span class="param-value" style="color:#b58c0a;">${orpVal} mV</span>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="param-card">
                            <span class="param-label">Temperatura</span>
                            <span class="param-value" style="color:#1ca441;">${temperaturaVal}</span>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="param-card">
                            <span class="param-label">Última Leitura</span>
                            <span class="param-value" style="font-size:0.96em;">${ultimaLeitura}</span>
                        </div>
                    </div>
                </div>
                <div class="entradas-digitais-label fw-bold mb-1 text-center">Equipamentos:</div>
                <div class="row parametros-row g-2">
                    ${[1,2,3,4,5,6,7,8].map(i => {
                        const nome = dispositivo[`di${String(i).padStart(2, '0')}_nome`];
                        const status = dispositivo[`di${String(i).padStart(2, '0')}_status`];
                        if (nome && nome.trim() !== '') {
                            return `
                            <div class="col-6">
                                <div class="digital-card">
                                    <span class="digital-nome">${nome}</span>
                                    <span class="digital-icon"><i class="fas fa-plug" style="color:${status == 1 ? '#1ca441' : '#888'};"></i></span>
                                    <span class="digital-status ${status == 1 ? 'status-ligado' : 'status-desligado'}">${status == 1 ? 'Ligado' : 'Desligado'}</span>
                                </div>
                            </div>`;
                        }
                        return '';
                    }).join('')}
                </div>
                <div class="d-flex justify-content-around align-items-center mt-3 gap-3">
                    <i class="fas fa-sync-alt text-success pointer" title="Atualizar" onclick="solicitarAtualizacao('${mac1}')"></i>
                    <i class="fas fa-chart-line text-primary pointer" title="Histórico de leituras" onclick="listar_leituras('${mac1}')"></i>
                    <i class="fas fa-cogs text-success pointer" title="Editar" onclick="abrirModalDispositivo(${dispositivo_id})"></i>
                    <i class="fas fa-trash text-danger pointer" title="Excluir" onclick="deletar_dispositivo(${dispositivo_id})"></i>
                </div>
            </div>
            `;

            if (wrapper) {
                const slide = document.createElement('div');
                slide.className = 'swiper-slide';
                slide.innerHTML = cardHtml;
                wrapper.appendChild(slide);
            }
        });

        // Swiper destroy/recreate
        if (window.swiperDispositivos && typeof window.swiperDispositivos.destroy === "function") {
            window.swiperDispositivos.destroy(true, true);
        }

        window.swiperDispositivos = new Swiper('#swiperDispositivos', {
            slidesPerView: 'auto',
            spaceBetween: 24,
            centeredSlides: false,
            navigation: {
                nextEl: '#btnNextDisp',
                prevEl: '#btnPrevDisp'
            },
            breakpoints: {
                0: { slidesPerView: 1, spaceBetween: 8, centeredSlides: true },
                600: { slidesPerView: 2, spaceBetween: 14 },
                900: { slidesPerView: 'auto', spaceBetween: 24, centeredSlides: false }
            }
        });

    } catch (error) {
        console.error('Erro ao listar dispositivos:', error);
        if (wrapper) {
            wrapper.innerHTML = '<div class="swiper-slide"><p class="text-center text-danger">Erro ao carregar dispositivos.</p></div>';
        }
    } finally {
        isLoadingDispositivos = false;
    }
}

// Função para alternar a exibição das entradas digitais no card
function toggleDigitalInputsCard(mac) {
    const elem = document.getElementById(`digital-inputs-card-${mac}`);
    if (elem) {
        if (elem.style.display === 'none' || elem.style.display === '') {
            elem.style.display = 'block';
        } else {
            elem.style.display = 'none';
        }
    }
}

// Função auxiliar para arredondar valores
function arredondar(valor, casas = 2) {
    const numero = parseFloat(valor);
    if (!isNaN(numero)) {
        return numero.toFixed(casas);
    }
    return '—';
}



async function listar_enderecosCompartilhados() {
    const listaenderecoscompartilhadostab = document.querySelector('#listaenderecoscompartilhadostab');
    listaenderecoscompartilhadostab.innerHTML = '';

    fetch('../../backend/listar_enderecos_compartilhados.php', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json;charset=UTF-8'
        },
    })
    .then(response => response.json())
    .then(resultado => {
        if (resultado.length > 0) {
            const tabela = document.getElementById("tabelaEnderecosCompartilhados");
            tabela.style.display = "table"; // Torna a tabela visível

            resultado.forEach(f => {
                const dadosenderecos = `
                    <tr>
                        <td>${f.proprietario_nome}</td>
                        <td>${f.endereco_nome}</td>
                        <td>
                            <i class="fas fa-swimming-pool text-primary pointer" title="Piscinas" onclick="listar_piscinasPost(${f.endereco_id})"></i>
                            <i class="fas fa-trash text-danger pointer" title="Excluir" onclick="deletar_compartilhamento(${f.comp_partilhamento_id})"></i>
                        </td>
                    </tr>
                `;
                listaenderecoscompartilhadostab.innerHTML += dadosenderecos;
            });
        } else {
            listaenderecoscompartilhadostab.innerHTML = `
                <tr><td colspan="3" style="text-align: center;">Nenhum endereço compartilhado encontrado.</td></tr>`;
        }
    })
    .catch(error => {
        console.error('Erro ao listar endereços compartilhados:', error);
        listaenderecoscompartilhadostab.innerHTML = `
            <tr><td colspan="3" style="text-align: center;">Erro ao carregar endereços compartilhados.</td></tr>`;
    });
}

function listar_piscinasPost(id) {
    const tabela = document.getElementById("tabelaPiscinas");
    tabela.style.display = "table";

    const listapiscinastab = document.querySelector('#listapiscinastab');
    const tabelaHeader = document.querySelector('#tabelaHeader');
    listapiscinastab.innerHTML = '';

    $.ajax({
        url: '../../backend/listar_piscinas_post.php',
        type: 'post',
        data: { id },
        success: (resposta) => {
            try {
                const resultado = resposta; 
                const localNome = resultado.local;
                const piscinas = resultado.piscinas;

                tabelaHeader.innerHTML = `
                    Piscinas - ${localNome}
                    <button class="btn btn-primary" onclick="abrirModalPiscina()">Adicionar Piscina</button>
                    <button class="btn btn-secondary" onclick="abrirModalDispositivo()">Cadastrar Dispositivo</button>
                `;

                if (piscinas.length === 0) {
                    listapiscinastab.innerHTML = `
                        <tr>
                            <td colspan="6" style="text-align: center;">Nenhuma piscina cadastrada para este endereço.</td>
                        </tr>`;
                } else {
                    piscinas.forEach(f => {
                        const dadospiscinas = `
                            <tr>
                                <td>${f.local}</td>
                                <td>${f.nome}</td>
                                <td><i class="fas fa-cogs text-success pointer" title="Editar" onclick="abrirModalPiscina(${f.id})"></i></td>
                                <td><i class="fas fa-edit text-success pointer" title="Leituras manuais" onclick="listar_leituras(${f.id})"></i></td>
                                <td><i class="fas fa-chart-line text-success pointer" title="Leituras automáticas" onclick="listar_leituras_iot(${f.id})"></i></td>
                                <td><i class="fas fa-trash text-danger pointer" title="Excluir" onclick="deletar_piscina(${f.id})"></i></td>
                            </tr>`;
                        listapiscinastab.innerHTML += dadospiscinas;
                    });
                }
            } catch (e) {
                console.error('Erro ao processar a resposta:', e);
                Swal.fire('Erro!', 'Erro inesperado ao listar piscinas!', 'error');
            }
        },
        error: (resposta) => {
            console.error('Erro na requisição:', resposta);
            Swal.fire('Erro!', 'Erro ao comunicar com o servidor!', 'error');
        }
    });
}
function solicitarNovaLeitura(dispositivoId) {
    alert(`Solicitando nova leitura para o dispositivo ID: ${dispositivoId}`);
    // Aqui você pode implementar a lógica de solicitação de leitura
}



function abrirLeiturasGuiaNova(idPiscina) {
    window.open(`leituras.php?id=${idPiscina}`, '_blank');
}

async function buscarDispositivosTempHabilitada(piscinaId) {
    try {
        const resposta = await fetch(`../../backend/listar_dispositivo_piscina.php?piscina_id=${piscinaId}`);
        const dispositivo = await resposta.json();

        return dispositivo && Number(dispositivo.temp_habilitada) === 1;
    } catch (e) {
        console.error("Erro ao buscar dispositivo da piscina:", e);
        return false;
    }
}


async function listar_leituras_iot(id, mes = null, ano = null, dia = null) {
    ocultarContainerLeituras(0);
    const containerGraficoAutTemperatura = document.getElementById("containerGraficoAutTemperatura");
    const listaleiturasauttab = document.querySelector('#listaleiturasauttab');
    const cabecalhoTabelaLeituras = document.getElementById('cabecalhoTabelaLeituras');
    const tabelaAut = document.getElementById("tabelaAutLeituras");

    const graficoAutTemperatura = document.getElementById("graficoAutTemperatura");
    const graficoAutPH = document.getElementById("graficoAutPH");
    const graficoAutORP = document.getElementById("graficoAutORP");

    const ctxAutTemperatura = graficoAutTemperatura.getContext('2d');
    const ctxAutPH = graficoAutPH.getContext('2d');
    const ctxAutORP = graficoAutORP.getContext('2d');

    containerLeiturasAut.style.display = "block";
    tabelaAut.style.display = "table";
    listaleiturasauttab.innerHTML = '';
    cabecalhoTabelaLeituras.innerHTML = '';

    Swal.fire({
        title: 'Buscando leituras...',
        text: 'Aguarde enquanto os dados são carregados.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    try {
        const exibirTemperatura = await buscarDispositivosTempHabilitada(id);

        $.ajax({
            url: '../../backend/listar_leituras_iot_post.php',
            type: 'post',
            data: {
                piscina_id: id,
                mes: mes,
                ano: ano,
                ...(dia ? { dia } : {})  // Inclui 'dia' somente se definido
            },
            success: (resultado) => {
                Swal.close();

                if (resultado.ano_mes_consultado) {
                    const ano = String(resultado.ano_mes_consultado).slice(0, 4);
                    const mes = String(resultado.ano_mes_consultado).slice(4, 6);
                    const campoMes = document.getElementById("filtroMesAno");
                    if (campoMes) campoMes.value = `${ano}-${mes}`;
                }

                const leituras_aut = resultado.leituras_aut;

                let cabecalhoHtml = '<tr><th>Data da Leitura</th>';
                if (exibirTemperatura) {
                    cabecalhoHtml += '<th>Temperatura (°C)</th>';
                }
                cabecalhoHtml += '<th>pH</th><th>ORP (mV)</th></tr>';
                cabecalhoTabelaLeituras.innerHTML = cabecalhoHtml;

                if (resultado.mensagem_ajuste_periodo) {
                    Swal.fire({
                        icon: 'info',
                        title: 'Período ajustado',
                        text: resultado.mensagem_ajuste_periodo,
                        confirmButtonText: 'OK'
                    });
                }

                if (!Array.isArray(leituras_aut) || leituras_aut.length === 0) {
                    Swal.fire({
                        title: 'Sem Leituras',
                        text: 'Nenhuma leitura encontrada para esta piscina.',
                        icon: 'info',
                        confirmButtonText: 'Ok'
                    });

                    containerGraficoAutTemperatura.style.display = "none";
                    graficoAutPH.style.display = "none";
                    graficoAutORP.style.display = "none";

                    listaleiturasauttab.innerHTML = `
                        <tr>
                            <td colspan="${exibirTemperatura ? 4 : 3}" style="text-align: center;">
                                Nenhuma leitura cadastrada para esta piscina.
                            </td>
                        </tr>`;
                    return;
                }

                let datas = [], temperaturas = [], phs = [], orps = [];
                let html = '';

                leituras_aut.slice(0, 60000).forEach(f => {
                    html += `<tr><td>${formatarDataTab(f.data_hora)}</td>`;

                    if (exibirTemperatura && f.temperatura != null) {
                        html += `<td>${f.temperatura}</td>`;
                    } else if (exibirTemperatura) {
                        html += `<td style="color: #999;">—</td>`;
                    }

                    html += `<td>${f.ph}</td><td>${f.orp}</td></tr>`;

                    datas.push(f.data_hora);
                    temperaturas.push(f.temperatura);
                    phs.push(f.ph);
                    orps.push(f.orp);
                });

                listaleiturasauttab.innerHTML = html;

                containerGraficoAutTemperatura.style.display = exibirTemperatura ? "block" : "none";
                graficoAutPH.style.display = "block";
                graficoAutORP.style.display = "block";

                renderizarGraficosSeparados_iot(
                    datas,
                    temperaturas,
                    phs,
                    orps,
                    ctxAutTemperatura,
                    ctxAutPH,
                    ctxAutORP
                );
            },
            error: () => {
                Swal.close();
                Swal.fire('Erro', 'Não foi possível buscar as leituras.', 'error');
            }
        });
    } catch (erro) {
        Swal.close();
        console.error("Erro ao listar leituras:", erro);
        Swal.fire('Erro', 'Falha ao buscar dispositivos da piscina.', 'error');
    }
}



function carregarHeaderPiscina(piscinaId) {
    $.post('../../backend/get_piscina_info.php', { piscina_id: piscinaId }, function(res) {
        if (res.error) {
            document.getElementById('leituraHeader').innerHTML = `
                <div class="alert alert-warning text-center">${res.error}</div>
            `;
        } else {
            document.getElementById('leituraHeader').innerHTML = `
                <h5><strong>${res.nome_piscina}</strong> - ${res.nome_local}</h5>
            `;
        }
    }, 'json');
}

function toggleTabela() {
    const tabela = document.getElementById('tabelaAutLeituras');
    if (tabela.style.display === 'none' || tabela.style.display === '') {
        tabela.style.display = 'table';
    } else {
        tabela.style.display = 'none';
    }
}

function exportarTabela(tipo) {
    const tabela = document.getElementById('tabelaAutLeituras');
    const linhas = tabela.querySelectorAll('tr');
    
    if (linhas.length <= 1) {
        Swal.fire('Erro', 'Nenhum dado para exportar!', 'error');
        return;
    }

    if (tipo === 'csv') {
        let csv = [];
        linhas.forEach(row => {
            let cols = row.querySelectorAll('td, th');
            let rowCsv = Array.from(cols).map(col => col.innerText).join(';');
            csv.push(rowCsv);
        });

        let csvString = csv.join("\\n");
        let blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        let link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `leituras_${document.getElementById('filtroMesAno').value}.csv`;
        link.click();
    }

    if (tipo === 'pdf') {
        exportarPDF();
    }
}

function exportarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const headerText = document.getElementById('leituraHeader')?.innerText || '';

    doc.setFontSize(14);
    doc.text("Relatório de Leituras Automáticas", 14, 15);

    if (headerText) {
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(headerText, 14, 22);
    }

    const tabela = document.getElementById("tabelaAutLeituras");
    doc.autoTable({
        html: tabela,
        startY: headerText ? 28 : 22,
        styles: { fontSize: 9 },
        theme: 'striped'
    });

    // ✅ Aqui a leitura do nome do usuário
    let nomeUsuario = 'Usuário não identificado';

    try {
        nomeUsuario = window.usuarioNome || document.getElementById('usuarioNome')?.innerText || nomeUsuario;
    } catch (e) {
        console.warn("Erro ao obter nome do usuário:", e);
    }

    const dataAtual = new Date();
    const dataFormatada = dataAtual.toLocaleDateString('pt-BR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const horaFormatada = dataAtual.toLocaleTimeString('pt-BR', {
        hour: '2-digit', minute: '2-digit'
    });

    const textoRodape = `Relatório emitido por ${nomeUsuario} em ${dataFormatada}, às ${horaFormatada}.`;

    const posY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(textoRodape, 14, posY);

    doc.save(`leituras_${document.getElementById('filtroMesAno').value}.pdf`);
}

function exportarXLS() {
    const tabela = document.getElementById('tabelaAutLeituras');
    const linhas = tabela.querySelectorAll('tr');

    if (linhas.length <= 1) {
        Swal.fire('Erro', 'Nenhum dado para exportar!', 'error');
        return;
    }

    // Criar uma matriz com os dados formatados
    const dados = [];
    linhas.forEach((linha, index) => {
        const cols = Array.from(linha.querySelectorAll('th, td')).map((col, i) => {
            let texto = col.innerText.trim();

            // Se for a primeira coluna (data), forçar formatação como texto padronizado
            if (i === 0 && index !== 0) {
                const partes = texto.split(/[\\s/]/); // ["dd", "mm", "aaaa", "hh:mm"]
                if (partes.length >= 4) {
                    const dia = partes[0].padStart(2, '0');
                    const mes = partes[1].padStart(2, '0');
                    const ano = partes[2];
                    const horaMinuto = partes[3];
                    texto = `${dia}/${mes}/${ano} ${horaMinuto}`;
                }
            }

            return texto;
        });

        dados.push(cols);
    });

    // Criar worksheet com os dados
    const ws = XLSX.utils.aoa_to_sheet(dados);

    // Forçar tipo 's' (string) para primeira coluna
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = 1; R <= range.e.r; ++R) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: 0 });
        if (ws[cellAddress]) {
            ws[cellAddress].t = 's'; // força string
        }
    }

    // Criar e exportar o arquivo
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leituras Automacao');
    XLSX.writeFile(wb, `leituras_${document.getElementById('filtroMesAno').value}.xlsx`);
}

function listar_leituras(id, dataInicio = null, dataFim = null) {
    ocultarContainerLeiturasAut(0);
    const listaleiturastab = document.querySelector('#listaleiturastab');
    const containerHeader = document.querySelector('#containerHeaderLeituras');
    const tabela = document.getElementById("tabelaLeituras");
    const graficoAlcalinidade = document.getElementById("graficoAlcalinidade");
    const graficoPH = document.getElementById("graficoPH");
    const graficoCloro = document.getElementById("graficoCloro");
    const ctxAlcalinidade = graficoAlcalinidade.getContext('2d');
    const ctxPH = graficoPH.getContext('2d');
    const ctxCloro = graficoCloro.getContext('2d');
    // Exibir o container de leituras
    containerLeituras.style.display = "block";
    tabela.style.display = "table"; // Torna a tabela visível
    listaleiturastab.innerHTML = ''; // Limpa a tabela antes de preencher
     
    // Prepare os dados para enviar ao backend
    const data = {
        piscina_id: id,
        data_inicio: dataInicio,
        data_fim: dataFim
    };
    console.log(data);

    $.ajax({
        url: '../../backend/listar_leituras_post.php',
        type: 'post',
        async: true,
        data: data,
        success: (resposta) => {
            console.log(resposta); // Adicione esta linha para verificar a resposta
            try {
                const resultado = resposta; // Assumindo que a resposta já é JSON
                const nomePiscina = resultado.nome_piscina;
                const nomeLocal = resultado.nome_local; // Extraindo o nome do local
                const leituras = resultado.leituras;

                // Exibe o nome da piscina e do local no cabeçalho do container
                containerHeader.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span><b>
                        Leituras manuais - ${nomePiscina} - ${nomeLocal}
                        <button class="btn btn-primary" id="btnAdicionarLeitura" onclick="abrirModalLeitura(${id})">Adicionar</button>
                    </b></span>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="margin-right: 10px;">Filtrar por:</span>
                        <button class="btn btn-secondary" onclick="filtrarPorUltimoDia(${id})">Último Dia</button>
                        <button class="btn btn-secondary" onclick="filtrarPorUltimaSemana(${id})">Última Semana</button>
                        <button class="btn btn-secondary" onclick="filtrarPorUltimos30Dias(${id})">Últimos 30 Dias</button>
                    </div>
                </div>
            `;


                if (leituras.length === 0) {
                    Swal.fire({
                        title: 'Sem Leituras',
                        text: 'Nenhuma leitura encontrada para esta piscina.',
                        icon: 'info',
                        confirmButtonText: 'Ok'
                    });

                    const noLeiturasRow = `
                        <tr>
                            <td colspan="4" style="text-align: center;">
                                Nenhuma leitura cadastrada para esta piscina.
                            </td>
                        </tr>
                    `;
                    listaleiturastab.innerHTML += noLeiturasRow;

                    // Esconder gráficos se não houver leituras
                    graficoAlcalinidade.style.display = "none"; 
                    graficoPH.style.display = "none";
                    graficoCloro.style.display = "none"; 
                } else {
                    let datas = [], alcalinidades = [], phs = [], cloros = [];

                    leituras.forEach(f => {
                        let dadosleituras = `
                            <tr>
                                <td>${formatarDataTab(f.data_hora)}</td>
                                <td>${f.alcalinidade}</td>
                                <td>${f.ph}</td>
                                <td>${f.cloro_livre}</td>
                                <td></td>
                            </tr>
                        `;
                        listaleiturastab.innerHTML += dadosleituras;

                        // Coletar dados para o gráfico
                        datas.push(f.data_hora);
                        alcalinidades.push(f.alcalinidade);
                        phs.push(f.ph);
                        cloros.push(f.cloro_livre);
                    });

                    // Tornar os gráficos visíveis
                    graficoAlcalinidade.style.display = "block"; 
                    graficoPH.style.display = "block"; 
                    graficoCloro.style.display = "block"; 

                    // Renderizar gráficos com dados separados
                    renderizarGraficosSeparados(datas, alcalinidades, phs, cloros, ctxAlcalinidade, ctxPH, ctxCloro);
                }
            } catch (e) {
                console.error('Erro ao analisar a resposta:', e);
                Swal.fire('Erro!', 'Erro inesperado ao listar leituras!', 'error');
            }
        },
        error: (resposta) => {
            console.error('Erro na requisição:', resposta);
            Swal.fire('Erro!', 'Erro ao comunicar com o servidor!', 'error');
        }
    });
}

// Função para listar leituras manuais
async function listar_leituras_manuais(piscinaId = null) {
    // Evita chamadas concorrentes se já estiver carregando
    if (isLoadingLeiturasManuais) return;
    isLoadingLeiturasManuais = true;

    // Seleciona elementos do DOM
    const containerLeiturasManuais = document.getElementById('containerLeiturasManuais');
    const listaLeiturasManuais = document.getElementById('listaLeiturasManuais'); // Container principal

    // Limpa conteúdos anteriores
    listaLeiturasManuais.innerHTML = '';

    try {
        // Monta a requisição ao backend
        const url = '../../backend/listar_leituras_manuais.php';

        // Usaremos POST com FormData
        const formData = new FormData();
        if (piscinaId) {
            formData.append('piscina_id', piscinaId);
        }

        const resposta = await fetch(url, {
            method: 'POST',
            body: formData
        });

        const dados = await resposta.json();
        // Supondo retorno: { piscinas: [ { piscina_id, nome_piscina, nome_local, leituras: [...] }, ... ] }

        if (dados.error) {
            // Caso haja um erro específico retornado pelo backend
            listaLeiturasManuais.innerHTML = `
                <div class="alert alert-danger text-center">
                    ${dados.message || 'Erro ao carregar leituras manuais.'}
                </div>
            `;
            containerLeiturasManuais.style.display = 'block';
            return;
        }

        if (!dados.piscinas || dados.piscinas.length === 0) {
            // Caso não haja piscinas ou leituras
            listaLeiturasManuais.innerHTML = `
                <div class="alert alert-info text-center">
                    Nenhuma leitura encontrada.
                </div>
            `;
            containerLeiturasManuais.style.display = 'block';
            return;
        }

        const piscinas = dados.piscinas;
        let totalLeituras = 0; // Contador para saber se encontramos alguma leitura

        piscinas.forEach(p => {
            const { piscina_id, nome_piscina, nome_local, leituras } = p || {};

            // Cria uma seção para cada piscina
            const secaoPiscina = document.createElement('div');
            secaoPiscina.classList.add('piscina-leituras', 'mb-4');

            // Cabeçalho da piscina com botão para adicionar leitura específica
            secaoPiscina.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>Leituras da Piscina: <strong>${nome_piscina || 'Sem Nome'}</strong> (${nome_local || 'Sem Local'})</h5>
                    <button class="btn btn-sm btn-secondary" onclick="abrirModalLeituraManual(${piscina_id}, null)">Adicionar Leitura</button>
                </div>
            `;

            // Criar tabela de leituras (modo lista)
            const tabela = document.createElement('table');
            tabela.classList.add('table', 'table-hover', 'table-striped');
            tabela.style.display = 'none'; // Inicialmente oculto, será controlado pela visualização

            const thead = document.createElement('thead');
            thead.innerHTML = `
                <tr>
                    <th>Data da Leitura</th>
                    <th>pH</th>
                    <th>Cloro Livre</th>
                    <th>Alcalinidade</th>
                    <th>Ações</th>
                </tr>
            `;
            tabela.appendChild(thead);

            const tbody = document.createElement('tbody');
            if (!leituras || leituras.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-left">Nenhuma leitura cadastrada para esta piscina.</td>
                    </tr>
                `;
            } else {
                leituras.forEach(leitura => {
                    totalLeituras++;
                    const { id, ph, cloro_livre, alcalinidade, data_hora } = leitura;
                    const dataFormatada = data_hora
                        ? new Date(data_hora).toLocaleString()
                        : '—';

                    // Arredondar os valores antes de exibir
                    const phArredondado = arredondar(ph, 1);
                    const cloroLivreArredondado = arredondar(cloro_livre, 1);
                    const alcalinidadeArredondada = arredondar(alcalinidade, 0);

                    tbody.innerHTML += `
                        <tr>
                            <td>${dataFormatada}</td>
                            <td>${phArredondado}</td>
                            <td>${cloroLivreArredondado} ppm</td>
                            <td>${alcalinidadeArredondada} ppm</td>
                            <td>                             
                                <i class="fas fa-cogs text-success pointer" title="Editar" onclick="abrirModalLeituraManual(null, ${id})"></i>
                                <i class="fas fa-trash text-danger pointer" title="Excluir" onclick="deletar_leitura(${id})"></i>
                            </td>
                        </tr>
                    `;
                });
            }
            tabela.appendChild(tbody);
            secaoPiscina.appendChild(tabela);

            // Criar container de cards (modo card)
            const cardContainer = document.createElement('div');
            cardContainer.classList.add('row', 'g-2');
            cardContainer.style.display = 'none'; // Inicialmente oculto, será controlado pela visualização

            if (!leituras || leituras.length === 0) {
                cardContainer.innerHTML = `
                    <div class="col-12 text-left">
                        <p class="text-muted">
                            Nenhuma leitura cadastrada para esta piscina.
                        </p>
                    </div>
                `;
            } else {
                leituras.forEach(leitura => {
                    totalLeituras++;
                    const { id, ph, cloro_livre, alcalinidade, data_hora } = leitura;
                    const dataFormatada = data_hora
                        ? new Date(data_hora).toLocaleString()
                        : '—';

                    // Arredondar os valores antes de exibir
                    const phArredondado = arredondar(ph, 2);
                    const cloroLivreArredondado = arredondar(cloro_livre, 1);
                    const alcalinidadeArredondada = arredondar(alcalinidade, 1);

                    const card = document.createElement('div');
                    card.classList.add('col-12', 'col-sm-6', 'col-md-4', 'col-lg-3', 'mb-3');

                    card.innerHTML = `
                        <div class="card h-100">
                            <div class="card-body">
                                <h5 class="card-title mb-0">Data: ${dataFormatada}</h5>
                                <p class="card-text"><strong>pH:</strong> ${phArredondado}</p>
                                <p class="card-text"><strong>Cloro Livre:</strong> ${cloroLivreArredondado} ppm</p>
                                <p class="card-text"><strong>Alcalinidade:</strong> ${alcalinidadeArredondada} ppm</p>
                                <div class="d-flex justify-content-between">
                                    <i class="fas fa-cogs text-success pointer" title="Editar" onclick="abrirModalLeituraManual(null, ${id})"></i>
                                    <i class="fas fa-trash text-danger pointer" title="Excluir" onclick="deletar_leitura(${id})"></i>
                                </div>
                            </div>
                        </div>
                    `;

                    cardContainer.appendChild(card);
                });
            }
            secaoPiscina.appendChild(cardContainer);

            // Adiciona a seção da piscina ao container principal
            listaLeiturasManuais.appendChild(secaoPiscina);
        });

        // Caso existam leituras, garantir que o modo de visualização seja aplicado
        if (totalLeituras > 0) {
            aplicarModoDeVisualizacao('containerLeiturasManuais');
        }

        // Exibe o container de leituras manuais
        containerLeiturasManuais.style.display = 'block';

    } catch (error) {
        console.error('Erro ao listar leituras manuais:', error);
        Swal.fire('Erro!', 'Erro ao carregar leituras manuais!', 'error');
    } finally {
        isLoadingLeiturasManuais = false;
    }
}
function filtrarPorUltimoDia(id) {
    const dataInicio = new Date();
    const dataFim = new Date();
    dataFim.setDate(dataFim.getDate() - 1); // Último dia
    console.log(id, dataFim.toISOString().split('T')[0], dataInicio.toISOString().split('T')[0]);
    listar_leituras(id, dataFim.toISOString().split('T')[0], dataInicio.toISOString().split('T')[0]);
}
function filtrarPorUltimaSemana(id) {
    const dataInicio = new Date();
    const dataFim = new Date();
    dataFim.setDate(dataFim.getDate() - 7); // Última semana
    console.log(id, dataFim.toISOString().split('T')[0], dataInicio.toISOString().split('T')[0]);
    listar_leituras(id, dataFim.toISOString().split('T')[0], dataInicio.toISOString().split('T')[0]);
}
function filtrarPorUltimos30Dias(id) {
    const dataInicio = new Date();
    const dataFim = new Date();
    dataFim.setDate(dataFim.getDate() - 30); // Últimos 30 dias
    console.log(id, dataFim.toISOString().split('T')[0], dataInicio.toISOString().split('T')[0]);
    listar_leituras(id, dataFim.toISOString().split('T')[0], dataInicio.toISOString().split('T')[0]);
}
function filtrarPorUltimoDiaAut(id) {
    const dataInicio = new Date();
    const dataFim = new Date();
    dataFim.setDate(dataFim.getDate() - 1); // Último dia
    listar_leituras_iot(id, dataFim.toISOString().split('T')[0], dataInicio.toISOString().split('T')[0]);
}
function filtrarPorUltimaSemanaAut(id) {
    const dataInicio = new Date();
    const dataFim = new Date();
    dataFim.setDate(dataFim.getDate() - 7); // Última semana
    listar_leituras_iot(id, dataFim.toISOString().split('T')[0], dataInicio.toISOString().split('T')[0]);
}
function filtrarPorUltimos30DiasAut(id) {
    const dataInicio = new Date();
    const dataFim = new Date();
    dataFim.setDate(dataFim.getDate() - 30); // Últimos 30 dias
    listar_leituras_iot(id, dataFim.toISOString().split('T')[0], dataInicio.toISOString().split('T')[0]);
}
function filtrarLeituras() {
    const urlParams = new URLSearchParams(window.location.search);
    const piscinaId = urlParams.get('id');
    const mes = document.getElementById('filtroMes').value;
    const ano = document.getElementById('filtroAno').value;

    if (piscinaId) {
        listar_leituras_iot(piscinaId, mes, ano);
    } else {
        Swal.fire('Erro!', 'Piscina não identificada!', 'error');
    }
}

function renderizarGraficosSeparados(datas, alcalinidades, phs, cloros, ctxAlcalinidade, ctxPH, ctxCloro) {
    if (graficoAlcalinidadeInstance) {
        graficoAlcalinidadeInstance.destroy();
    }
    if (graficoPHInstance) {
        graficoPHInstance.destroy();
    }
    if (graficoCloroInstance) {
        graficoCloroInstance.destroy();
    }

    // Gráfico de pH
    graficoPHInstance = new Chart(ctxPH, {
        type: 'line',
        data: {
            labels: formatarRotulos(datas),  // Usando os rótulos formatados
            datasets: [{
                label: 'pH',
                data: phs,
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: false,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    beginAtZero: false,
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 6  // Exibir apenas algumas datas
                    }
                },
                y: {
                    beginAtZero: false,
                    min: 5,  // Valor mínimo no eixo Y
                    max: 9,  // Valor máximo no eixo Y
                    ticks: {
                        stepSize: 1  // Intervalo de ticks no eixo Y
                    }
                }
            },
            plugins: {
                annotation: {
                    annotations: {
                        linhaMinima: {
                            type: 'line',
                            yMin: 7.2,
                            yMax: 7.2,
                            borderColor: 'rgba(0, 255, 0, 0.5)',  // Cor verde
                            borderWidth: 2,
                            label: {
                                content: '', // legenda para linha
                                enabled: true,
                                position: 'start'
                            }
                        },
                        linhaMaxima: {
                            type: 'line',
                            yMin: 7.6,
                            yMax: 7.6,
                            borderColor: 'rgba(0, 255, 0, 0.5)', // Cor verde
                            borderWidth: 2,
                            label: {
                                content: '', // legenda para linha
                                enabled: true,
                                position: 'start'
                            }
                        }
                    }
                }
            }
        }
    });

    // Gráfico de Cloro Livre
    graficoCloroInstance = new Chart(ctxCloro, {
        type: 'line',
        data: {
            labels: formatarRotulos(datas),  // Usando os rótulos formatados
            datasets: [{
                label: 'Cloro Livre',
                data: cloros,
                borderColor: 'rgba(255, 206, 86, 1)',
                fill: false,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 6  // Limita a 5 rótulos no eixo X
                    }
                },
                y: {
                    beginAtZero: false,
                    min: 0,   // Valor mínimo no eixo Y
                    max: 5,   // Valor máximo no eixo Y
                    ticks: {
                        stepSize: 0.5  // Define o intervalo entre os ticks
                    }
                }
            },
            plugins: {
                annotation: {
                    annotations: {
                        linhaMinima: {
                            type: 'line',
                            yMin: 0.6,
                            yMax: 0.6,
                            borderColor: 'rgba(0, 255, 0, 0.5)', // Cor verde
                            borderWidth: 2,
                            label: {
                                content: 'Mín.',
                                enabled: true,
                                position: 'start'
                            }
                        },
                        linhaMaxima: {
                            type: 'line',
                            yMin: 3,
                            yMax: 3,
                            borderColor: 'rgba(0, 255, 0, 0.5)', // Cor verde
                            borderWidth: 2,
                            label: {
                                content: 'Máx.',
                                enabled: true,
                                position: 'start'
                            }
                        }
                    }
                }
            }
        }
    });

    // Gráfico de Alcalinidade
    graficoAlcalinidadeInstance = new Chart(ctxAlcalinidade, {
        type: 'line',
        data: {
            labels: formatarRotulos(datas),  // Usando os rótulos formatados
            datasets: [{
                label: 'Alcalinidade',
                data: alcalinidades,  // Assumindo que esta variável contém os dados de alcalinidade
                borderColor: 'rgba(54, 162, 235, 1)', // Cor da linha
                fill: false,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    beginAtZero: false,
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 6  // Exibir apenas algumas datas
                    }
                },
                y: {
                    beginAtZero: false,
                    min: 0,   // Valor mínimo no eixo Y
                    max: 200, // Ajuste conforme necessário
                    ticks: {
                        stepSize: 20  // Define o intervalo entre os ticks
                    }
                }
            },
            plugins: {
                annotation: {
                    annotations: {
                        linhaMinima: {
                            type: 'line',
                            yMin: 80,  // Ajuste conforme necessário
                            yMax: 80,
                            borderColor: 'rgba(0, 255, 0, 0.5)', // Cor verde
                            borderWidth: 2,
                            label: {
                                content: 'Mín.',
                                enabled: true,
                                position: 'start'
                            }
                        },
                        linhaMaxima: {
                            type: 'line',
                            yMin: 120,  // Ajuste conforme necessário
                            yMax: 120,
                            borderColor: 'rgba(0, 255, 0, 0.5)', // Cor verde
                            borderWidth: 2,
                            label: {
                                content: 'Máx.',
                                enabled: true,
                                position: 'start'
                            }
                        }
                    }
                }
            }
        }
    });

}
function renderizarGraficosSeparados_iot(datas, temperaturas, phs, orps, ctxAutTemperatura, ctxAutPH, ctxAutORP) {
    const isDark = document.body.classList.contains('dark-theme');
    const tituloCor = isDark ? '#fff' : '#333';

    // Destroi gráficos existentes
    if (graficoAutTemperaturaInstance) graficoAutTemperaturaInstance.destroy();
    if (graficoAutPHInstance) graficoAutPHInstance.destroy();
    if (graficoAutORPInstance) graficoAutORPInstance.destroy();

    const tituloStyle = (texto) => ({
        display: true,
        text: texto,
        font: {
            size: 18,
            weight: 'bold'
        },
        color: tituloCor,
        padding: {
            top: 10,
            bottom: 20
        }
    });

    // Determina o último dia com registros
    const datasConvertidas = datas.map(d => new Date(d));
    const ultimoDia = Math.max(...datasConvertidas.map(d => d.getDate()));
    const maxTicks = ultimoDia <= 15 ? 30 : 31;

    // Gráfico Temperatura
    graficoAutTemperaturaInstance = new Chart(ctxAutTemperatura, {
        type: 'line',
        data: {
            labels: datasConvertidas,
            datasets: [{
                label: 'Temperatura',
                data: datas.map((d, i) => ({ x: new Date(d), y: temperaturas[i] })),
                borderColor: 'rgba(54, 162, 235, 1)',
                fill: false,
                borderWidth: 1,
                pointRadius: 0,
                pointHoverRadius: 5,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: tituloStyle('Temperatura (°C)'),
                legend: { display: false },
                annotation: { annotations: {} }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'hour',
                        tooltipFormat: 'dd/MM/yyyy HH:mm',
                        displayFormats: {
                            minute: 'dd/MM HH:mm',
                            hour: 'dd/MM HH:mm',
                            day: 'dd/MM',
                            month: 'MM/yyyy'
                        }
                    },
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: maxTicks,
                        maxRotation: 0,
                        callback: function(value) {
                            const date = new Date(value);
                            const diaHora = date.toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit'
                            });
                            const horaMinuto = date.toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                            });
                            return [diaHora, horaMinuto];
                        }
                    }
                },
                y: {
                    min: 0,
                    max: 35,
                    ticks: { stepSize: 5 }
                }
            }
        }
    });

    // Gráfico pH
    graficoAutPHInstance = new Chart(ctxAutPH, {
        type: 'line',
        data: {
            labels: datasConvertidas,
            datasets: [{
                label: 'pH',
                data: datas.map((d, i) => ({ x: new Date(d), y: phs[i] })),
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: false,
                borderWidth: 1,
                pointRadius: 0,
                pointHoverRadius: 5,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: tituloStyle('pH'),
                legend: { display: false },
                annotation: { annotations: {} }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'hour',
                        tooltipFormat: 'dd/MM/yyyy HH:mm',
                        displayFormats: {
                            minute: 'dd/MM HH:mm',
                            hour: 'dd/MM HH:mm',
                            day: 'dd/MM',
                            month: 'MM/yyyy'
                        }
                    },
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: maxTicks,
                        maxRotation: 0,
                        callback: function(value) {
                            const date = new Date(value);
                            const diaHora = date.toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit'
                            });
                            const horaMinuto = date.toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                            });
                            return [diaHora, horaMinuto];
                        }
                    }
                },
                y: {
                    min: 0,
                    max: 14,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });

    // Gráfico ORP
    graficoAutORPInstance = new Chart(ctxAutORP, {
        type: 'line',
        data: {
            labels: datasConvertidas,
            datasets: [{
                label: 'ORP',
                data: datas.map((d, i) => ({ x: new Date(d), y: orps[i] })),
                borderColor: 'rgba(255, 206, 86, 1)',
                fill: false,
                borderWidth: 1,
                pointRadius: 0,
                pointHoverRadius: 5,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: tituloStyle('ORP (mV)'),
                legend: { display: false },
                annotation: { annotations: {} }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'hour',
                        tooltipFormat: 'dd/MM/yyyy HH:mm',
                        displayFormats: {
                            minute: 'dd/MM HH:mm',
                            hour: 'dd/MM HH:mm',
                            day: 'dd/MM',
                            month: 'MM/yyyy'
                        }
                    },
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: maxTicks,
                        maxRotation: 0,
                        callback: function(value) {
                            const date = new Date(value);
                            const diaHora = date.toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit'
                            });
                            const horaMinuto = date.toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                            });
                            return [diaHora, horaMinuto];
                        }
                    }
                },
                y: {
                    min: 0,
                    max: 1000,
                    ticks: { stepSize: 100 }
                }
            }
        }
    });

    // Exibe os botões de exportação
    document.getElementById('btnExportGraficosPNG').style.display = 'inline-block';
    document.getElementById('btnExportGraficosPDF').style.display = 'inline-block';

    // Garante que a tabela comece oculta e botão atualizado
    document.getElementById("tabelaAutLeituras").style.display = "none";
    document.getElementById("btnToggleTabela").innerText = "Mostrar Tabela";
}


// Função para formatar a data em Dia/Mês e Hora:Minuto
function formatarData(dataString) {
    const date = new Date(dataString); // Cria um objeto Date a partir da string
    const dia = String(date.getDate()).padStart(2, '0'); // Obtém o dia e adiciona zero à esquerda
    const mes = String(date.getMonth() + 1).padStart(2, '0'); // Obtém o mês (0-11) e adiciona 1
    const hora = String(date.getHours()).padStart(2, '0'); // Obtém a hora
    const minuto = String(date.getMinutes()).padStart(2, '0'); // Obtém os minutos
    // Retorna um array com data e hora
    return [`${dia}/${mes} ${hora}:${minuto}`];
}
// Função para formatar a data em Dia/Mês e Hora:Minuto
function formatarDataTab(dataString) {
    const date = new Date(dataString); // Cria um objeto Date a partir da string
    const ano = date.getFullYear();
    const dia = String(date.getDate()).padStart(2, '0'); // Obtém o dia e adiciona zero à esquerda
    const mes = String(date.getMonth() + 1).padStart(2, '0'); // Obtém o mês (0-11) e adiciona 1
    const hora = String(date.getHours()).padStart(2, '0'); // Obtém a hora
    const minuto = String(date.getMinutes()).padStart(2, '0'); // Obtém os minutos
    // Retorna um array com data e hora
    return [`${dia}/${mes}/${ano} ${hora}:${minuto}`];
}
// Função para formatar todos os rótulos
function formatarRotulos(datas) {
    return datas.map(formatarData).map(label => label.join('\n')); // Formata todas as datas e une com <br>
}
//CADASTROS------------------------------------------------------------------------------------------------------------------------------
function cadastrar_endereco() {
    //let id = document.querySelector('#enderecoID').value;
    let nome = document.querySelector('#enderecoNome').value;
    let tipo = document.querySelector('#enderecoTipo').value;
    let logradouro = document.querySelector('#enderecoLogradouro').value;
    let cidade = document.querySelector('#enderecoCidade').value;
    let estado = document.querySelector('#enderecoEstado').value;
    let cep = document.querySelector('#enderecoCep').value;

    $.ajax({
        url: '../../backend/cadastro_endereco.php',
        type: 'post',
        async: true,
        data: {
            //id,
            nome,
            tipo,
            logradouro,
            cidade,
            estado,
            cep
        },
        success: (resultado) => {
            // Tente analisar a resposta JSON
            try {
                const response = JSON.parse(resultado);
                if (response.success) {
                    Swal.fire('Sucesso!', resultado.message, 'success').then(() => {
                        $('#modal_endereco').modal('hide'); // Fecha o modal
                        limparModal();
                        listar_enderecos();
                    });
                } else {
                    Swal.fire('Erro!', response.message, 'error');
                }
            } catch (e) {
                console.error('Erro ao analisar a resposta:', e);
                Swal.fire('Erro!', 'Erro inesperado ao atualizar endereço!', 'error');
            }
        },
        error: (resultado) => {
            console.error('Erro na requisição:', resultado);
            Swal.fire('Erro!', 'Erro ao comunicar com o servidor!', 'error');
        }
    });


}
function cadastrar_piscina() {
    let localID = document.querySelector('#piscinaLocalID').value;
    let nome = document.querySelector('#piscinaNome').value;
    let volume = document.querySelector('#piscinaVolume').value;
    let controle_cloro = document.querySelector('#piscinaControleCloro').value;
    let controle_ph = document.querySelector('#piscinaControlePh').value;

    if (!nome || !volume || !controle_cloro || !controle_ph) {
        Swal.fire('Erro!', 'Preencha todos os campos!', 'error');
        return;
    }

    $.ajax({
        url: '../../backend/cadastro_piscina.php',
        type: 'post',
        async: true,
        data: {
            endereco_id: localID,
            nome,
            volume,
            controle_cloro,
            controle_ph
        },
        success: (resultado) => {
            let response;
            try {
                response = JSON.parse(resultado);
            } catch (e) {
                console.error('Erro ao analisar a resposta:', e);
                Swal.fire('Erro!', 'Resposta inesperada do servidor!', 'error');
                return;
            }

            if (response.success) {
                Swal.fire('Sucesso!', response.message, 'success').then(() => {
                    $('#modal_piscina').modal('hide');
                    limparModal();
                    listar_piscinas();
                });
            } else {
                Swal.fire('Erro!', response.message, 'error');
            }
        },
        error: (resultado) => {
            console.error('Erro na requisição:', resultado);
            Swal.fire('Erro!', 'Erro ao comunicar com o servidor!', 'error');
        }
    });
}
function cadastrar_dispositivo() {
    const dispositivoTipo = document.getElementById('dispositivoTipo').value;
    const dispositivoModelo = document.getElementById('dispositivoModelo').value;
    const mac1 = document.getElementById('dispositivoMac1').value;
    const piscinaID = document.getElementById('dispositivoPiscinaID').value;
    const tempHabilitada = document.querySelector('#dispositivoTempHabilitada').checked ? 1 : 0;

<<<<<<< codex/remove-mac-2-input-and-references
    // Validação dos campos principais
    if (!dispositivoNome || !dispositivoTipo || !dispositivoModelo || !mac1 || !piscinaID) {
        Swal.fire('Erro!', 'Preencha todos os campos!', 'error');
        return;
    }
=======
    // Validação dos campos principais
    if (!dispositivoTipo || !dispositivoModelo || !mac1 || !mac2 || !piscinaID) {
        Swal.fire('Erro!', 'Preencha todos os campos!', 'error');
        return;
    }
>>>>>>> main

    // Validação dos endereços MAC (somente alfanuméricos com 12 caracteres)
    const macRegex = /^[0-9A-Fa-f]{12}$/;
    if (!macRegex.test(mac1)) {
        Swal.fire('Erro!', 'Os endereços MAC devem conter apenas 12 caracteres alfanuméricos (sem separadores)!', 'error');
        return;
    }

    // Cria o FormData e adiciona os campos principais
    const formData = new FormData();
    formData.append('tipo', dispositivoTipo);
    formData.append('modelo', dispositivoModelo);
    formData.append('mac1', mac1);
    formData.append('piscina_id', piscinaID);
    formData.append('temp_habilitada', tempHabilitada); // ✅ Agora está no lugar certo

    // Adiciona os campos das entradas digitais (di01 até di08)
    for (let i = 1; i <= 8; i++) {
        const index = i < 10 ? '0' + i : i;
        const di_nome = document.getElementById('di' + index + '_nome').value;
        const di_tipo = document.getElementById('di' + index + '_tipo').value;
        formData.append('di' + index + '_nome', di_nome);
        formData.append('di' + index + '_tipo', di_tipo);
    }

    // Adiciona os campos das entradas analógicas (ai01 até ai04)
    for (let i = 1; i <= 4; i++) {
        const index = i < 10 ? '0' + i : i;
        const ai_funcao = document.getElementById('ai' + index + '_funcao');
        formData.append('ai' + index + '_funcao', ai_funcao ? ai_funcao.value : '');
    }

    // Envia os dados para o backend
    fetch('../../backend/cadastro_dispositivo.php', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.text())
    .then(data => {
        Swal.fire('Sucesso!', data, 'success');
        $('#modal_dispositivo').modal('hide'); // Fecha o modal
        // Atualizar listagem se necessário
    })
    .catch(error => {
        console.error('Erro ao cadastrar dispositivo:', error);
        Swal.fire('Erro!', 'Erro ao comunicar com o servidor!', 'error');
    });
}


function cadastrar_leitura() {
    const piscina_id = document.getElementById('leituraPiscinaID').value;
    const alcalinidade = document.getElementById('alcalinidade').value;
    const ph = document.getElementById('ph').value;
    const cloro_livre = document.getElementById('cloroLivre').value;

    // Validação básica
    if (!piscina_id) {
        Swal.fire('Erro!', 'Por favor, selecione uma piscina.', 'error');
        return;
    }

    if (alcalinidade === '' || ph === '' || cloro_livre === '') {
        Swal.fire('Erro!', 'Por favor, preencha todos os campos.', 'error');
        return;
    }

    // Opcional: Desabilitar o botão de submissão e mostrar um spinner para indicar carregamento
    const btnCadastrar = document.getElementById('btnCadastrarLeituraModal');
    btnCadastrar.disabled = true;
    btnCadastrar.innerHTML = 'Cadastrando... <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';

    $.ajax({
        url: '../../backend/cadastro_leitura.php',
        type: 'POST',
        data: { piscina_id, alcalinidade, ph, cloro_livre },
        dataType: 'json', // Especifica que estamos esperando uma resposta JSON
        success: (resposta) => {
            // Reabilita o botão e restaura o texto original
            btnCadastrar.disabled = false;
            btnCadastrar.innerHTML = 'Cadastrar Leitura';

            if (resposta.success) {
                Swal.fire({
                    title: 'Sucesso',
                    text: resposta.message || 'Leitura cadastrada com sucesso!',
                    icon: 'success',
                    confirmButtonText: 'Ok'
                });
                $('#modal_leitura').modal('hide');

                // Opcional: Limpar os campos do formulário após o sucesso
                document.getElementById('alcalinidade').value = '';
                document.getElementById('ph').value = '';
                document.getElementById('cloroLivre').value = '';

                listar_leituras_manuais(piscina_id); // Atualiza a lista de leituras para a piscina específica
            } else {
                Swal.fire({
                    title: 'Erro',
                    text: resposta.message || 'Erro ao cadastrar a leitura.',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                });
            }
        },
        error: (jqXHR, textStatus, errorThrown) => {
            // Reabilita o botão e restaura o texto original
            btnCadastrar.disabled = false;
            btnCadastrar.innerHTML = 'Cadastrar Leitura';

            console.error('Erro na requisição:', textStatus, errorThrown);
            Swal.fire('Erro!', 'Erro ao comunicar com o servidor!', 'error');
        }
    });
}

function buscarEnderecoPorCEP() {
    let cep = $('#enderecoCep').val().replace(/\D/g, ''); // Remove caracteres não numéricos

    if (cep.length === 8) { // Verifica se o CEP tem 8 dígitos
        // Exibir mensagem de carregamento
        Swal.fire({
            title: 'Buscando...',
            text: 'Aguarde um momento enquanto buscamos as informações do endereço.',
            allowEscapeKey: false,
            allowOutsideClick: false,
            onBeforeOpen: () => {
                Swal.showLoading();
            }
        });

        $.getJSON(`https://viacep.com.br/ws/${cep}/json/`, function(data) {
            // Fechar a mensagem de loading
            Swal.close();

            if (!data.erro) {
                $('#enderecoLogradouro').val(data.logradouro);
                $('#enderecoCidade').val(data.localidade);
                $('#enderecoEstado').val(data.uf);
            } else {
                Swal.fire('Erro!', 'CEP não encontrado.', 'error');
                $('#enderecoLogradouro').val('');
                $('#enderecoCidade').val('');
                $('#enderecoEstado').val('');
            }
        }).fail(function() {
            // Fechar a mensagem de loading em caso de falha na requisição
            Swal.close();
            Swal.fire('Erro!', 'Falha ao buscar o CEP. Tente novamente.', 'error');
            $('#enderecoLogradouro').val('');
            $('#enderecoCidade').val('');
            $('#enderecoEstado').val('');
        });
    } else {
        // Limpa os campos se o CEP não for válido
        $('#enderecoLogradouro').val('');
        $('#enderecoCidade').val('');
        $('#enderecoEstado').val('');
    }
}
function limparModal() {
    document.querySelector('#enderecoID').value = ''
    document.querySelector('#enderecoNome').value = ''
    document.querySelector('#enderecoTipo').value = ''
    document.querySelector('#enderecoLogradouro').value = ''
    document.querySelector('#enderecoCidade').value = ''
    document.querySelector('#enderecoEstado').value = ''
    document.querySelector('#enderecoCep').value = ''

    document.querySelector('#piscinaID').value = ''
    document.querySelector('#piscinaNome').value = ''
    document.querySelector('#piscinaVolume').value = ''
    document.querySelector('#piscinaControleCloro').value = ''
    document.querySelector('#piscinaControlePh').value = ''
}

function limparModalDispositivo() {
    document.querySelector('#dispositivoID').value = '';
    document.querySelector('#dispositivoPiscinaID').value = '';
    document.querySelector('#dispositivoTipo').value = '';
    const modeloSelect = document.querySelector('#dispositivoModelo');
    if (modeloSelect) modeloSelect.innerHTML = '<option value="">Selecione o modelo</option>';
    document.querySelector('#dispositivoMac1').value = '';
    document.querySelector('#dispositivoTempHabilitada').checked = false;

    // Limpa entradas digitais (di01 a di08)
    for (let i = 1; i <= 8; i++) {
        const index = i < 10 ? '0' + i : i;
        document.querySelector('#di' + index + '_nome').value = '';
        document.querySelector('#di' + index + '_tipo').value = '0';
    }

    // Limpa entradas analógicas (ai01 a ai04)
    for (let i = 1; i <= 4; i++) {
        const index = i < 10 ? '0' + i : i;
        const elem = document.querySelector('#ai' + index + '_funcao');
        if (elem) elem.value = '';
    }

    // Também limpa o select de piscina
    const piscinaSelect = document.querySelector('#dispositivoPiscina');
    if (piscinaSelect) piscinaSelect.value = '';

    // Oculta o fieldset de entradas analógicas por padrão
    const analogFieldset = document.getElementById('analogInputsFieldset');
    if (analogFieldset) analogFieldset.style.display = 'none';
}

function atualizarFieldsetsPorTipo() {
    const tipo = document.getElementById('dispositivoTipo')?.value || '';
    const digitalFieldset = document.getElementById('digitalFieldset');
    const analogFieldset = document.getElementById('analogFieldset');
    const mostrar = tipo === 'Central de monitoramento';

    if (digitalFieldset) {
        digitalFieldset.style.display = mostrar ? 'block' : 'none';
        if (!mostrar) {
            for (let i = 1; i <= 8; i++) {
                const index = i < 10 ? '0' + i : i;
                const nomeInput = document.getElementById('di' + index + '_nome');
                const tipoSelect = document.getElementById('di' + index + '_tipo');
                if (nomeInput) nomeInput.value = '';
                if (tipoSelect) tipoSelect.value = '0';
            }
        }
    }

    if (analogFieldset) {
        analogFieldset.style.display = mostrar ? 'block' : 'none';
        if (!mostrar) {
            analogFieldset.querySelectorAll('input').forEach(input => {
                input.value = '';
            });
        }
    }
}

function atualizarFieldsetsPorTipo() {
    const tipo = document.getElementById('dispositivoTipo')?.value || '';
    const digitalFieldset = document.getElementById('digitalFieldset');
    const analogFieldset = document.getElementById('analogFieldset');
    const mostrar = tipo === 'Central de monitoramento';

    if (digitalFieldset) {
        digitalFieldset.style.display = mostrar ? 'block' : 'none';
        if (!mostrar) {
            for (let i = 1; i <= 8; i++) {
                const index = i < 10 ? '0' + i : i;
                const nomeInput = document.getElementById('di' + index + '_nome');
                const tipoSelect = document.getElementById('di' + index + '_tipo');
                if (nomeInput) nomeInput.value = '';
                if (tipoSelect) tipoSelect.value = '0';
            }
        }
    }

    if (analogFieldset) {
        analogFieldset.style.display = mostrar ? 'block' : 'none';
        if (!mostrar) {
            analogFieldset.querySelectorAll('input').forEach(input => {
                input.value = '';
            });
        }
    }
}

//EDIÇOES------------------------------------------------------------------------------------------------------------------------------
function editar_endereco() {
    let id = document.querySelector('#enderecoID').value;
    let nome = document.querySelector('#enderecoNome').value;
    let tipo = document.querySelector('#enderecoTipo').value;
    let logradouro = document.querySelector('#enderecoLogradouro').value;
    let cidade = document.querySelector('#enderecoCidade').value;
    let estado = document.querySelector('#enderecoEstado').value;
    let cep = document.querySelector('#enderecoCep').value;

    $.ajax({
        url: '../../backend/edicao_endereco.php',
        type: 'post',
        async: true,
        data: {
            id,
            nome,
            tipo,
            logradouro,
            cidade,
            estado,
            cep
        },
        success: (resultado) => {
            // Tente analisar a resposta JSON
            try {
                const response = JSON.parse(resultado);
                if (response.success) {
                    Swal.fire('Sucesso!', resultado.message, 'success').then(() => {
                        $('#modal_endereco').modal('hide'); // Fecha o modal
                        $('#modal_endereco').on('hidden.bs.modal', function () {
                            // Redireciona o foco para um elemento apropriado após o modal ser fechado
                            $('#btnCadastrarEndereco').focus(); // Ou qualquer outro elemento que você deseje
                        });
                    });
                } else {
                    Swal.fire('Erro!', response.message, 'error');
                }
            } catch (e) {
                console.error('Erro ao analisar a resposta:', e);
                Swal.fire('Erro!', 'Erro inesperado ao atualizar endereço!', 'error');
            }
        },
        error: (resultado) => {
            console.error('Erro na requisição:', resultado);
            Swal.fire('Erro!', 'Erro ao comunicar com o servidor!', 'error');
        }
    });

    limparModal();
    listar_enderecos();
}
function editar_piscina() {
    let id = document.querySelector('#piscinaID').value;
    let nome = document.querySelector('#piscinaNome').value;
    let volume = document.querySelector('#piscinaVolume').value;
    let controle_cloro = document.querySelector('#piscinaControleCloro').value;
    let controle_ph = document.querySelector('#piscinaControlePh').value;

    // Verifica se algum campo está vazio
    if (!id || !nome || !volume || !controle_cloro || !controle_ph) {
        Swal.fire('Erro!', 'Preencha todos os campos!', 'error');
        return; // Interrompe a execução da função
    }

    $.ajax({
        url: '../../backend/edicao_piscina.php',
        type: 'post',
        async: true,
        data: {
            id,
            nome,
            volume,
            controle_cloro,
            controle_ph
        },
        success: (resultado) => {
            console.log("Resultado", resultado);
            // Tente analisar a resposta JSON
            try {
                const response = JSON.parse(resultado);
                if (response.success) {
                    Swal.fire('Sucesso!', response.message, 'success').then(() => {
                        $('#modal_piscina').modal('hide'); // Fecha o modal
                        $('#modal_piscina').on('hidden.bs.modal', function () {
                            // Redireciona o foco para um elemento apropriado após o modal ser fechado
                            $('#btnCadastrarPiscina').focus(); // Ou qualquer outro elemento que você deseje
                        });
                    });
                } else {
                    Swal.fire('Erro!', response.message, 'error');
                }
            } catch (e) {
                console.error('Erro ao analisar a resposta:', e);
                Swal.fire('Erro!', 'Erro inesperado ao atualizar piscina!', 'error');
            }
        },
        error: (resultado) => {
            console.error('Erro na requisição:', resultado);
            Swal.fire('Erro!', 'Erro ao comunicar com o servidor!', 'error');
        }
    });

    limparModal();
    listar_piscinas();
}
function editar_dispositivo() {
    // Recupera os dados principais
    let id = document.querySelector('#dispositivoID').value;
    let tipo = document.querySelector('#dispositivoTipo').value;
    let modelo = document.querySelector('#dispositivoModelo').value;
    let mac1 = document.querySelector('#dispositivoMac1').value;
    let piscina_id = document.querySelector('#dispositivoPiscinaID').value;
    let temp_habilitada = document.querySelector('#dispositivoTempHabilitada').checked ? 1 : 0;

    // Verifica se os campos obrigatórios estão preenchidos
<<<<<<< codex/remove-mac-2-input-and-references
    if (!id || !nome || !tipo || !modelo || !mac1 || !piscina_id) {
        Swal.fire('Erro!', 'Preencha todos os campos obrigatórios!', 'error');
        return;
    }
=======
    if (!id || !tipo || !modelo || !mac1 || !mac2 || !piscina_id) {
        Swal.fire('Erro!', 'Preencha todos os campos obrigatórios!', 'error');
        return;
    }
>>>>>>> main

    // Coleta os dados das entradas digitais (di01 até di08)
    let digitalInputs = {};
    for (let i = 1; i <= 8; i++) {
        let index = i < 10 ? '0' + i : i;
        digitalInputs['di' + index + '_nome'] = document.querySelector('#di' + index + '_nome').value;
        digitalInputs['di' + index + '_tipo'] = document.querySelector('#di' + index + '_tipo').value;
    }

    // Coleta os dados das entradas analógicas (ai01 até ai04)
    let analogInputs = {};
    for (let i = 1; i <= 4; i++) {
        let index = i < 10 ? '0' + i : i;
        const elem = document.querySelector('#ai' + index + '_funcao');
        analogInputs['ai' + index + '_funcao'] = elem ? elem.value : '';
    }

    // Envia os dados para o backend via AJAX
    $.ajax({
        url: '../../backend/edicao_dispositivo.php',
        type: 'post',
        async: true,
<<<<<<< codex/remove-mac-2-input-and-references
        data: Object.assign({
            id: id,
            nome: nome,
            tipo: tipo,
            modelo: modelo,
            mac1: mac1,
=======
        data: Object.assign({
            id: id,
            tipo: tipo,
            modelo: modelo,
            mac1: mac1,
            mac2: mac2,
>>>>>>> main
            piscina_id: piscina_id,
            temp_habilitada: temp_habilitada
        }, digitalInputs, analogInputs),
        success: (resultado) => {
            console.log("Resultado", resultado);
            try {
                const response = JSON.parse(resultado);
                if (response.success) {
                    Swal.fire('Sucesso!', response.message, 'success').then(() => {
                        $('#modal_dispositivo').modal('hide');
                        $('#modal_dispositivo').on('hidden.bs.modal', function () {
                            // Foco ou outras ações pós-fechamento, se necessário
                        });
                    });
                } else {
                    Swal.fire('Erro!', response.message, 'error');
                }
            } catch (e) {
                console.error('Erro ao analisar a resposta:', e);
                Swal.fire('Erro!', 'Erro inesperado ao atualizar dispositivo!', 'error');
            }
        },
        error: (resultado) => {
            console.error('Erro na requisição:', resultado);
            Swal.fire('Erro!', 'Erro ao comunicar com o servidor!', 'error');
        }
    });

    limparModalDispositivo();
    listar_dispositivos();
}

function editar_usuario() {
    const nome = document.querySelector('#usuarioNome').value;
    const email = document.querySelector('#usuarioEmail').value;
    const novaSenha = document.querySelector('#novaSenha').value;
    const confirmarSenha = document.querySelector('#confirmarSenha').value;

    if (novaSenha !== confirmarSenha) {
        Swal.fire('Erro', 'As senhas não correspondem!', 'error');
        return;
    }

    $.ajax({
        url: '../../backend/editar_usuario.php',
        type: 'post',
        async: true,
        data: {
            nome: nome,
            email: email,
            senha: novaSenha
        },
        success: (response) => {
            try {
                const result = typeof response === 'string' ? JSON.parse(response) : response;
    
                if (result.success) {
                    Swal.fire('Sucesso', 'Dados atualizados com sucesso!', 'success');
                    $('#modal_usuario').modal('hide');
                } else {
                    Swal.fire('Erro', result.message || 'Erro ao atualizar dados do usuário.', 'error');
                }
            } catch (error) {
                Swal.fire('Erro', 'Resposta inválida do servidor.', 'error');
            }
        },
        error: (xhr, status, error) => {
            console.error('Erro ao atualizar dados do usuário:', error);
            Swal.fire('Erro', 'Não foi possível completar a solicitação.', 'error');
        }
    });
}
function editar_leitura() {
    const leitura_id = document.getElementById('leituraID').value;
    const piscina_id = document.getElementById('leituraPiscinaID').value;
    const alcalinidade = document.getElementById('alcalinidade').value;
    const ph = document.getElementById('ph').value;
    const cloro_livre = document.getElementById('cloroLivre').value;

    // Validação básica
    if (!piscina_id) {
        Swal.fire('Erro!', 'Por favor, selecione uma piscina.', 'error');
        return;
    }

    if (alcalinidade === '' || ph === '' || cloro_livre === '') {
        Swal.fire('Erro!', 'Por favor, preencha todos os campos.', 'error');
        return;
    }

    $.ajax({
        url: '../../backend/editar_leitura.php', // Endpoint para editar leitura
        type: 'POST',
        data: { leitura_id, piscina_id, alcalinidade, ph, cloro_livre },
        dataType: 'json', // Espera resposta JSON
        success: (resposta) => {
            if (resposta.success) {
                Swal.fire({
                    title: 'Sucesso',
                    text: resposta.message,
                    icon: 'success',
                    confirmButtonText: 'Ok'
                });
                $('#modal_leitura').modal('hide');
                listar_leituras_manuais(piscina_id); // Atualiza a listagem de leituras para a piscina específica
            } else {
                Swal.fire({
                    title: 'Erro!',
                    text: resposta.message,
                    icon: 'error',
                    confirmButtonText: 'Ok'
                });
            }
        },
        error: (resposta) => {
            console.error('Erro na requisição:', resposta);
            Swal.fire('Erro!', 'Erro ao comunicar com o servidor!', 'error');
        }
    });
}

function compartilhar_endereco() {
    //let deviceIdCompartilhado = document.getElementById('deviceIdCompartilhado').value;
    let endereco_id = document.getElementById('enderecoIDCompartilhado').value;
    let email = document.getElementById('emailUsuario').value;

    $.ajax({
        url: '../../backend/compartilhar_endereco.php', // Endereço do arquivo PHP
        type: 'post',
        data: {
            email,
            endereco_id
        },
        success: (response) => {
            const resultado = JSON.parse(response); // Analisa a resposta JSON
            if (resultado.success) {
                Swal.fire('Sucesso!', resultado.message, 'success'); // Exibe mensagem de sucesso
            } else {
                // Exibe a mensagem de erro específica retornada pelo PHP
                Swal.fire('Erro!', resultado.message, 'error');
            }
        },
        error: (xhr, status, error) => {
            // Mensagem genérica de erro em caso de falha na requisição
            Swal.fire('Erro!', 'Erro ao comunicar com o servidor: ' + error, 'error');
        }
    });
    
}
//DELETES------------------------------------------------------------------------------------------------------------------------------
function deletar_endereco(enderecoid) {
    // Exibe um alerta de confirmação antes de excluir
    Swal.fire({
        title: 'Tem certeza que deseja excluir este endereço?',
        text: "Você não poderá reverter essa ação!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Faz a requisição para o backend via AJAX
            $.ajax({
                url: '../../backend/deletar_endereco.php',
                type: 'POST',
                data: {
                    endereco_id: enderecoid
                },
                success: (response) => {
                    const resultado = JSON.parse(response);
                    if (resultado.success) {
                        Swal.fire('Excluído!', resultado.message, 'success');
                        // Atualiza a lista de endereços compartilhados após a exclusão
                        listar_enderecos();
                    } else {
                        Swal.fire('Erro!', resultado.message, 'error');
                    }
                },
                error: (xhr, status, error) => {
                    Swal.fire('Erro!', 'Erro ao comunicar com o servidor: ' + error, 'error');
                }
            });
        }
    });
}
function deletar_compartilhamento(compartilhamentoid) {
    // Exibe um alerta de confirmação antes de excluir
    Swal.fire({
        title: 'Tem certeza que deseja excluir este compartilhamento?',
        text: "Você não poderá reverter essa ação!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Faz a requisição para o backend via AJAX
            $.ajax({
                url: '../../backend/deletar_compartilhamento.php',
                type: 'POST',
                data: {
                    compartilhamento_id: compartilhamentoid
                },
                success: (response) => {
                    const resultado = JSON.parse(response);
                    if (resultado.success) {
                        Swal.fire('Excluído!', resultado.message, 'success');
                        // Atualiza a lista de endereços compartilhados após a exclusão
                        listar_enderecosCompartilhados();
                    } else {
                        Swal.fire('Erro!', resultado.message, 'error');
                    }
                },
                error: (xhr, status, error) => {
                    Swal.fire('Erro!', 'Erro ao comunicar com o servidor: ' + error, 'error');
                }
            });
        }
    });
}
function deletar_piscina(piscinaid) {
    Swal.fire({
        title: 'Tem certeza?',
        text: "Você não poderá reverter isso!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, deletar!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '../../backend/deletar_piscina.php', // Backend para deletar a piscina
                type: 'POST',
                data: { piscina_id: piscinaid },
                success: (response) => {
                    const resultado = JSON.parse(response);
                    if (resultado.success) {
                        Swal.fire('Deletado!', resultado.message, 'success');
                        // Atualiza a lista de piscinas
                        listar_piscinasPost(resultado.endereco_id);
                    } else {
                        Swal.fire('Erro!', resultado.message, 'error');
                    }
                },
                error: (xhr, status, error) => {
                    Swal.fire('Erro!', 'Erro ao comunicar com o servidor.', 'error');
                }
            });
        }
    });
}
function deletar_dispositivo(dispositivoid) {
    Swal.fire({
        title: 'Tem certeza?',
        text: "Você não poderá reverter isso!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, deletar!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '../../backend/deletar_dispositivo.php', // Backend para deletar a piscina
                type: 'POST',
                data: { dispositivo_id: dispositivoid },
                success: (response) => {
                    const resultado = JSON.parse(response);
                    if (resultado.success) {
                        Swal.fire('Deletado!', resultado.message, 'success');
                        // Atualiza a lista de dispositos
                        listar_dispositivo();
                    } else {
                        Swal.fire('Erro!', resultado.message, 'error');
                    }
                },
                error: (xhr, status, error) => {
                    Swal.fire('Erro!', 'Erro ao comunicar com o servidor.', 'error');
                }
            });
        }
    });
}
function deletar_leitura(leituraId) {
    Swal.fire({
        title: 'Tem certeza?',
        text: 'Você não poderá reverter essa ação!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Faz a requisição para excluir a leitura
            $.ajax({
                url: '../../backend/deletar_leitura.php', // Endpoint para excluir leitura
                type: 'POST',
                data: { leitura_id: leituraId },
                dataType: 'json', // Especifica que espera JSON
                success: (resposta) => {
                    if (resposta.success) {
                        Swal.fire('Excluído!', resposta.message, 'success');
                        // Atualiza a listagem de leituras
                        listar_leituras_manuais();
                    } else {
                        Swal.fire('Erro!', resposta.message, 'error');
                    }
                },
                error: (resposta) => {
                    console.error('Erro na requisição:', resposta);
                    Swal.fire('Erro!', 'Erro ao comunicar com o servidor!', 'error');
                }
            });
        }
    });
}


//MODAIS------------------------------------------------------------------------------------------------------------------------------
function abrirModalEndereco( id = null){
    const btnCadastrar = document.getElementById('btnCadastrarEnderecoModal');
    const btnAtualizar = document.getElementById('btnAtualizarEnderecoModal');
    // Limpa os campos do modal para cadastro
    document.querySelector('#enderecoID').value = '';
    document.querySelector('#enderecoNome').value = '';
    document.querySelector('#enderecoTipo').value = ''; // Assumindo que você tem esse campo
    document.querySelector('#enderecoLogradouro').value = '';
    document.querySelector('#enderecoCidade').value = '';
    document.querySelector('#enderecoEstado').value = ''; // Assumindo que você tem esse campo
    document.querySelector('#enderecoCep').value = '';

    if (id) {
        btnCadastrar.disabled = true;
        btnAtualizar.disabled = false;
        $.ajax({
            url: '../../backend/listar_endereco_edicao.php',
            type: 'post',
            async: true,
            data: {
                id
            },
            success: (resultado) => {
                if (resultado) {
                    // Presumindo que a resposta já seja um JSON string
                    const endereco = typeof resultado === 'string' ? JSON.parse(resultado) : resultado;

                    // Preenchendo os campos do modal diretamente
                    if (endereco && typeof endereco === 'object') {
                        document.querySelector('#enderecoID').value = endereco.id;
                        document.querySelector('#enderecoNome').value = endereco.nome;
                        document.querySelector('#enderecoTipo').value = endereco.tipo; // Assumindo que você tem esse campo
                        document.querySelector('#enderecoLogradouro').value = endereco.logradouro;
                        document.querySelector('#enderecoCidade').value = endereco.cidade;
                        document.querySelector('#enderecoEstado').value = endereco.estado; // Assumindo que você tem esse campo
                        document.querySelector('#enderecoCep').value = endereco.cep;
                        //document.querySelector('#idusuario').value = endereco.usuario_id; // Corrigido para 'usuario_id'
                    }
                } else {
                    Swal.fire('Erro', 'Endereço não encontrado!', 'error');
                }
            },
            error: (resultado) => {
                console.log(resultado);
            }
        });
    } else{
        btnCadastrar.disabled = false;
        btnAtualizar.disabled = true;
    }
    $('#modal_endereco').modal('show');
}
function abrirModalPiscina(id = null) {
    const btnCadastrar = document.getElementById('btnCadastrarPiscinaModal');
    const btnAtualizar = document.getElementById('btnAtualizarPiscinaModal');
    // Limpa os campos do modal para cadastro
    document.querySelector('#piscinaID').value = '';
    document.querySelector('#piscinaLocalID').value = '';
    document.querySelector('#piscinaNome').value = '';
    document.querySelector('#piscinaVolume').value = '';
    document.querySelector('#piscinaControleCloro').value = 'Manual';
    document.querySelector('#piscinaControlePh').value = 'Manual';

    // Função para carregar os locais e, se for edição, pré-selecionar o local
    function carregarLocais(selectedLocalID = null) {
        fetch('../../backend/listar_locais.php', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(locais => {
            const piscinaLocalSelect = document.querySelector('#piscinaLocal');
            piscinaLocalSelect.innerHTML = '<option value="">Selecione um local</option>';

            locais.forEach(local => {
                const option = document.createElement('option');
                option.value = local.id; // Valor é o ID do local
                option.textContent = local.nome;

                if (selectedLocalID && selectedLocalID == local.id) {
                    option.selected = true;
                }

                piscinaLocalSelect.appendChild(option);
            });

            // Adiciona o evento 'change' para preencher o campo piscinaLocalID
            piscinaLocalSelect.addEventListener('change', function() {
                const selectedLocalID = this.value;
                document.querySelector('#piscinaLocalID').value = selectedLocalID; // Preenche o campo piscinaLocalID
            });
        })
        .catch(error => {
            console.error('Erro ao carregar os locais:', error);
        });
    }

    if (id) {
        // Edição: busca os dados da piscina
        btnCadastrar.disabled = true;
        btnAtualizar.disabled = false;

        $.ajax({
            url: '../../backend/listar_piscina_edicao.php',
            type: 'post',
            async: true,
            data: { id },
            success: (resultado) => {
                if (resultado) {
                    const piscina = typeof resultado === 'string' ? JSON.parse(resultado) : resultado;

                    if (piscina && typeof piscina === 'object') {
                        // Preenche os campos da piscina
                        document.querySelector('#piscinaLocalID').value = piscina.local_id;
                        document.querySelector('#piscinaID').value = piscina.id;
                        document.querySelector('#piscinaNome').value = piscina.nome;
                        document.querySelector('#piscinaVolume').value = piscina.volume;
                        document.querySelector('#piscinaControleCloro').value = piscina.controle_cloro;
                        document.querySelector('#piscinaControlePh').value = piscina.controle_ph;

                        // Carrega os locais e pré-seleciona o local da piscina
                        carregarLocais(piscina.local_id);
                    }
                } else {
                    Swal.fire('Erro', 'Piscina não encontrada!', 'error');
                }
            },
            error: (resultado) => {
                console.log(resultado);
            }
        });
    } else {
        // Cadastro: apenas carrega os locais
        btnCadastrar.disabled = false;
        btnAtualizar.disabled = true;
        carregarLocais();
    }

    // Exibe o modal
    $('#modal_piscina').modal('show');
}
<<<<<<< codex/add-analog-input-configuration-to-index.php
function abrirModalDispositivo(id = null) {
    const btnCadastrar = document.getElementById('btnCadastrarDispositivoModal');
    const btnAtualizar = document.getElementById('btnAtualizarDispositivoModal');

    const analogFieldset = document.getElementById('analogInputsFieldset');
    const tipoInput = document.getElementById('dispositivoTipo');
    const toggleAnalog = () => {
        if (!analogFieldset) return;
        analogFieldset.style.display = tipoInput.value === 'Central de monitoramento' ? 'block' : 'none';
    };
    if (tipoInput) tipoInput.addEventListener('input', toggleAnalog);

    // Limpa os campos do modal principal
    document.querySelector('#dispositivoID').value = '';
=======

function abrirModalDispositivo(id = null) {

    const btnCadastrar = document.getElementById('btnCadastrarDispositivoModal');
    const btnAtualizar = document.getElementById('btnAtualizarDispositivoModal');
    
    // Limpa os campos do modal principal
    document.querySelector('#dispositivoID').value = '';
>>>>>>> main
    document.querySelector('#dispositivoPiscinaID').value = '';
    document.querySelector('#dispositivoTipo').value = '';
    document.querySelector('#dispositivoModelo').value = '';
    document.querySelector('#dispositivoMac1').value = '';
<<<<<<< codex/remove-mac-2-input-and-references
=======
const btnCadastrar = document.getElementById('btnCadastrarDispositivoModal');
const btnAtualizar = document.getElementById('btnAtualizarDispositivoModal');

// Limpa os campos do modal principal
document.querySelector('#dispositivoID').value = '';
document.querySelector('#dispositivoPiscinaID').value = '';
document.querySelector('#dispositivoNome').value = '';
document.querySelector('#dispositivoTipo').value = '';
document.querySelector('#dispositivoModelo').innerHTML = '<option value="">Selecione o modelo</option>';
document.querySelector('#dispositivoMac1').value = '';
document.querySelector('#dispositivoMac2').value = '';

// Atualiza os modelos disponíveis conforme tipo
const modelosPorTipo = {
    'Central de monitoramento': ['A4', 'A8', 'A16'],
    'Gerador de cloro - Passagem': ['5L', '7L', '10L', '14L', '28L'],
    'Gerador de cloro - Usina': ['3 kg/dia', '5 kg/dia', '12 kg/dia']
};
const tipoSelect = document.querySelector('#dispositivoTipo');
const modeloSelect = document.querySelector('#dispositivoModelo');

function atualizarModelos(tipo, selecionado = null) {
    modeloSelect.innerHTML = '<option value="">Selecione o modelo</option>';
    if (modelosPorTipo[tipo]) {
        modelosPorTipo[tipo].forEach(modelo => {
            const opt = document.createElement('option');
            opt.value = modelo;
            opt.textContent = modelo;
            if (selecionado && selecionado === modelo) {
                opt.selected = true;
            }
            modeloSelect.appendChild(opt);
        });
    }
}

tipoSelect.onchange = () => atualizarModelos(tipoSelect.value);
atualizarModelos(tipoSelect.value);

// Atualiza visibilidade dos fieldsets por tipo
if (typeof atualizarFieldsetsPorTipo === 'function') {
    atualizarFieldsetsPorTipo();
}

>>>>>>> main
    
    // Limpa os campos das entradas digitais (di01 até di08)
    for (let i = 1; i <= 8; i++) {
        let index = i < 10 ? '0' + i : i;
        document.querySelector('#di' + index + '_nome').value = '';
        document.querySelector('#di' + index + '_tipo').value = '0'; // valor padrão (NA)
    }

    // Limpa entradas analógicas (ai01 a ai04)
    for (let i = 1; i <= 4; i++) {
        let index = i < 10 ? '0' + i : i;
        const elem = document.querySelector('#ai' + index + '_funcao');
        if (elem) elem.value = '';
    }

    toggleAnalog();
    
    // Função para carregar as piscinas no dropdown
    function carregarPiscinas(selectedPiscinaID = null) {
        fetch('../../backend/listar_piscinas_dispositivos.php', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        })
        .then(response => response.json())
        .then(piscinas => {
            const dispositivoPiscinaSelect = document.querySelector('#dispositivoPiscina');
            dispositivoPiscinaSelect.innerHTML = '<option value="">Selecione uma piscina</option>';
    
            piscinas.forEach(piscina => {
                const option = document.createElement('option');
                option.value = piscina.id;
                option.textContent = piscina.nome;
    
                // Pré-seleciona a piscina se estiver no modo edição
                if (selectedPiscinaID && selectedPiscinaID == piscina.id) {
                    option.selected = true;
                }
    
                dispositivoPiscinaSelect.appendChild(option);
            });
    
            // Atualiza o campo oculto com o ID da piscina selecionada
            dispositivoPiscinaSelect.addEventListener('change', function() {
                document.querySelector('#dispositivoPiscinaID').value = this.value;
            });
        })
        .catch(error => {
            console.error('Erro ao carregar as piscinas:', error);
        });
    }
    
    if (id) {
        // Modo edição
        btnCadastrar.disabled = true;
        btnAtualizar.disabled = false;
    
        $.ajax({
            url: '../../backend/listar_dispositivo_edicao.php',
            type: 'POST',
            data: { id },
            success: (resultado) => {
                if (resultado) {
                    const dispositivo = typeof resultado === 'string' ? JSON.parse(resultado) : resultado;
    
                    if (dispositivo && typeof dispositivo === 'object') {
                        // Preenche os campos principais do dispositivo
                        document.querySelector('#dispositivoID').value = dispositivo.id;
                        document.querySelector('#dispositivoPiscinaID').value = dispositivo.piscina_id;
                        document.querySelector('#dispositivoTipo').value = dispositivo.tipo;
                        atualizarModelos(dispositivo.tipo, dispositivo.modelo);
                        document.querySelector('#dispositivoMac1').value = dispositivo.mac1;
                        // Preenche o campo do sensor de temperatura
                        document.querySelector('#dispositivoTempHabilitada').checked = !!parseInt(dispositivo.temp_habilitada);

    
<<<<<<< codex/add-analog-input-configuration-to-index.php
                        // Preenche os campos das entradas digitais
                        for (let i = 1; i <= 8; i++) {
                            let index = i < 10 ? '0' + i : i;
                            document.querySelector('#di' + index + '_nome').value = dispositivo['di' + index + '_nome'] || '';
                            document.querySelector('#di' + index + '_tipo').value = dispositivo['di' + index + '_tipo'] || '0';
                        }

                        // Preenche os campos das entradas analógicas
                        for (let i = 1; i <= 4; i++) {
                            let index = i < 10 ? '0' + i : i;
                            const elem = document.querySelector('#ai' + index + '_funcao');
                            if (elem) elem.value = dispositivo['ai' + index + '_funcao'] || '';
                        }

                        toggleAnalog();

                        carregarPiscinas(dispositivo.piscina_id);
=======
                        // Preenche os campos das entradas digitais
                        for (let i = 1; i <= 8; i++) {
                            let index = i < 10 ? '0' + i : i;
                            document.querySelector('#di' + index + '_nome').value = dispositivo['di' + index + '_nome'] || '';
                            document.querySelector('#di' + index + '_tipo').value = dispositivo['di' + index + '_tipo'] || '0';
                        }
    

                        carregarPiscinas(dispositivo.piscina_id);
                        atualizarFieldsetsPorTipo();

>>>>>>> main
                    }
                } else {
                    Swal.fire('Erro', 'Dispositivo não encontrado!', 'error');
                }
            },
            error: (resultado) => {
                console.error('Erro ao buscar dados do dispositivo:', resultado);
            }
        });
    } else {
    // Modo cadastro
    btnCadastrar.disabled = false;
    btnAtualizar.disabled = true;
    carregarPiscinas();

    // Atualiza modelos e fieldsets por tipo (deixe ambos)
    atualizarModelos(tipoSelect.value);
    atualizarFieldsetsPorTipo();

    // Exibe o modal
    $('#modal_dispositivo').modal('show');
}


function abrirModalLeituraManual(piscinaId = null, leituraId = null) {
    // Botões
    const btnCadastrar = document.getElementById('btnCadastrarLeituraModal');
    const btnAtualizar = document.getElementById('btnAtualizarLeituraModal');

    // Limpa campos do modal
    document.getElementById('leituraID').value = '';
    document.getElementById('leituraPiscinaID').value = '';
    document.getElementById('alcalinidade').value = '';
    document.getElementById('ph').value = '';
    document.getElementById('cloroLivre').value = '';

    // Modo padrão: cadastro
    btnCadastrar.style.display = 'inline-block';
    btnAtualizar.style.display = 'none';

    // Função interna para carregar as piscinas no dropdown
    function carregarPiscinas(selectedPiscinaID = null) {
        fetch('../../backend/listar_piscinas_dispositivos.php', { method: 'GET' })
            .then(response => response.json())
            .then(piscinas => {
                const selectPiscina = document.getElementById('selectPiscinaLeitura');
                selectPiscina.innerHTML = '<option value="">Selecione a Piscina</option>';

                piscinas.forEach(piscina => {
                    const option = document.createElement('option');
                    option.value = piscina.id;
                    option.textContent = piscina.nome;

                    // Pré-seleciona a piscina se estiver no modo edição ou se piscinaId for fornecido
                    if (selectedPiscinaID && Number(selectedPiscinaID) === Number(piscina.id)) {
                        option.selected = true;
                        document.getElementById('leituraPiscinaID').value = piscina.id;
                    }

                    selectPiscina.appendChild(option);
                });

                // Atualiza o campo oculto quando o usuário selecionar uma piscina
                selectPiscina.removeEventListener('change', handlePiscinaChange); // Remove event listener anterior para evitar duplicação
                selectPiscina.addEventListener('change', handlePiscinaChange);
            })
            .catch(error => {
                console.error('Erro ao carregar as piscinas:', error);
                Swal.fire('Erro!', 'Erro ao carregar as piscinas do usuário.', 'error');
            });
    }

    // Função para atualizar o campo oculto quando a piscina for alterada
    function handlePiscinaChange() {
        document.getElementById('leituraPiscinaID').value = this.value;
    }

    // Verifica qual modo deve ser ativado
    if (leituraId) {
        // ------------------- Modo EDIÇÃO -------------------
        btnCadastrar.style.display = 'none';
        btnAtualizar.style.display = 'inline-block';

        // Faz uma requisição para obter dados dessa leitura
        $.ajax({
            url: '../../backend/listar_leitura_edicao.php', // Endpoint para buscar dados da leitura
            type: 'POST',
            data: { leitura_id: leituraId },
            dataType: 'json', // Especifica que espera JSON
            success: (resposta) => {
                if (resposta.success) {
                    const leitura = resposta.leitura;

                    // Preenche campos
                    document.getElementById('leituraID').value = leitura.id;
                    document.getElementById('alcalinidade').value = leitura.alcalinidade;
                    document.getElementById('ph').value = leitura.ph;
                    document.getElementById('cloroLivre').value = leitura.cloro_livre;

                    // Carrega piscinas e pré-seleciona a piscina correspondente
                    carregarPiscinas(leitura.piscina_id);
                } else {
                    Swal.fire('Erro!', resposta.message, 'error');
                }
            },
            error: (resposta) => {
                console.error('Erro ao buscar dados da leitura:', resposta);
                Swal.fire('Erro!', 'Erro ao buscar dados da leitura.', 'error');
            }
        });
    } else if (piscinaId) {
        // ------------------- Modo CADASTRO com Piscina Pré-selecionada -------------------
        carregarPiscinas(piscinaId);
    } else {
        // ------------------- Modo CADASTRO sem Piscina Pré-selecionada -------------------
        carregarPiscinas();
    }

    // Exibe o modal
    $('#modal_leitura').modal('show');
}
function abrirModalUsuario() {
    const btnSalvar = document.getElementById('btnSalvarAlteracoesModal');
    
    // Limpa os campos do modal
    document.querySelector('#usuarioNome').value = '';
    document.querySelector('#usuarioEmail').value = '';
    document.querySelector('#novaSenha').value = '';
    document.querySelector('#confirmarSenha').value = '';

    // Função para buscar os dados do usuário
    fetch('../../backend/buscar_dados_usuario.php', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(usuario => {
        if (usuario) {
            // Preenche os campos do modal com os dados do usuário
            document.querySelector('#usuarioNome').value = usuario.nome;
            document.querySelector('#usuarioEmail').value = usuario.email;
        } else {
            Swal.fire('Erro', 'Dados do usuário não encontrados!', 'error');
        }
    })
    .catch(error => {
        console.error('Erro ao buscar dados do usuário:', error);
    });

    // Exibe o modal
    $('#modal_usuario').modal('show');
}
function abrirModalCompartilhar(id) {
    $('#modal_compartilhar').modal('show');
    document.querySelector('#enderecoIDCompartilhado').value = id;
}
function abrirModalDigitalInputs(dispositivo) {
    // Armazena o HTML de cada entrada configurada
    let configuredCols = [];

    for (let i = 1; i <= 8; i++) {
        let index = i < 10 ? '0' + i : i;
        let nome = dispositivo[`di${index}_nome`] || 'Não configurada';

        // Se estiver "Não configurada", pulamos
        if (nome === 'Não configurada') continue;

        // Obtém status e tipo para determinar se está "Ligada" ou "Desligada"
        let status = dispositivo[`di${index}_status`];
        let tipo = dispositivo[`di${index}_tipo`];

        let statusText = '';
        if (tipo == 0 || tipo === '0') { // NA
            statusText = (status == 0 || status === '0') ? 'Desligada' : 'Ligada';
        } else if (tipo == 1 || tipo === '1') { // NF
            statusText = (status == 0 || status === '0') ? 'Ligada' : 'Desligada';
        } else {
            // Se não houver tipo definido, adota padrão
            statusText = (status == 1 || status === '1') ? 'Ligada' : 'Desligada';
        }

        // Define o ícone
        let icon = '';
        if (statusText === 'Ligada') {
            icon = '<i class="fas fa-toggle-on" style="color: green; font-size: 2em;"></i>';
        } else {
            icon = '<i class="fas fa-toggle-off" style="color: red; font-size: 2em;"></i>';
        }

        // Monta o HTML para uma coluna
        const colHtml = `
            <div class="col text-center mb-3">
                <strong>${nome}</strong><br>
                ${icon}<br>
                <small>${statusText}</small>
            </div>
        `;
        configuredCols.push(colHtml);
    }

    // Se não houver nenhuma entrada configurada, exibe mensagem
    if (configuredCols.length === 0) {
        document.getElementById('modalDigitalInputsBody').innerHTML = `
            <p class="text-center">Nenhuma entrada configurada.</p>
        `;
        $('#modalDigitalInputs').modal('show');
        return;
    }

    // Organiza as colunas em linhas de 4 colunas cada
    let rowsHtml = '';
    for (let i = 0; i < configuredCols.length; i += 4) {
        const rowItems = configuredCols.slice(i, i + 4).join('');
        rowsHtml += `<div class="row">${rowItems}</div>`;
    }

    // Combina tudo em um container
    let html = `<div class="container-fluid">${rowsHtml}</div>`;
    document.getElementById('modalDigitalInputsBody').innerHTML = html;
    $('#modalDigitalInputs').modal('show');
}

//MQTT-------------------------------------------------------------------------------------------------------------------------------
    /*async function atualizarStatusMQTT() {
    try {
      // Faz uma requisição GET à rota /statusMQTT
      const response = await fetch('https://q1amb4970.c44.integrator.host:59683/statusMQTT');
      if (!response.ok) {
        throw new Error('Erro de resposta do servidor');
      }
      const data = await response.json(); // Ex: { mqttStatus: 'connected' }
      const statusElement = document.getElementById('mqttStatus');
      if (!statusElement) {
        console.warn('Elemento mqttStatus não encontrado no DOM.');
        return;
      }
  
      if (data.mqttStatus === 'connected') {
        statusElement.textContent = 'Conectado';
        statusElement.classList.remove('disconnected');
        statusElement.classList.add('connected');
      } else {
        statusElement.textContent = 'Desconectado';
        statusElement.classList.remove('connected');
        statusElement.classList.add('disconnected');
      }
    } catch (err) {
      console.error('Falha ao obter status MQTT:', err);
      // Em caso de erro, exibimos como desconectado
      const statusElement = document.getElementById('mqttStatus');
      if (statusElement) {
        statusElement.textContent = 'Desconectado';
        statusElement.classList.remove('connected');
        statusElement.classList.add('disconnected');
      }
    }
  }
  
  // Chamar a cada X segundos para atualizar status
  setInterval(atualizarStatusMQTT, 300000);
    
  /**
   * Função para solicitar atualização de um dispositivo
   * Faz POST em /solicitarAtualizacao no servidor "Aplicação 2"
   */
  async function solicitarAtualizacao(mac) {
    try {
      const response = await fetch('https://q1amb4970.c44.integrator.host:59683/solicitarAtualizacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mac }),
      });
      if (!response.ok) {
        throw new Error('Falha ao solicitar atualização');
      }
      const data = await response.json();
      console.log(`Solicitação enviada: ${data.message || ''}`);
      alert(`Solicitação enviada para o dispositivo ${mac}`);
    } catch (err) {
      console.error('Erro:', err);
      alert('Não foi possível solicitar atualização.');
    }
}
  // Função para ocultar containers mutuamente
function ocultarContainerLeiturasAut(op) {
    document.getElementById('containerLeiturasAut').style.display = op ? 'block' : 'none';
}

function ocultarContainerLeituras(op) {
    const container = document.getElementById('containerLeituras');
    if (container) {
        container.style.display = op ? 'block' : 'none';
    }
}

function aplicarFiltro() {
    const filtroMesAno = document.getElementById('filtroMesAno').value;
    const filtroDia = document.getElementById('filtroDia').value;

    if (!filtroMesAno) {
        Swal.fire('Erro', 'Selecione um mês/ano válido.', 'warning');
        return;
    }

    const [ano, mes] = filtroMesAno.split('-');
    const dia = filtroDia ? parseInt(filtroDia) : null;

    const params = new URLSearchParams(window.location.search);
    const piscinaId = params.get('id');

    if (piscinaId) {
        listar_leituras_iot(piscinaId, mes, ano, dia);  // dia opcional
    } else {
        Swal.fire('Erro', 'Nenhuma piscina selecionada.', 'error');
    }
}

function toggleTabela() {
    const tabela = document.getElementById("tabelaAutLeituras");
    const botao = document.getElementById("btnToggleTabela");

    if (tabela.style.display === "none") {
        tabela.style.display = "table";
        botao.innerText = "Ocultar Tabela";
    } else {
        tabela.style.display = "none";
        botao.innerText = "Mostrar Tabela";
    }
}

function gerarTituloStyle(texto) {
    const isDark = document.body.classList.contains('dark-theme');
    return {
        display: true,
        text: texto,
        font: {
            size: 18,
            weight: 'bold'
        },
        color: isDark ? '#fff' : '#333',
        padding: {
            top: 10,
            bottom: 20
        }
    };
}

function exportarGraficos(formato = 'png', graficoId = null) {
    const charts = [
        { instance: graficoAutTemperaturaInstance, id: 'graficoAutTemperatura', titulo: 'Temperatura (°C)' },
        { instance: graficoAutPHInstance, id: 'graficoAutPH', titulo: 'pH' },
        { instance: graficoAutORPInstance, id: 'graficoAutORP', titulo: 'ORP (mV)' }
    ];

    const chartsFiltrados = graficoId
        ? charts.filter(chart => chart.id === graficoId)
        : charts;

    const headerText = document.getElementById('leituraHeader')?.innerText || '';
    let nomeUsuario = 'Usuário não identificado';

    try {
        nomeUsuario = window.usuarioNome || document.getElementById('usuarioNome')?.innerText || nomeUsuario;
    } catch (e) {
        console.warn("Erro ao obter nome do usuário:", e);
    }

    const dataAtual = new Date();
    const dataFormatada = dataAtual.toLocaleDateString('pt-BR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const horaFormatada = dataAtual.toLocaleTimeString('pt-BR', {
        hour: '2-digit', minute: '2-digit'
    });

    const rodape = `Relatório emitido por ${nomeUsuario} em ${dataFormatada}, às ${horaFormatada}.`;

    chartsFiltrados.forEach(chart => {
        const originalCanvas = document.getElementById(chart.id);
        const originalChart = chart.instance;

        const canvas = document.createElement('canvas');
        canvas.width = originalCanvas.width;
        canvas.height = originalCanvas.height;
        const ctx = canvas.getContext('2d');

        // Clona o gráfico (sem título interno)
        const configExport = {
            type: 'line',
            data: {
                labels: originalChart.data.labels,
                datasets: originalChart.data.datasets
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: false },
                    legend: { display: false }
                },
                scales: originalChart.options.scales
            }
        };

        const tempChart = new Chart(ctx, configExport);

        setTimeout(() => {
            const paddingTop = formato === 'png' ? 100 : 0;
            const paddingBottom = formato === 'png' ? 40 : 0;

            const exportCanvas = document.createElement('canvas');
            exportCanvas.width = canvas.width;
            exportCanvas.height = canvas.height + paddingTop + paddingBottom;

            const exportCtx = exportCanvas.getContext('2d');

            // Fundo branco
            exportCtx.fillStyle = '#ffffff';
            exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

            // Cabeçalho e título (somente PNG)
            if (formato === 'png') {
                exportCtx.fillStyle = '#000';
                exportCtx.font = 'bold 18px Arial';
                exportCtx.fillText('Relatório de Leituras Automáticas', 20, 30);

                if (headerText) {
                    exportCtx.font = '14px Arial';
                    exportCtx.fillStyle = '#444';
                    exportCtx.fillText(headerText, 20, 55);
                }

                exportCtx.font = '14px Arial';
                exportCtx.fillStyle = '#444';
                exportCtx.fillText(chart.titulo, 20, 80);
            }

            // Gráfico
            exportCtx.drawImage(canvas, 0, paddingTop);

            // Rodapé (somente PNG)
            if (formato === 'png') {
                exportCtx.font = '10px Arial';
                exportCtx.fillStyle = '#444';
                exportCtx.fillText(rodape, 20, exportCanvas.height - 10);

                const link = document.createElement('a');
                link.href = exportCanvas.toDataURL('image/png');
                link.download = `${chart.titulo}.png`;
                link.click();
            }

            // PDF: usa apenas a imagem do gráfico puro com cabeçalho e rodapé como texto
            else if (formato === 'pdf') {
                const imgData = canvas.toDataURL('image/png');
                const doc = new jspdf.jsPDF('landscape');

                // Cabeçalho
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(0);
                doc.text("Relatório de Leituras Automáticas", 14, 15);

                if (headerText) {
                    doc.setFontSize(11);
                    doc.setTextColor(100);
                    doc.text(headerText, 14, 22);
                }

                doc.setFontSize(11);
                doc.setTextColor(50);
                doc.text(chart.titulo, 14, 29);

                // Imagem do gráfico puro (sem cabeçalho nem rodapé embutido)
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                const marginX = 10;
                const marginY = 35;
                const availableWidth = pageWidth - marginX * 2;
                const aspectRatio = canvas.height / canvas.width;

                let imgWidth = availableWidth;
                let imgHeight = imgWidth * aspectRatio;

                if (imgHeight > pageHeight - 60) {
                    imgHeight = pageHeight - 60;
                    imgWidth = imgHeight / aspectRatio;
                }

                doc.addImage(imgData, 'PNG', marginX, marginY, imgWidth, imgHeight);

                // Rodapé
                doc.setFontSize(10);
                doc.setTextColor(100);
                doc.text(rodape, 14, doc.internal.pageSize.getHeight() - 10);

                doc.save(`${chart.titulo}.pdf`);
            }

            tempChart.destroy();
        }, 300);
    });
}

















