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
    const dispositivoNome = document.getElementById('dispositivoNome').value;
    const dispositivoTipo = document.getElementById('dispositivoTipo').value;
    const dispositivoModelo = document.getElementById('dispositivoModelo').value;
    const mac1 = document.getElementById('dispositivoMac1').value;
    const mac2 = document.getElementById('dispositivoMac2').value;
    const piscinaID = document.getElementById('dispositivoPiscinaID').value;
    const tempHabilitada = document.querySelector('#dispositivoTempHabilitada').checked ? 1 : 0;

    // Validação dos campos principais
    if (!dispositivoNome || !dispositivoTipo || !dispositivoModelo || !mac1 || !mac2 || !piscinaID) {
        Swal.fire('Erro!', 'Preencha todos os campos!', 'error');
        return;
    }

    // Validação dos endereços MAC (somente alfanuméricos com 12 caracteres)
    const macRegex = /^[0-9A-Fa-f]{12}$/;
    if (!macRegex.test(mac1) || !macRegex.test(mac2)) {
        Swal.fire('Erro!', 'Os endereços MAC devem conter apenas 12 caracteres alfanuméricos (sem separadores)!', 'error');
        return;
    }

    // Cria o FormData e adiciona os campos principais
    const formData = new FormData();
    formData.append('nome', dispositivoNome);
    formData.append('tipo', dispositivoTipo);
    formData.append('modelo', dispositivoModelo);
    formData.append('mac1', mac1);
    formData.append('mac2', mac2);
    formData.append('piscina_id', piscinaID);
    formData.append('temp_habilitada', tempHabilitada); // ✅ Agora está no lugar certo

    // Adiciona apenas os campos das entradas digitais visíveis
    for (let i = 1; i <= 16; i++) {
        const index = i < 10 ? '0' + i : i;
        const nomeEl = document.getElementById('di' + index + '_nome');
        const tipoEl = document.getElementById('di' + index + '_tipo');
        if (!nomeEl || !tipoEl) continue;
        const row = nomeEl.closest('.form-row');
        if (row && row.style.display === 'none') continue;
        formData.append('di' + index + '_nome', nomeEl.value);
        formData.append('di' + index + '_tipo', tipoEl.value);
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
    document.querySelector('#dispositivoNome').value = '';
    document.querySelector('#dispositivoTipo').value = '';
    const modeloSelect = document.querySelector('#dispositivoModelo');
    if (modeloSelect) modeloSelect.innerHTML = '<option value="">Selecione o modelo</option>';
    document.querySelector('#dispositivoMac1').value = '';
    document.querySelector('#dispositivoMac2').value = '';
    document.querySelector('#dispositivoTempHabilitada').checked = false;

    // Limpa entradas digitais (di01 a di16 caso existam)
    for (let i = 1; i <= 16; i++) {
        const index = i < 10 ? '0' + i : i;
        const nomeEl = document.querySelector('#di' + index + '_nome');
        const tipoEl = document.querySelector('#di' + index + '_tipo');
        if (nomeEl) nomeEl.value = '';
        if (tipoEl) tipoEl.value = '0';
        const row = nomeEl ? nomeEl.closest('.form-row') : null;
        if (row) row.style.display = 'none';
    }

    // Também limpa o select de piscina
    const piscinaSelect = document.querySelector('#dispositivoPiscina');
    if (piscinaSelect) piscinaSelect.value = '';
}

