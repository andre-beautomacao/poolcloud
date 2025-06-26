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

