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


