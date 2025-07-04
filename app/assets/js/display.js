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

    document.getElementById('btnCompartilhamentos')?.addEventListener('click', function () {
        atualizarNavbar('Compartilhamentos');
        atualizarURL('compartilhamentos', true);
        mostrarConteudo('containerCompartilhamentos');
    });
    
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
        case 'compartilhamentos':
            mostrarConteudo('containerCompartilhamentos');
            atualizarNavbar('Compartilhamentos');
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



