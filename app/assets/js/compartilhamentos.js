$(document).ready(function(){
    carregarRecursos();
    listarCompartilhadosComigo();

    $('#btnNovo').on('click', function(){
        const val = $('#selectRecurso').val();
        if(!val) return;
        const [tipo,id] = val.split(':');
        $('#modalIdItem').val(id);
        $('#modalTipoItem').val(tipo);
        $('#destinoEmail').val('');
        $('#destinoPermissao').val('visualizar');
        $('#modalCompartilhar').modal('show');
    });

    $('#btnSalvarCompart').on('click', salvarCompartilhamento);
    $('#selectRecurso').on('change', function(){
        const v = this.value;
        if(!v){ $('#tabelaCompartilhamentos tbody').empty(); return; }
        const [tipo,id] = v.split(':');
        carregarCompartilhamentos(tipo,id);
    });
});

function carregarRecursos(){
    $('#selectRecurso').empty().append('<option value="">Selecione...</option>');
    Promise.all([
        fetch('../../backend/listar_enderecos.php').then(r=>r.json()),
        fetch('../../backend/listar_piscinas.php').then(r=>r.json()),
        fetch('../../backend/listar_dispositivos.php').then(r=>r.json())
    ]).then(([end, pisc, disp])=>{
        end.forEach(e=>$('#selectRecurso').append(`<option value="endereco:${e.id}">Endereço - ${e.nome}</option>`));
        pisc.forEach(p=>$('#selectRecurso').append(`<option value="piscina:${p.piscina_id}">Piscina - ${p.piscina_nome}</option>`));
        (disp.dispositivos||disp).forEach(d=>$('#selectRecurso').append(`<option value="dispositivo:${d.dispositivo_id}">Dispositivo - ${d.dispositivo_nome||d.nome}</option>`));
    });
}

function carregarCompartilhamentos(tipo,id){
    fetch(`../../backend/compartilhamentos.php?action=listar&tipo_item=${tipo}&id_item=${id}`)
        .then(r=>r.json())
        .then(lista=>{
            const tbody = $('#tabelaCompartilhamentos tbody');
            tbody.empty();
            lista.forEach(item=>{
                tbody.append(`<tr><td>${item.nome} (${item.email})</td><td>${item.permissao}</td><td><button class='btn btn-sm btn-danger' onclick='removerCompart(${item.id})'>Remover</button></td></tr>`);
            });
        });
}

function salvarCompartilhamento(){
    const id_item = $('#modalIdItem').val();
    const tipo_item = $('#modalTipoItem').val();
    const email = $('#destinoEmail').val();
    const permissao = $('#destinoPermissao').val();
    if(!email){return;}
    // buscar usuário por email
    fetch('../../backend/verificar_usuario.php',{method:'POST',body:new URLSearchParams({email})})
    .then(r=>r.text()).then(t=>{
        if(t==0){alert('Usuário não encontrado');return;}
        const id_destino = t;
        return fetch('../../backend/compartilhamentos.php',{
            method:'POST',
            headers:{'Content-Type':'application/x-www-form-urlencoded'},
            body:new URLSearchParams({action:'adicionar',id_item,tipo_item,id_destino,permissao})
        });
    }).then(r=>r? r.json():null).then(res=>{
        if(res&&res.success){
            $('#modalCompartilhar').modal('hide');
            carregarCompartilhamentos(tipo_item,id_item);
        }
    });
}

function removerCompart(id){
    fetch('../../backend/compartilhamentos.php',{
        method:'POST',
        headers:{'Content-Type':'application/x-www-form-urlencoded'},
        body:new URLSearchParams({action:'remover',id})
    }).then(r=>r.json()).then(()=>{
        $('#selectRecurso').change();
    });
}

function listarCompartilhadosComigo(){
    fetch('../../backend/compartilhamentos.php?action=meus')
        .then(r=>r.json()).then(d=>{
            const ul = $('#listaComigo');
            ul.empty();
            d.forEach(c=>{
                ul.append(`<li>${c.tipo_item} #${c.id_item} - ${c.permissao}</li>`);
            });
        });
}
