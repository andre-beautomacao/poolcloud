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
    let nome = document.querySelector('#dispositivoNome').value;
    let tipo = document.querySelector('#dispositivoTipo').value;
    let modelo = document.querySelector('#dispositivoModelo').value;
    let mac1 = document.querySelector('#dispositivoMac1').value;
    let mac2 = document.querySelector('#dispositivoMac2').value;
    let piscina_id = document.querySelector('#dispositivoPiscinaID').value;
    let temp_habilitada = document.querySelector('#dispositivoTempHabilitada').checked ? 1 : 0;

    // Verifica se os campos obrigatórios estão preenchidos
    if (!id || !nome || !tipo || !modelo || !mac1 || !mac2 || !piscina_id) {
        Swal.fire('Erro!', 'Preencha todos os campos obrigatórios!', 'error');
        return;
    }

    // Coleta apenas os dados das entradas digitais visíveis
    let digitalInputs = {};
    for (let i = 1; i <= 16; i++) {
        let index = i < 10 ? '0' + i : i;
        const nomeEl = document.querySelector('#di' + index + '_nome');
        const tipoEl = document.querySelector('#di' + index + '_tipo');
        if (!nomeEl || !tipoEl) continue;
        const row = nomeEl.closest('.form-row');
        if (row && row.style.display === 'none') continue;
        digitalInputs['di' + index + '_nome'] = nomeEl.value;
        digitalInputs['di' + index + '_tipo'] = tipoEl.value;
    }

    // Envia os dados para o backend via AJAX
    $.ajax({
        url: '../../backend/edicao_dispositivo.php',
        type: 'post',
        async: true,
        data: Object.assign({
            id: id,
            nome: nome,
            tipo: tipo,
            modelo: modelo,
            mac1: mac1,
            mac2: mac2,
            piscina_id: piscina_id,
            temp_habilitada: temp_habilitada
        }, digitalInputs),
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
