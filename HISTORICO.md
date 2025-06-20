# 📝 CHANGELOG – PoolCloud

Histórico de mudanças e atualizações no sistema PoolCloud.

---
## 📅 [2025-04-30] – Indentificado erro na renderização dos gráficos
- Os gráficos ignoravam os dias sem leituras, renderizando os dados de forma sequencial e sem escala linear.
    -- Não houve leituras registradas no dia 4. Do dia 3, pulava diretamente para o dia 5. 
- Tentativa de melhoria: criar um array com todas as datas do mês. 

## 📅 [2025-04-30] – Melhoria da página de leituras
- Criação do campo temp_habilitada na tabela dispositivos. 
- Modificação do modal e dos phps de cadastro, listagem e edição. 
- Modificação da função listar_leituras para verificar se o sensor de temperatura está habilitado.
- Caso não esteja, oculta totalmente as leituras de temperatura do gráfico e da tabela.
- 

~~## 📅 [2025-04-17] – Divisão do app.js
- Separado o arquivo `app.js` em múltiplos módulos.
- Criados arquivos: `app.core.js`, `app.usuarios.js`, `app.leituras.js`, etc.
- Removidos todos os `onclick` inline do HTML.
- Corrigido problema com `viewToggle` e renderização dos gráficos.~~

---

## 📅 [2025-04-15] – Recuperação de senha
- Implementado envio de e-mail com link de recuperação usando PHPMailer.
- Criado `recuperar.php` com formulário de nova senha.
- Adicionado contador regressivo com SweetAlert2 após reset bem-sucedido.

---

## 📅 [2025-04-09] – Aba de rede e configuração MQTT
- Unificação dos campos de configuração na interface.
- Leitura de SSID, senha e IP via `/statusRede`.
- Atualização de configurações via `/setConfig`.

---

## 📅 [2025-03-27] – Gráficos interativos e exportação
- Gráficos Chart.js integrados com botões de exportação.
- Exportação para PNG e PDF com título dinâmico e fundo adaptado ao tema.

---

## 🔧 Pendente/Futuro
- Refatorar banco de dados para aceitar múltiplos dispositivos por piscina.
- Converter sistema para `password_hash()` ao invés de `md5`.
- Modularizar requisições em um serviço JS reutilizável.

---

> Este changelog é atualizado manualmente. Para histórico detalhado de commits, use Git ou outra ferramenta de controle de versão.
