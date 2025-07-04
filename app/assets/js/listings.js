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
        for (const piscina of piscinas) {
            const { piscina_id, piscina_nome, endereco_nome } = piscina;

            let dispositivos = [];
            try {
                const resp = await fetch(`../../backend/listar_dispositivos.php?piscina_id=${piscina_id}`);
                const dadosDisp = await resp.json();
                dispositivos = dadosDisp.dispositivos || dadosDisp;
            } catch (e) {
                console.error('Erro ao buscar dispositivos da piscina', piscina_id, e);
            }

            let dispositivosHtml = '';
            dispositivos.forEach(d => {
                const {
                    dispositivo_id,
                    tipo,
                    ph,
                    orp,
                    temperatura,
                    setpoint,
                    digipot,
                    tensao,
                    corrente,
                    data_hora,
                    temp_habilitada
                } = d;

                const arredondar = (val, casas) => (typeof val === 'number' && !isNaN(val)) ? val.toFixed(casas) : '—';
                const tempHabilitada = parseInt(temp_habilitada) === 1;
                const temperaturaVal = tempHabilitada ? arredondar(temperatura, 1) + ' °C' : '—';
                const phRow = d.tipo && d.tipo.toLowerCase().includes('gerador de cloro') ? '' : `
                        <div class="col-6">
                            <div class="param-card">
                                <span class="param-label">pH</span>
                                <span class="param-value" style="color:#2276c3;">${arredondar(ph,1)}</span>
                            </div>
                        </div>`;

                const orpRow = d.tipo && d.tipo.toLowerCase().includes('gerador de cloro') ? '' : `
                        <div class="col-6">
                            <div class="param-card">
                                <span class="param-label">ORP</span>
                                <span class="param-value" style="color:#b58c0a;">${arredondar(orp,0)} mV</span>
                            </div>
                        </div>`;

                const isCentral = tipo === 'Central de monitoramento';

                const setpointRow = isCentral ? '' : `
                        <div class="col-6">
                            <div class="param-card">
                                <span class="param-label">Setpoint</span>
                                <span class="param-value">${arredondar(setpoint,0)}</span>
                            </div>
                        </div>`;

                const digipotRow = isCentral ? '' : `
                        <div class="col-6">
                            <div class="param-card">
                                <span class="param-label">Digipot</span>
                                <span class="param-value">${arredondar(digipot,0)}</span>
                            </div>
                        </div>`;

                const tensaoRow = isCentral ? '' : `
                        <div class="col-6">
                            <div class="param-card">
                                <span class="param-label">Tensão</span>
                                <span class="param-value">${arredondar(tensao,1)} V</span>
                            </div>
                        </div>`;

                const correnteRow = isCentral ? '' : `
                        <div class="col-6">
                            <div class="param-card">
                                <span class="param-label">Corrente</span>
                                <span class="param-value">${arredondar(corrente,2)} A</span>
                            </div>
                        </div>`;

                const digitalInputsHtml = tipo && tipo.toLowerCase().includes('gerador de cloro') ? '' : `
                    <div class="entradas-digitais-label fw-bold mb-1 text-center">Equipamentos:</div>
                    <div class="row parametros-row g-2">
                        ${[1,2,3,4,5,6,7,8].map(i => {
                            const nome = d[`di${String(i).padStart(2, '0')}_nome`];
                            const status = d[`di${String(i).padStart(2, '0')}_status`];
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
                    </div>`;

                const unique = `device-body-${piscina_id}-${dispositivo_id}`;
                const deviceBody = `
                    <div class="row parametros-row g-2 mb-3">
                        ${phRow}
                        ${orpRow}
                        <div class="col-6">
                            <div class="param-card">
                                <span class="param-label">Temperatura</span>
                                <span class="param-value" style="color:#1ca441;">${temperaturaVal}</span>
                            </div>
                        </div>
                        ${setpointRow}
                        ${digipotRow}
                        ${tensaoRow}
                        ${correnteRow}
                        <div class="col-6">
                            <div class="param-card">
                                <span class="param-label">Última Leitura</span>
                                <span class="param-value" style="font-size:0.96em;">${data_hora ? new Date(data_hora).toLocaleString() : '—'}</span>
                            </div>
                        </div>
                    </div>
                    ${digitalInputsHtml}`;

                dispositivosHtml += `
                    <div class="device-section">
                        <div class="device-section-header">
                            <span class="fw-bold">${tipo || 'Dispositivo'}</span>
                            <button class="btn btn-link p-0" data-toggle="collapse" data-target="#${unique}" aria-expanded="false"><i class="fas fa-chevron-down"></i></button>
                        </div>
                        <div id="${unique}" class="collapse device-section-body">
                            ${deviceBody}
                        </div>
                    </div>`;
            });

            if (!dispositivosHtml) {
                dispositivosHtml = '<p class="text-center mb-2">Nenhum dispositivo cadastrado.</p>';
            }

            const cardHtml = `
            <div class="pool-card position-relative">
                <div class="d-flex flex-column align-items-center text-center card-header-top">
                    <h5 class="mb-0">${piscina_nome || 'Piscina sem nome'}</h5>
                    <span class="small text-muted mb-2">${endereco_nome || 'Endereço não especificado'}</span>
                </div>
                <hr class="my-2">
                ${dispositivosHtml}
                <div class="d-flex justify-content-around align-items-center mt-3 gap-3">
                    <i class="fas fa-cogs text-success pointer" title="Editar" onclick="abrirModalPiscina(${piscina_id})"></i>
                    <i class="fas fa-chart-line text-primary pointer" title="Leituras automáticas" onclick="abrirLeiturasGuiaNova(${piscina_id})"></i>
                    <i class="fas fa-trash text-danger pointer" title="Excluir" onclick="deletar_piscina(${piscina_id})"></i>
                </div>
            </div>`;

            if (piscinasWrapper) {
                const slide = document.createElement('div');
                slide.className = 'swiper-slide';
                slide.innerHTML = cardHtml;
                piscinasWrapper.appendChild(slide);
            }
        }

        // Swiper destroy/recreate
        if (window.swiperPiscinas && typeof window.swiperPiscinas.destroy === "function") {
            window.swiperPiscinas.destroy(true, true);
        }

        window.swiperPiscinas = new Swiper('#swiperPiscinas', {
        slidesPerView: 'auto', // <- Mostra o máximo possível
        slidesPerGroup: 1,
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

        window.swiperPiscinas.on('slideChange', () => {
            atualizarBarraNomeSwiper(window.swiperPiscinas.realIndex, piscinas);
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
                mac1,
                ph,
                orp,
                temperatura,
                setpoint,
                digipot,
                tensao,
                corrente,
                data_hora,
                temp_habilitada,
                tipo,
                piscina_nome,
                endereco_nome
            } = dispositivo;

            const arredondar = (val, casas) => (typeof val === 'number' && !isNaN(val)) ? val.toFixed(casas) : '—';
            const phVal = arredondar(ph, 1);
            const orpVal = arredondar(orp, 0);
            const tempHabilitada = parseInt(temp_habilitada) === 1;
            const temperaturaVal = tempHabilitada ? arredondar(temperatura, 1) + ' °C' : '—';
            const setpointVal = arredondar(setpoint, 0);
            const digipotVal = arredondar(digipot, 0);
            const tensaoVal = arredondar(tensao, 1);
            const correnteVal = arredondar(corrente, 2);
            const ultimaLeitura = data_hora ? new Date(data_hora).toLocaleString() : '—';

            const isCentral = tipo === 'Central de monitoramento';
            const isGerador = tipo && tipo.toLowerCase().includes('gerador de cloro');

            const phRow = isGerador ? '' : `
                    <div class="col-6">
                        <div class="param-card">
                            <span class="param-label">pH</span>
                            <span class="param-value" style="color:#2276c3;">${phVal}</span>
                        </div>
                    </div>`;

            const orpRow = isGerador ? '' : `
                    <div class="col-6">
                        <div class="param-card">
                            <span class="param-label">ORP</span>
                            <span class="param-value" style="color:#b58c0a;">${orpVal} mV</span>
                        </div>
                    </div>`;

            const setpointRow = isCentral ? '' : `
                    <div class="col-6">
                        <div class="param-card">
                            <span class="param-label">Setpoint</span>
                            <span class="param-value">${setpointVal}</span>
                        </div>
                    </div>`;

            const digipotRow = isCentral ? '' : `
                    <div class="col-6">
                        <div class="param-card">
                            <span class="param-label">Digipot</span>
                            <span class="param-value">${digipotVal}</span>
                        </div>
                    </div>`;

            const tensaoRow = isCentral ? '' : `
                    <div class="col-6">
                        <div class="param-card">
                            <span class="param-label">Tensão</span>
                            <span class="param-value">${tensaoVal} V</span>
                        </div>
                    </div>`;

            const correnteRow = isCentral ? '' : `
                    <div class="col-6">
                        <div class="param-card">
                            <span class="param-label">Corrente</span>
                            <span class="param-value">${correnteVal} A</span>
                        </div>
                    </div>`;

            const digitalInputsHtml = isGerador ? '' : `
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
                </div>`;

            let cardHtml = `
            <div class="pool-card position-relative">
                <div class="d-flex flex-column align-items-center text-center card-header-top">
                    <h5 class="mb-0">${tipo || ''}</h5>
                    <span class="small fw-semibold">${piscina_nome || ''} - ${endereco_nome || ''}</span>
                    <span class="small text-muted mb-2">${mac1 || '—'}</span>
                </div>
                <hr class="my-2">
                <div class="row parametros-row g-2 mb-3">
                    ${phRow}
                    ${orpRow}
                    <div class="col-6">
                        <div class="param-card">
                            <span class="param-label">Temperatura</span>
                            <span class="param-value" style="color:#1ca441;">${temperaturaVal}</span>
                        </div>
                    </div>
                    ${setpointRow}
                    ${digipotRow}
                    ${tensaoRow}
                    ${correnteRow}
                    <div class="col-6">
                        <div class="param-card">
                            <span class="param-label">Última Leitura</span>
                            <span class="param-value" style="font-size:0.96em;">${ultimaLeitura}</span>
                        </div>
                    </div>
                </div>
                ${digitalInputsHtml}
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
