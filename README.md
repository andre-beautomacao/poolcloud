# 📝 CHANGELOG – PoolCloud
## 📅 [2025-07-04] – Correção na listagem de dispositivos
- Ajustado fechamento de bloco em `listar_dispositivos.php` para evitar erro 500.
- Corrigida montagem da consulta em `listar_dispositivos.php` quando não há `piscina_id`.


Histórico de mudanças e atualizações no sistema PoolCloud.
## 📅 [2025-07-01] – Ajuste de margens nos cards de piscinas e dispositivos
- Corrigido excesso de espaço à esquerda e estouro à direita dos quadradinhos internos.

## 📅 [2025-06-30] – Configuração do github no VSCode (local).

## 📅 [2025-06-27 11:15] – Listagem dinâmica de dispositivos
- Inclusão dos campos analógicos **AI01–AI04** em cadastros e listagens.
- Exibição de inputs condicionais conforme o tipo de dispositivo.
- Remoção das colunas `aixx_nome` e `aixx_tipo` das tabelas.
- Ajustes visuais nos cards para destacar informações principais.

## 📅 [2025-06-27] – Hash seguro de senhas
- Sistema atualizado para utilizar `password_hash()` e `password_verify()`.
- Adicionado script de migração `migrations/001_update_password_column.sql`.

## [2025-06-26] 🔑 Variáveis de Ambiente
O arquivo `backend/db_connect.php` lê os parâmetros de conexão do banco de dados das seguintes variáveis:

- `DB_HOST` – endereço do servidor MySQL
- `DB_NAME` – nome do banco de dados
- `DB_USER` – usuário do banco de dados
- `DB_PASS` – senha do usuário
Caso não estejam definidas, serão utilizados os valores presentes no código como padrão.

---
## 📅 [2025-06-26] – Publicação inicial no GitHub
- Inclusão de todo o código PHP, JavaScript e assets do sistema.
- Telas de login/cadastro com validações e recuperação de senha.
- Integração da biblioteca PHPMailer para envio de e-mails.

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
- Modularizar requisições em um serviço JS reutilizável.

---

> Este changelog é atualizado manualmente. Para histórico detalhado de commits, use Git ou outra ferramenta de controle de versão.
# poolcloud
