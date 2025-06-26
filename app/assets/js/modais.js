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
function abrirModalDispositivo(id = null) {
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

    const modelosPorTipo = {
        'Central de monitoramento': ['A4', 'A8', 'A16'],
        'Gerador de cloro - Passagem': ['5L', '7L', '10L', '14L', '28L'],
        'Gerador de cloro - Usina': ['3 kg/dia', '5 kg/dia', '12 kg/dia']
    };
    const entradasPorModelo = { A4: 4, A8: 8, A16: 16 };
    const tipoSelect = document.querySelector('#dispositivoTipo');
    const modeloSelect = document.querySelector('#dispositivoModelo');

    function atualizarCamposDigitais(modelo) {
        const total = entradasPorModelo[modelo] || 0;
        for (let i = 1; i <= 16; i++) {
            const index = i < 10 ? '0' + i : i;
            const nomeEl = document.getElementById('di' + index + '_nome');
            const tipoEl = document.getElementById('di' + index + '_tipo');
            if (!nomeEl || !tipoEl) continue;
            const row = nomeEl.closest('.form-row');
            if (i <= total) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
                nomeEl.value = '';
                tipoEl.value = '0';
            }
        }
    }

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
        atualizarCamposDigitais(selecionado || modeloSelect.value);
    }

    tipoSelect.onchange = () => {
        atualizarModelos(tipoSelect.value);
    };
    modeloSelect.onchange = () => atualizarCamposDigitais(modeloSelect.value);
    atualizarModelos(tipoSelect.value);
    
    // Limpa os campos das entradas digitais (di01 até di16 caso existam)
    for (let i = 1; i <= 16; i++) {
        let index = i < 10 ? '0' + i : i;
        const nomeEl = document.querySelector('#di' + index + '_nome');
        const tipoEl = document.querySelector('#di' + index + '_tipo');
        if (nomeEl) nomeEl.value = '';
        if (tipoEl) tipoEl.value = '0'; // valor padrão (NA)
    }
    atualizarCamposDigitais(modeloSelect.value);
    
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
                        document.querySelector('#dispositivoNome').value = dispositivo.nome;
                        document.querySelector('#dispositivoTipo').value = dispositivo.tipo;
                        atualizarModelos(dispositivo.tipo, dispositivo.modelo);
                        document.querySelector('#dispositivoMac1').value = dispositivo.mac1;
                        document.querySelector('#dispositivoMac2').value = dispositivo.mac2;
                        // Preenche o campo do sensor de temperatura
                        document.querySelector('#dispositivoTempHabilitada').checked = !!parseInt(dispositivo.temp_habilitada);

    
                        // Preenche os campos das entradas digitais
                        for (let i = 1; i <= 16; i++) {
                            let index = i < 10 ? '0' + i : i;
                            const nomeEl = document.querySelector('#di' + index + '_nome');
                            const tipoEl = document.querySelector('#di' + index + '_tipo');
                            if (nomeEl) nomeEl.value = dispositivo['di' + index + '_nome'] || '';
                            if (tipoEl) tipoEl.value = dispositivo['di' + index + '_tipo'] || '0';
                        }

                        atualizarCamposDigitais(dispositivo.modelo);

                        carregarPiscinas(dispositivo.piscina_id);
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
        atualizarModelos(tipoSelect.value);
    }
    
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

















