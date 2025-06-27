async function listar_piscinas(enderecoID = null) {
    if (isLoadingPiscinas) return;
    isLoadingPiscinas = true;

    const tabelaPiscinas = document.getElementById('tabelaPiscinas');
    const listapiscinastab = document.getElementById('listapiscinastab');
    const listapiscinascard = document.getElementById('listapiscinascard');
    const containerPiscinasTitle = document.querySelector('#containerPiscinas h4');

    const thead = tabelaPiscinas.querySelector('thead');
    if (thead) {
        thead.innerHTML = `
            <tr>
                <th rowspan="2">Nome e Local</th>
                <th colspan="7">Leituras Automáticas</th>
                <th rowspan="2">Ações</th>
            </tr>
            <tr>
                <th>pH</th>
                <th>ORP (mV)</th>
                <th>Temperatura (°C)</th>
                <th>Setpoint (%)</th>
                <th>Tensão (V)</th>
                <th>Corrente (A)</th>
                <th>Data da Leitura</th>
            </tr>
        `;
    }
    listapiscinastab.innerHTML = '';
    listapiscinascard.innerHTML = '';

    try {
        const url = enderecoID
            ? `../../backend/listar_piscinas.php?endereco_id=${enderecoID}`
            : '../../backend/listar_piscinas.php';

        const resposta = await fetch(url);
        const textoResposta = await resposta.text();
        console.log('Dados retornados:', textoResposta);

        const piscinas = JSON.parse(textoResposta);

        if (enderecoID && piscinas.length > 0) {
            containerPiscinasTitle.textContent = `Piscinas - ${piscinas[0].endereco_nome}`;
        } else {
            containerPiscinasTitle.textContent = 'Piscinas';
        }

        if (piscinas.length === 0) {
            listapiscinastab.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align: center;">Nenhuma piscina encontrada.</td>
                </tr>
            `;
            listapiscinascard.innerHTML = '<p class="text-center">Nenhuma piscina encontrada.</p>';
            return;
        }

        for (const piscina of piscinas) {
            const {
                piscina_id,
                piscina_nome,
                endereco_nome,
                last_ph,
                last_cloro_livre,
                last_alcalinidade,
                data_hora,
                ph,
                orp,
                temperatura,
                setpoint,
                tensao,
                corrente,
                data_hora_automatic,
                temp_habilitada,

                // Entradas digitais
                di01_nome, di01_status,
                di02_nome, di02_status,
                di03_nome, di03_status,
                di04_nome, di04_status,
                di05_nome, di05_status,
                di06_nome, di06_status,
                di07_nome, di07_status,
                di08_nome, di08_status
            } = piscina;

            const exibirTemperatura = parseInt(temp_habilitada) === 1;

            const phAutomaticoArredondado = arredondar(ph, 1);
            const orpAutomaticoArredondado = arredondar(orp, 0);
            const temperaturaAutomaticoArredondada = arredondar(temperatura, 1);
            const setpointVal = arredondar(setpoint, 0);
            const tensaoVal = arredondar(tensao, 1);
            const correnteVal = arredondar(corrente, 2);

            const tempValorTabela = exibirTemperatura ? `${temperaturaAutomaticoArredondada} °C` : '<span style="color:#999">—</span>';

            const linhaTabela = `
                <tr>
                    <td>${piscina_nome || 'Piscina sem nome'} | ${endereco_nome || 'Endereço não especificado'}</td>
                    <td>${phAutomaticoArredondado}</td>
                    <td>${orpAutomaticoArredondado} mV</td>
                    <td>${tempValorTabela}</td>
                    <td>${setpointVal}</td>
                    <td>${tensaoVal} V</td>
                    <td>${correnteVal} A</td>
                    <td>${data_hora_automatic ? new Date(data_hora_automatic).toLocaleString() : '—'}</td>
                    <td>
                        <i class="fas fa-cogs text-success pointer" title="Editar" onclick="abrirModalPiscina(${piscina_id})"></i>
                        <i class="fas fa-chart-line text-success pointer" title="Leituras automáticas" onclick="abrirLeiturasGuiaNova(${piscina_id})"></i>
                        <i class="fas fa-trash text-danger pointer" title="Excluir" onclick="deletar_piscina(${piscina_id})"></i>
                    </td>
                </tr>`;

            listapiscinastab.insertAdjacentHTML('beforeend', linhaTabela);

            // Monta bloco de leituras automáticas
            let leituraCard = `
                <div class="last-reading mt-3 p-2">
                    <p class="card-text"><strong>pH:</strong> ${phAutomaticoArredondado}</p>
                    <p class="card-text"><strong>ORP:</strong> ${orpAutomaticoArredondado} mV</p>
            `;
            if (exibirTemperatura) {
                leituraCard += `<p class="card-text"><strong>Temperatura:</strong> ${temperaturaAutomaticoArredondada} °C</p>`;
            }
            leituraCard += `
                    <p class="card-text"><strong>Setpoint:</strong> ${setpointVal}</p>
                    <p class="card-text"><strong>Tensão:</strong> ${tensaoVal} V</p>
                    <p class="card-text"><strong>Corrente:</strong> ${correnteVal} A</p>
                </div>`;

            // Monta bloco das entradas digitais (exibir só se nome não vazio)
            let htmlDigitais = '';
            for (let i = 1; i <= 8; i++) {
                const nome = piscina[`di${String(i).padStart(2, '0')}_nome`];
                const status = piscina[`di${String(i).padStart(2, '0')}_status`];
                if (nome && nome.trim() !== '') {
                    htmlDigitais += `
                        <div class="entrada-digital d-flex justify-content-between align-items-center mb-1">
                            <span>
                                <i class="fas fa-circle" style="font-size: 0.6em; color: ${status == 1 ? '#28a745' : '#ccc'};"></i>
                                ${nome}
                            </span>
                            <span class="badge ${status == 1 ? 'bg-success' : 'bg-secondary'}">${status == 1 ? 'Ativo' : 'Inativo'}</span>
                        </div>
                    `;
                }
            }
            const blocoDigitais = htmlDigitais
                ? `<div class="mt-2"><strong>Entradas Digitais:</strong>${htmlDigitais}</div>`
                : '';

            // Monta card final
            const card = `
                <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title mb-0">${piscina_nome || 'Piscina sem nome'}</h5>
                            <p class="card-text"><small class="text-muted">${endereco_nome || 'Endereço não especificado'}</small></p>
                            ${leituraCard}
                            ${blocoDigitais}
                            <div class="d-flex justify-content-between mt-3">
                                <i class="fas fa-cogs text-success pointer " title="Editar" onclick="abrirModalPiscina(${piscina_id})"></i>
                                <i class="fas fa-chart-line text-success pointer " title="Leituras automáticas" onclick="abrirLeiturasGuiaNova(${piscina_id})"></i>
                                <i class="fas fa-trash text-danger pointer " title="Excluir" onclick="deletar_piscina(${piscina_id})"></i>
                            </div>
                        </div>
                    </div>
                </div>`;

            listapiscinascard.insertAdjacentHTML('beforeend', card);
        }

        if (modoDeVisualizacao === 'lista') {
            tabelaPiscinas.style.display = 'table';
            listapiscinascard.style.display = 'none';
        } else {
            tabelaPiscinas.style.display = 'none';
            listapiscinascard.style.display = 'flex';
        }

    } catch (error) {
        console.error('Erro ao listar piscinas:', error);
        listapiscinastab.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; color: red;">Erro ao carregar piscinas.</td>
            </tr>
        `;
        listapiscinascard.innerHTML = '<p class="text-center text-danger">Erro ao carregar piscinas.</p>';
    } finally {
        isLoadingPiscinas = false;
    }
}
