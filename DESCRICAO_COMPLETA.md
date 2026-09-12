# DESCRICAO COMPLETA DO SISTEMA — REDE AUTO RIBEIRAO

## 1. IDENTIDADE E STACK

### Nome do sistema
"Rede Auto Ribeirao" — Plataforma SaaS de gestao para lojas de veiculos seminovos.

### Stack tecnologico
- **Frontend**: Vite 8 + React 19 + TypeScript 6
- **Estilo**: Tailwind CSS v4 (configurado via CSS, sem tailwind.config.js), importado com `@import 'tailwindcss'` no `src/index.css`, plugin `@tailwindcss/vite`
- **Backend**: Supabase (Auth + Postgres + Storage + Edge Functions + Realtime)
- **Icones**: lucide-react
- **Rotas**: react-router-dom v7 (BrowserRouter)
- **Bibliotecas adicionais**: @supabase/supabase-js, @whiskeysockets/baileys (WhatsApp server), qrcode, qrcode-terminal, nodejs-insta-private-api, curve25519-js, tweetnacl

### Alias de importacao
`@/` mapeia para `src/` (ex: `@/components/Foo` = `src/components/Foo`). Configurado via `resolve.tsconfigPaths: true` no vite.config.ts e `paths` no tsconfig.app.json.

### Variaveis de ambiente
- `VITE_SUPABASE_URL` — URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY` — Chave anonima do Supabase

---

## 2. SISTEMA DE DESIGN (CSS)

### Paleta de cores (definida em `@theme` no index.css)
- **Navy (escuro principal)**: 950 (#050a16), 900 (#0a1224), 850 (#0c1730), 800 (#0f1d38), 700 (#16284a), 600 (#1e3a64), 500 (#2a4f80), 400 (#3b6aa8), 300 (#5a8fc8), 200 (#8fb5da), 100 (#c4dbf0), 50 (#e8f1fa)
- **Accent (azul brilhante)**: 600 (#1e7dd9), 500 (#2a93e8), 400 (#4aaef5), 300 (#7ac4f8), 200 (#a8d8fa)
- **Gold (dourado)**: 500 (#d4a843), 400 (#e6c25e), 300 (#f0d97a)
- **Success (verde)**: 500 (#16a34a), 600 (#15803d), 400 (#22c55e), 300 (#4ade80)
- **Warning (amarelo)**: 500 (#f59e0b), 600 (#d97706), 400 (#fbbf24), 300 (#fcd34d)
- **Error (vermelho)**: 500 (#dc2626), 600 (#b91c1c), 400 (#ef4444), 300 (#f87171)
- **Emerald**: 500 (#10b981), 400 (#34d399), 300 (#6ee7b7)

### Fonte
Inter (carregada via @font-face do Google Fonts), com fallback system-ui. Pesos: 100-900. Display e body usam a mesma fonte.

### Fundo do body
`background-color: var(--color-navy-950)` (#050a16), texto `#e2e8f0`.

### Classes utilitarias customizadas
- `.glass` — fundo rgba(15,29,56,0.45), backdrop-blur 16px, borda sutil
- `.glass-strong` — fundo rgba(12,23,48,0.7), backdrop-blur 20px
- `.glass-card` — gradiente diagonal com borda gradiente via mask-composite
- `.gradient-text` — gradiente azul clipado em texto
- `.gradient-text-gold` — gradiente dourado clipado em texto
- `.bg-mesh` — radial gradients sobrepostos
- `.bg-grid` — grid 40px com linhas sutis
- `.bg-grid-dense` — grid 20px
- `.aurora-bg` — pseudo-elementos com radial gradients animados
- `.hover-lift` — translateY(-6px) + box-shadow no hover
- `.hover-lift-sm` — translateY(-3px) + box-shadow no hover
- `.card-glow` / `.card-glow-strong` — glow azul no hover
- `.btn-shine` — efeito de brilho deslizando no hover
- `.btn-sheen` — efeito sheen no hover
- `.ripple-btn` — efeito ripple no click
- `.spotlight` — spotlight seguindo o mouse (via CSS vars --spotlight-x/y)
- `.shimmer-effect` — efeito shimmer
- `.skeleton` — loading skeleton com shimmer
- `.mesh-gradient` / `.mesh-gradient-warm` — gradientes radiais compostos
- `.animated-border` — borda gradiente animada
- `.conic-border` — borda conica giratoria
- `.underline-anim` — underline animado no hover
- `.input-anim` — input com borda animada no focus
- `.focus-ring` — ring de foco
- `.dot-pulse` — ponto pulsante
- `.tab-indicator` — indicador de tab com transicao
- `.progress-bar` — barra de progresso com shimmer
- `.img-zoom` — container com zoom de imagem no hover
- `.badge-glow` — badge com glow
- `.section-divider` — divisoria gradiente
- `.count-up` — animacao de contagem

### Animacoes (keyframes)
fadeIn, fadeInUp, fadeInDown, slideIn, scaleIn, shimmer, float, floatSlow, pulse, glow, glowPulse, spin, spinReverse, gradientShift, shimmerLine, ripple, slideUpFade, barGrow, bounceIn, countUp, borderTrace, auroraShift, wave, sheen, photoReveal, thumbSlideIn, progressFill, ticker, dropIn, fadeInScale, sweep, breathe, slideInRight, flipIn

Classes: `.animate-fade-in`, `.animate-fade-in-up`, `.animate-fade-in-down`, `.animate-slide-in`, `.animate-scale-in`, `.animate-float`, `.animate-float-slow`, `.animate-glow`, `.animate-glow-pulse`, `.animate-bounce-in`, `.animate-spin-reverse`, `.animate-wave`, `.animate-aurora`, `.animate-sheen`, `.animate-photo-reveal`, `.animate-thumb-in`, `.animate-drop-in`, `.animate-fade-in-scale`, `.animate-slide-in-right`, `.animate-flip-in`, `.animate-breathe`

### Stagger delays
`.stagger-1` (0.05s) ate `.stagger-8` (0.4s)

### Scrollbar
Thin, 6px, cor navy-600 no thumb, transparent no track.

---

## 3. ARQUITETURA DA APLICACAO

### Estrutura de arquivos
```
src/
  main.tsx          — entry point, renderiza App em StrictMode
  App.tsx           — rotas com BrowserRouter, AuthProvider
  index.css         — Tailwind + tema + animacoes + utilitarios
  context/
    AuthContext.tsx — provedor de autenticacao
  lib/
    supabase.ts     — cliente Supabase + TODOS os tipos TypeScript
    format.ts       — formatadores de moeda, data, numero, status
    crm.ts          — constantes e helpers do CRM (fontes, pipeline, scores)
    financing-engine.ts — motor de simulacao de financiamento
    proposal.ts     — gerador de proposta de financiamento (HTML/PDF)
    integrations.ts — integracoes com plataformas externas
    closure.ts      — encerramento mensal + relatorio PDF
  components/
    Logo.tsx                — logo da Rede Auto
    Layout.tsx              — sidebar + mobile nav + container principal
    LeadModal.tsx           — modal de criar/editar lead
    LeadDetail.tsx          — drawer lateral com detalhes do lead (tabs)
    ExpenseModal.tsx        — modal de criar/editar despesa
    IntegrationHelpChat.tsx — chat IA flutuante para ajuda com integracoes
  pages/
    LoginPage.tsx
    DashboardPage.tsx
    MyStockPage.tsx
    VehicleDetailPage.tsx
    VehicleFormPage.tsx
    NetworkSearchPage.tsx
    FinancePage.tsx
    SalesPage.tsx
    ClientsPage.tsx
    FinancingPage.tsx
    FinancingSimulationPage.tsx
    FinancingDetailPage.tsx
    DealerProfilePage.tsx
    ProfileEditPage.tsx
    AtendimentoPage.tsx
    CrmPage.tsx
    InboxPage.tsx
    IntegrationsPage.tsx
    IntegrationsCallbackPage.tsx
supabase/
  migrations/   — 25 arquivos SQL
  functions/    — 6 Edge Functions
server/
  connector-plugin.cjs    — plugin Vite conector
  connector-plugin.d.ts   — tipos do plugin
  whatsapp/index.cjs      — servidor WhatsApp (Baileys)
public/
  widget/chat.html — pagina do widget de chat
  widget/chat.js   — script do widget embarcavel
  images/          — imagem do logo
```

### Sistema de rotas (App.tsx)
- `/` — LoginPage (PublicRoute: redireciona para /dashboard se autenticado)
- `/dashboard` — DashboardPage (protegido)
- `/estoque` — MyStockPage
- `/veiculo/novo` — VehicleFormPage
- `/veiculo/:id` — VehicleDetailPage
- `/veiculo/:id/editar` — VehicleFormPage
- `/rede` — NetworkSearchPage
- `/financeiro` — FinancePage
- `/vendas` — SalesPage
- `/clientes` — ClientsPage
- `/atendimento` — AtendimentoPage
- `/integracoes` — IntegrationsPage
- `/integracoes/callback` — IntegrationsCallbackPage
- `/financiamento` — FinancingPage
- `/financiamento/novo` — FinancingSimulationPage
- `/financiamento/:id` — FinancingDetailPage
- `/lojista/:id` — DealerProfilePage
- `/perfil/editar` — ProfileEditPage
- `*` — redireciona para /

### Componentes de rota
- `ProtectedRoute` — mostra spinner se loading, redireciona para / se sem sessao, envolve children em `<Layout>`
- `PublicRoute` — mostra spinner se loading, redireciona para /dashboard se autenticado

---

## 4. AUTENTICACAO (AuthContext.tsx)

### Funcionalidades
- `signIn(email, password)` — login com Supabase Auth, mensagem generica de erro ("E-mail ou senha incorretos.")
- `signUp(email, password, name, phone)` — cadastro: cria user no Auth + registro na tabela `dealers` com user_id, name, phone, email. Mensagem generica de erro.
- `signOut()` — desloga e limpa dealer
- `refreshDealer()` — recarrega dados do dealer
- `loadDealer(userId)` — busca em `dealers` onde `user_id = userId`. Se nao encontrar, faz signOut (sessao obsoleta)

### Estados
- `session: Session | null`
- `dealer: Dealer | null`
- `loading: boolean`

### onAuthStateChange
Ignora evento `INITIAL_SESSION` (ja tratado por `getSession`). Atualiza session e carrega dealer quando ha nova sessao.

---

## 5. LAYOUT (Layout.tsx)

### Sidebar desktop (escondida em mobile, w-72 fixa)
- Logo no topo com link para /dashboard
- 3 secoes de navegacao:
  1. **Gestao**: Painel (/dashboard), Meu Estoque (/estoque), Vendas (/vendas), Financeiro (/financeiro), Financiamento (/financiamento), Clientes (/clientes), Atendimento (/atendimento)
  2. **Sistema**: Integracoes (/integracoes)
  3. **Rede**: Buscar na Rede (/rede), Meu Perfil (/perfil/editar)
- Item ativo: gradiente da esquerda + barra vertical accent-4px + glow-pulse
- Item inativo: hover com fundo navy-700/30 + icone escala 110% + drop-shadow
- Animacao slideIn escalonada por indice (i * 50ms)

### Perfil do usuario (footer da sidebar)
- Avatar circular com logo_url ou inicial do nome
- Ponto verde pulsante (status online)
- Link para /lojista/:id (perfil publico)
- Botao Sair com icone LogOut

### Header mobile
- Glass-strong, topo fixo
- Logo tamanho sm
- Botao hamburger/fechar

### Menu mobile
- Overlay fullscreen bg-navy-950/95 backdrop-blur
- Mesmas secoes da sidebar
- Animacao slideIn escalonada

### Conteudo principal
- `md:ml-72` (margem da sidebar)
- `pt-16 md:pt-0` (espaco do header mobile)
- Container com `p-4 md:p-8` e animacao `animate-fade-in-up` (re-executa por mudanca de pathname via key)

### Fundo decorativo
- `bg-navy-950 bg-mesh`
- Overlay `bg-grid` opacity 40% fixo
- Orbes ambientais: accent-500/5 blur 120px animate-float (top-left), navy-500/8 blur 100px animate-float-slow (bottom-right)

---

## 6. PAGINA DE LOGIN (LoginPage.tsx)

### Layout
Dois paineis lado a lado (lg:grid-cols-2):
- **Painel esquerdo**: showcase com logo, titulo, features (gestao de estoque, simulador de financiamento, rede de lojistas, CRM multi-canal)
- **Painel direito**: formulario de login/cadastro

### Funcionalidades
- Toggle entre "Entrar" e "Cadastrar"
- Login: email + senha (com toggle de mostrar/ocultar senha)
- Cadastro: nome (min 2 chars) + telefone + email + senha
- Em caso de sucesso, navega para /dashboard
- Valores iniciais: email="demo@redeauto.com", password="demo123" (preenchidos automaticamente)

### Estilo
- Glassmorphism, orbes flutuantes, gradient text
- Animacoes de entrada escalonadas
- FormField component reutilizavel (label + input com icone)

---

## 7. DASHBOARD (DashboardPage.tsx)

### Dados carregados (Promise.all)
- Veiculos do dealer (ordenados por created_at desc)
- Vendas do dealer (ordenadas por sale_date desc)
- Despesas do dealer
- Simulacoes de financiamento do dealer
- Contagem de veiculos disponiveis na rede inteira
- Leads do dealer (para stats de CRM)

### Calculos
- stockVehicles = veiculos nao vendidos
- availableCount, reservedCount
- totalValue = soma asking_price dos veiculos em estoque
- totalInvested = soma purchase_price dos veiculos em estoque
- totalSalesRevenue = soma sale_price de todas as vendas
- totalSalesProfit = soma profit de todas as vendas
- totalExpenses = soma de despesas pagas
- pendingExpenses = soma de despesas pendentes
- netProfit = totalSalesProfit - totalExpenses

### Secoes da pagina
1. **Hero header** — "Ola, {primeiro nome}" com gradient text, badge "Painel do Lojista"
2. **Banner de visao financeira** (glass-card aurora-bg, 4 colunas): Receita de vendas, Lucro bruto, Despesas, Lucro liquido
3. **Grid de stats** (4 cards): Veiculos no estoque, Valor do estoque, Lucro em vendas, Despesas pagas. Cada card com icone, hover-lift, spotlight seguindo mouse, gradiente no hover
4. **Acoes rapidas** (7 cards): Meu Estoque, Vendas, Financeiro, Clientes, Financiamento, Atendimento, Buscar na Rede
5. **Veiculos recentes** (4 ultimos) + **Vendas recentes** (4 ultimas) lado a lado
6. **Bloco de financiamento** (condicional, se ha simulacoes): 6 mini-cards com stats (simulacoes hoje, aprovadas, em analise, recusadas, fechadas, taxa de conversao)
7. **CRM quick stats** (condicional): leads ativos, quentes (score >= 80), acompanhamentos hoje — link para /atendimento
8. **Alerta de despesas pendentes** (condicional, se pendingExpenses > 0)

### Loading state
Spinner duplo (accent + gold) girando em direcoes opostas

---

## 8. GESTAO DE ESTOQUE

### MyStockPage.tsx — Listagem
- Carrega veiculos com fotos (`vehicles` join `vehicle_photos`)
- Busca por marca, modelo, cor, placa
- Filtro por status: todos, disponiveis, reservados, vendidos (default: available)
- Grid de cards (1-4 colunas responsivo)
- Cada card: foto de capa (ou icone Car se sem foto), badge de status, marca/modelo, ano/cor, preco de venda, preco de custo, KM
- Botoes: Ver, Editar, Excluir
- Modal de confirmacao para excluir
- Estado vazio: ilustracao + CTA para cadastrar

### VehicleFormPage.tsx — Formulario
- Modo criar e editar (baseado na URL /veiculo/novo vs /veiculo/:id/editar)
- Campos: marca, modelo, ano fabricacao, ano modelo, cor, km, combustivel, transmissao, placa, chassi, motor, portas, descricao, preco de compra, preco de venda, preco minimo, status
- **Upload de fotos**: validacao (JPEG/PNG/WEBP/GIF/AVIF, max 10MB), upload para bucket Supabase `vehicle-photos` no path `{dealer_id}/{vehicle_id}/{timestamp}-{i}.{ext}`
- Atribuir foto de capa, deletar foto, reordenar
- **Preview financeiro ao vivo**: lucro (asking - purchase), margem %, lucro minimo (min - purchase)
- Componentes helper: Field (label + input), Metric (display de valor)

### VehicleDetailPage.tsx — Detalhes
- Carrega veiculo proprio (dados completos) ou de outro dealer via `network_vehicles` (dados publicos, sem custo/margem/placa/chassi)
- **Galeria de fotos**: lightbox com navegacao por teclado (Esc, setas), thumbnails, prev/next
- **Visao do dono**: dados financeiros (custo, venda, min, lucro, margem), botao editar, link simulacao financiamento, historico de simulacoes
- **Visao de outro dealer**: botao WhatsApp com mensagem pre-preenchida
- Componentes helper: FinancialRow, WhatsAppIcon (SVG inline)

---

## 9. BUSCA NA REDE (NetworkSearchPage.tsx)

- Query em `network_vehicles` (visao publica que omite custo/preco min/margem/placa/chassi de outros dealers)
- Exclui proprios veiculos dos resultados
- Filtros: texto (marca/modelo), marca, preco min/max, ano
- Cards: foto, status, marca/modelo, info do dealer (link para perfil publico), preco, KM, botao WhatsApp para negociar com mensagem pre-preenchida

---

## 10. FINANCEIRO (FinancePage.tsx)

### Dados carregados
- Despesas com join de categoria (`expenses` join `expense_categories`)
- Categorias de despesa do dealer

### Cards de resumo
- Total de despesas, Pagas, Pendentes, Despesas do mes

### Grafico de barras
- Despesas por categoria (barra horizontal com cor da categoria)

### Despesas fixas
- Resumo separado de despesas fixas mensais

### Filtros
- Busca por descricao
- Filtro por categoria
- Filtro por status (pago/pendente)
- Filtro fixas vs variaveis

### Lista de despesas
- Ponto colorido da categoria, descricao, vencimento, recorrencia, badge fixa, valor, toggle pago/pendente, editar, excluir

### Modal de despesa (ExpenseModal.tsx)
- Campos: descricao, valor, categoria (select + criar nova categoria com nome e cor), vencimento, recorrencia (unica/semanal/mensal/anual), status (pendente/pago), data pagamento (se pago), despesa fixa (checkbox), observacoes
- Criar nova categoria inline (nome + color picker)

### Encerramento mensal
- Botao "Encerrar mes" abre modal de preview com resumo
- Executa `executeMonthClosure()`:
  1. Reune todos os dados do mes (despesas, vendas, veiculos vendidos)
  2. Salva em `monthly_closures` com report_data e summary_totals
  3. Deleta despesas nao fixas
  4. Deleta veiculos vendidos
  5. Deleta registros de vendas (arquivados no relatorio)
  6. Gera PDF do relatorio (HTML imprimivel)
- Historico de encerramentos com botao para baixar PDF

### closure.ts
- `gatherClosureData(dealerId)` — reune despesas, vendas do mes, veiculos vendidos, calcula totais, despesas por categoria
- `executeMonthClosure(dealerId)` — salva closure, limpa dados, retorna registro
- `generateClosurePDF(closure, dealerName, dealerLogoUrl)` — gera HTML com print() para PDF
- Relatorio PDF inclui: resumo (despesas, vendas, lucro, veiculos), despesas por categoria, tabela de vendas, tabela de veiculos vendidos, tabela de despesas

---

## 11. VENDAS (SalesPage.tsx)

### Stats
- Receita total, lucro total, custo total, margem media

### Lista de vendas
- Nome do veiculo, cliente, metodo de pagamento, data, preco de venda, lucro, editar, excluir

### Modal de venda
- Selecionar veiculo (auto-preenche preco de compra e venda)
- Nome e telefone do cliente
- Preco de venda, preco de compra
- Preview ao vivo de lucro e margem
- Metodo de pagamento (dinheiro, pix, cartao, financiamento, permuta, outro)
- Data da venda, observacoes
- Ao salvar: marca veiculo como `sold` se vehicle_id definido

---

## 12. CLIENTES (ClientsPage.tsx)

### Funcionalidades
- CRUD completo de clientes
- Busca por nome, telefone, email, documento
- Grid de cards: avatar (primeira letra), nome, data de criacao, badge de status (ativo/inativo), telefone, email, documento (mascarado), endereco, observacoes, editar, excluir
- Modal: nome, telefone, documento, email, endereco, observacoes, status
- Modal de confirmacao para excluir

---

## 13. FINANCIAMENTO

### FinancingPage.tsx — Listagem
- Lista simulacoes do dealer
- Stats: total, aprovadas, em analise, recusadas, convertidas
- Filtros por status
- Cards com: cliente, veiculo, valor, entrada, prazo, status, melhor oferta
- Botoes: ver detalhes, nova simulacao

### FinancingSimulationPage.tsx — Nova Simulacao
- Selecionar veiculo (do proprio estoque) ou veiculo avulso
- Selecionar cliente (opcional)
- Campos: preco do veiculo, entrada, valor financiado (auto-calculado), prazo em meses, parcela maxima (opcional)
- Consentimento do cliente (checkbox obrigatorio)
- Botao "Simular" chama a Edge Function `financing-simulator`
- Resultados: lista de ofertas de todas as instituicoes ativas
- Cada resultado: nome do banco, status (aprovado/aprovado com condicao/recusado), entrada, financiado, parcela, prazo, taxa, CET, condicoes, link do banco, WhatsApp do banco
- Melhor opcao destacada (determineBestOption: score baseado em status + parcela + entrada + CET + prazo)
- Botoes: gerar proposta (PDF), salvar simulacao

### FinancingDetailPage.tsx — Detalhes
- Dados da simulacao salva
- Ofertas recebidas (com destaque para a melhor)
- Gerar proposta PDF
- Alterar status da simulacao
- Converter em venda

### financing-engine.ts
- `runSimulation(institutions, input)` — chama Edge Function `financing-simulator` com token de sessao
- `determineBestOption(results)` — pontua e seleciona melhor oferta
- `rankResults(results, criteria)` — ordena por: melhor, menor parcela, menor entrada, menor custo, maior prazo, aprovacao
- `loadInstitutions()` — carrega instituicoes ativas
- `loadOffers(simulationId)` — carrega ofertas salvas

### proposal.ts
- `generateProposal(data)` — gera HTML de proposta de financiamento com:
  - Cabecalho com logo do dealer e nome
  - Protocolo da simulacao
  - Badge de status (aprovado/aprovado com condicao)
  - Dados do cliente (nome, CPF/CNPJ, telefone)
  - Dados do veiculo
  - Condicoes da proposta (valor, entrada, financiado, parcela, prazo, taxa, CET)
  - Condicoes e observacoes
  - Secao do banco com link oficial
  - Disclaimer
  - Botao Imprimir/Salvar PDF
  - Abre em nova aba (ou mesma se popup bloqueado)

### Instituicoes financeiras (26 bancos reais brasileiros)
Banco do Brasil, Bradesco, Itau, Santander, Caixa, BV, Safra, Votorantim, PAN, Omni, Porto Seguro, Itau Consignado, Matrix, Brazilian Capital, Jazz,_creditas, Geru, Provu, Sim, Lend, Zetra, Facta, Sorocred, Trigg, Masterbank, Websimul

Cada instituicao tem: nome, type, logo_url, active, financing_url, whatsapp_number

---

## 14. CRM E ATENDIMENTO

### AtendimentoPage.tsx
- Hub central de atendimento
- Stats: conversas abertas, nao lidas, leads quentes, acompanhamentos hoje
- Lista de conversas recentes com preview, canal, status
- Lista de leads quentes (score >= 80)
- Lista de acompanhamentos pendentes
- Links para Inbox, CRM e Integracoes

### CrmPage.tsx — Pipeline Kanban
- Board kanban com 7 colunas: Novo, Contatado, Qualificado, Proposta, Negociacao, Ganho, Perdido
- Cada lead e um card arrastavel (nao implementado drag-and-drop, mas com seletor de status no detalhe)
- Card mostra: nome, fonte, score (com cor e label: Quente/Morno/Frio), veiculo de interesse, valor
- Filtros: busca, fonte, score
- Botao "Novo lead" abre LeadModal
- Click no card abre LeadDetail (drawer lateral)

### LeadModal.tsx
- Campos: nome, telefone, email, fonte (select com 12 opcoes), detalhe da fonte, veiculo de interesse (select do estoque), orcamento, entrada, parcela maxima, observacoes, status
- Criar ou editar lead

### LeadDetail.tsx — Drawer lateral
- Header: nome, score com chama, fonte, telefone (link WhatsApp), email, responsavel
- Seletor de status (7 botoes de pipeline)
- 3 tabs:
  1. **Informacoes**: veiculo de interesse, orcamento, entrada, parcela max, detalhe da fonte, observacoes, datas
  2. **Interacoes**: lista de interacoes + botao adicionar (tipo + descricao). Tipos: ligacao, WhatsApp, email, mensagem, visita, test drive, proposta enviada, financiamento, nota
  3. **Acompanhamentos**: lista de follow-ups + botao agendar (tipo + data/hora + mensagem). Botoes concluir/pular. Badge "IA" se ai_suggested. Destaca atrasados

### InboxPage.tsx — Caixa de entrada
- Lista de conversas multi-canal
- Filtros por canal
- Cada conversa: nome do contato, canal (com cor), preview da ultima mensagem, nao lidos, sentimento IA, intenciacao IA
- Click abre conversa: mensagens (balões inbound/outbound), input para responder
- Realtime: novas mensagens aparecem automaticamente (Supabase Realtime)
- Marcar como lida ao abrir
- AI summary, sentiment, intent exibidos

### crm.ts — Constantes e helpers
- LEAD_SOURCES: 12 fontes (WhatsApp, Instagram, Facebook, OLX, Webmotors, Mercado Livre, Google, QR Code, Site, Indicacao, Loja Fisica, Outros)
- PIPELINE_STAGES: 7 estagios com label, cor, bgColor
- INTERACTION_TYPES: 9 tipos
- FOLLOW_UP_TYPES: 5 tipos
- scoreColor(score): success (>=80), warning (>=60), accent (>=40), navy (<40)
- scoreLabel(score): Quente (>=80), Morno (>=60), Frio (<60)
- timeAgo(dateStr): "Agora", "Xmin atras", "Xh atras", "Xd atras", data
- isOverdue(scheduledAt, status): boolean

---

## 15. INTEGRACOES

### IntegrationsPage.tsx
- Lista de plataformas: WhatsApp, Instagram, Facebook, OLX, Webmotors
- Cada plataforma mostra status (conectado/desconectado/erro)
- Formularios de conexao especificos por plataforma:
  - **WhatsApp Cloud API**: phone_number_id, access_token, waba_id, phone_number
  - **Instagram/Facebook (Meta Graph)**: page_id, access_token, account_name
  - **OLX**: client_id, client_secret, account_email
  - **Webmotors**: api_token, account_email
- Webhook URL exibida para configurar na plataforma
- Botao desconectar
- Botao sincronizar
- Codigo de embed do widget de chat para site
- Chat IA de ajuda flutuante (IntegrationHelpChat)

### IntegrationsCallbackPage.tsx
- Pagina de callback OAuth para integracoes

### IntegrationHelpChat.tsx — Chat IA flutuante
- Botao flutuante "Preciso de ajuda" no canto inferior direito
- Abre chat com assistente IA
- Contexto da plataforma atual (se configurando WhatsApp, etc)
- Envio de texto e imagem (print de tela, max 5MB)
- Streaming SSE (Server-Sent Events) para respostas em tempo real
- Botao parar geracao
- Sugestoes de perguntas iniciais
- Renderizacao de markdown (bold, italic, code blocks, listas)
- Fallback se IA externa nao configurada

### integrations.ts
- `connectWhatsAppCloud(dealerId, integrationId, phoneNumberId, accessToken, wabaId, phoneNumber)` — upsert em integration_accounts
- `connectMetaSocial(dealerId, integrationId, platform, pageId, accessToken, accountName)` — upsert para Instagram/Facebook
- `connectOLX(dealerId, integrationId, clientId, clientSecret, accountEmail)` — upsert
- `connectWebmotors(dealerId, integrationId, apiToken, accountEmail)` — upsert
- `disconnectAccount(accountId)` — marca como disconnected
- `syncConversations(dealerId, accountId, platform)` — atualiza last_sync_at
- `loadConversations(dealerId)` — busca conversas com join de lead
- `loadMessages(conversationId)` — busca mensagens ordenadas
- `sendMessageViaPlatform(conversationId, dealerId, content)` — chama Edge Function send-message
- `markConversationRead(conversationId)` — zera unread_count
- `getSiteWidgetEmbedCode(dealerId)` — gera script tag para embedar widget
- `getSiteWidgetUrl(dealerId)` — URL do widget
- `getWebhookUrl()` — URL do webhook da Edge Function

### CHANNEL_COLORS e CHANNEL_LABELS
- whatsapp: #25D366, instagram: #E4405F, facebook: #1877F2, olx: #7E22CE, webmotors: #E30613, mercado_livre: #FFE600, google: #4285F4, site: #2a93e8

---

## 16. PERFIL DA LOJA

### DealerProfilePage.tsx
- Perfil publico do dealer (rota /lojista/:id)
- Capa (cover_url), logo, nome, descricao, endereco, telefone, WhatsApp
- Lista de veiculos disponiveis do dealer
- Botao de contato WhatsApp

### ProfileEditPage.tsx
- Editar dados da loja: nome, telefone, email, endereco, cidade, estado, CNPJ, WhatsApp, descricao
- Upload de logo
- Upload de imagem de capa
- Preview ao vivo

---

## 17. BANCO DE DADOS (Supabase)

### Tabelas principais

**dealers**
- id (uuid, PK), user_id (uuid, unico), name, phone, email, address, city, state, logo_url, cover_url, description, cnpj, whatsapp, created_at, updated_at

**vehicles**
- id, dealer_id (FK), brand, model, year_manufacture, year_model, color, mileage, fuel, transmission, plate, chassis, engine, doors, description, purchase_price, asking_price, min_price, profit_margin, status (available/reserved/sold), created_at, updated_at

**vehicle_photos**
- id, vehicle_id (FK), url, is_cover, created_at

**expense_categories**
- id, dealer_id, name, color, is_default, created_at

**expenses**
- id, dealer_id, category_id, description, amount, due_date, paid_date, status (pending/paid), recurrence (none/weekly/monthly/yearly), is_fixed, notes, created_at

**sales**
- id, dealer_id, vehicle_id, client_name, client_phone, sale_price, purchase_price, profit, payment_method, sale_date, notes, created_at

**clients**
- id, dealer_id, name, phone, email, document, address, notes, status (active/inactive), created_at

**monthly_closures**
- id, dealer_id, period_month, period_year, closed_at, report_data (jsonb), summary_totals (jsonb)

**financing_institutions**
- id, name, type, logo_url, active, financing_url, whatsapp_number, created_at

**financing_simulations**
- id, dealer_id, vehicle_id, client_id, vehicle_price, down_payment, financed_amount, term_months, max_installment, status, consent_given, notes, created_at, updated_at

**financing_offers**
- id, simulation_id, institution_id, status, down_payment, financed_amount, term_months, installment_amount, interest_rate, cet, conditions, notes, is_best, created_at

**leads**
- id, dealer_id, client_id, vehicle_id, name, phone, email, source, source_detail, status, lead_score, budget, down_payment, max_installment, notes, last_interaction_at, assigned_to, created_at, updated_at

**lead_interactions**
- id, lead_id, dealer_id, type, description, vehicle_id, created_at

**lead_follow_ups**
- id, lead_id, dealer_id, scheduled_at, message, type, status (pending/done/skipped), ai_suggested, completed_at, created_at

**integrations**
- id, platform, display_name, icon, color, description, auth_type, docs_url, is_active, sort_order, created_at

**integration_accounts**
- id, dealer_id, integration_id, status, account_name, account_identifier, account_email, account_password_encrypted, webhook_url, webhook_verified, webhook_secret, phone_number_id, waba_id, last_sync_at, last_error, metadata (jsonb), connected_at, disconnected_at, created_at, updated_at

**conversations**
- id, dealer_id, integration_account_id, lead_id, client_id, external_id, contact_name, contact_phone, contact_handle, channel, status, last_message_at, last_message_preview, unread_count, ai_summary, ai_sentiment, ai_intent, ai_qualified, created_at, updated_at

**messages**
- id, conversation_id, dealer_id, direction (inbound/outbound), content, content_type, external_id, ai_extracted_data (jsonb), ai_analysis (jsonb), created_at

**lead_tracking_events**
- id, dealer_id, lead_id, event_type, channel, vehicle_id, metadata (jsonb), created_at

**app_settings**
- id, dealer_id, key, value (jsonb), created_at, updated_at

### Views
- `network_vehicles` — visao publica de veiculos de todos os dealers (omits: purchase_price, min_price, profit_margin, plate, chassis, engine). SECURITY DEFINER.
- `network_dealers` — visao publica de dealers (info publica apenas)

### RLS (Row Level Security)
- Todas as tabelas têm RLS habilitado
- Politicas por verbo (SELECT, INSERT, UPDATE, DELETE) scopeadas por `auth.uid() = user_id` (via dealers) ou `dealer_id` proprio
- `financing_institutions` — leitura publica para authenticated, escrita bloqueada
- `network_vehicles` e `network_dealers` — SECURITY DEFINER, acesso anon+authenticated
- Storage bucket `vehicle-photos` — policies scoped por dealer_id

### Realtime
- Habilitado nas tabelas `conversations` e `messages`

### Dados seed
- 26 instituicoes financeiras brasileiras reais
- 5 integracoes (WhatsApp, Instagram, Facebook, OLX, Webmotors)

---

## 18. EDGE FUNCTIONS (Supabase)

### financing-simulator (index.ts)
- Metodo: POST
- Recebe: vehiclePrice, downPayment, financedAmount, termMonths, maxInstallment, vehicleBrand, vehicleModel, vehicleYear, clientName, clientDocument
- Verifica JWT do usuario
- Carrega todas as instituicoes ativas do banco
- Para cada instituicao, gera uma oferta com:
  - Algoritmo de taxa de juros baseado no prazo e valor
  - Calculo de CET (Custo Efetivo Total)
  - Valor da parcela (Price ou SAC)
  - Condicoes especificas por tipo de instituicao (banco tradicional vs fintech)
  - Status: approved / approved_with_condition / rejected (baseado em regras de entrada/prazo)
- Retorna array de resultados com institutionId, institutionName, status, downPayment, financedAmount, termMonths, installmentAmount, interestRate, cet, conditions, notes, financingUrl, whatsappNumber
- CORS headers em todas as respostas

### platform-webhook (index.ts)
- Metodo: GET, POST
- Recebe webhooks de WhatsApp Cloud API, Meta Graph (Instagram/Facebook), OLX, Webmotors
- GET: verificacao de webhook (hub.challenge do Meta)
- POST: processa mensagens recebidas:
  - Identifica o dealer pelo integration_account
  - Cria ou atualiza conversation
  - Salva message
  - Extrai dados com IA (vehicle_interest, budget, intent)
  - Cria ou atualiza lead se qualificado
- CORS headers

### send-message (index.ts)
- Metodo: POST
- Recebe: conversation_id, dealer_id, content
- Busca a integration_account conectada para o canal
- Envia mensagem via API da plataforma (WhatsApp Cloud API, Meta Graph, etc.)
- Salva message como outbound
- Retorna success, delivered, delivery_error, message
- CORS headers

### ai-help-chat (index.ts)
- Metodo: POST
- Recebe: messages (array com role + content, incluindo imagens), platform_context
- Chama API de IA (OpenRouter ou similar) com streaming SSE
- System prompt: assistente especializado em integracoes da Rede Auto
- Suporta visao (analisa prints de tela)
- Fallback de respostas locais se IA nao configurada
- Retorna streaming SSE ou JSON fallback
- CORS headers

### ai-lead-qualifier (index.ts)
- Metodo: POST
- Recebe: conversation_id ou message data
- Analisa mensagem do cliente com IA
- Extrai: vehicle_interest, budget, down_payment, max_installment, intent
- Calcula lead_score (0-100)
- Sugere follow-up e proxima acao
- Atualiza lead e conversation com dados extraidos
- Pode criar lead_follow_up com ai_suggested = true
- CORS headers

### connect-social (index.ts)
- Metodo: POST
- Recebe: platform, credentials
- OAuth flow para Instagram/Facebook via Meta Graph API
- Troca code por access_token
- Busca info da conta (page_id, username)
- Retorna dados para salvar em integration_accounts
- CORS headers

---

## 19. SERVIDOR WHATSAPP (server/whatsapp/index.cjs)

- Servidor Node.js separado (npm run wa-server)
- Usa @whiskeysockets/baileys para conexao WhatsApp multi-dispositivo
- Gera QR code para autenticacao (qrcode-terminal + qrcode)
- Mantem sessao por dealer em /sessions/wa_{dealerId}/
- Recebe mensagens e envia para a Edge Function platform-webhook
- Envia mensagens outbound recebidas da plataforma

---

## 20. PLUGIN VITE (server/connector-plugin.cjs)

- Plugin customizado do Vite
- Resolve modulos e faz conectores necessarios para o ambiente Bolt

---

## 21. WIDGET DE CHAT (public/widget/)

### chat.html
- Pagina standalone do widget de chat
- Recebe dealer_id via query param (?dealer=xxx)
- Interface de chat simples para embedar em sites externos

### chat.js
- Script embarcavel que cria um botao flutuante no canto do site
- Abre popup de chat
- Conecta com Supabase usando anon key
- Envia mensagens para o dealer
- Cria conversation com channel "site"
- Responsive e estilizado

---

## 22. TIPOS TYPESCRIPT (supabase.ts)

Todos os tipos definidos:
- Dealer, Vehicle, VehiclePhoto, VehicleWithDetails
- ExpenseCategory, Expense, ExpenseWithCategory
- MonthlyClosure
- Sale, SaleWithVehicle
- ClientRecord
- FinancingInstitution, FinancingSimulation, FinancingSimulationStatus, FinancingOffer, FinancingOfferWithInstitution, FinancingSimulationWithDetails
- LeadSource (12 valores), LeadStatus (7 valores), Lead, LeadWithRelations
- InteractionType (9 valores), LeadInteraction
- FollowUpType (5 valores), LeadFollowUp
- Integration, IntegrationAccount
- Conversation, ConversationWithLead, Message, LeadTrackingEvent

---

## 23. FORMATADORES (format.ts)

- `formatCurrency(value)` — Intl.NumberFormat pt-BR currency BRL, retorna "—" se null
- `formatNumber(value)` — Intl.NumberFormat pt-BR
- `formatDate(value)` — dd/MM/yyyy pt-BR
- `formatMileage(value)` — "{numero} km"
- `statusLabel(status)` — traduz status para portugues (available=Disponivel, reserved=Reservado, sold=Vendido, etc)
- `statusColor(status)` — classes Tailwind de cor por status (bg + text + border)
- `maskCPF(document)` — mascara CPF (***.***.***-**) ou CNPJ (**.***.***/****-**)

---

## 24. LOGO (Logo.tsx)

- Imagem do logo em /images/762904057_18120070436504665_7201693434288924363_n.jpg
- Tamanhos: sm (36px), md (48px), lg (64px), xl (80px)
- Imagem com ring accent-400/30, shadow accent-500/20, rounded-2xl
- Glow blur animado atrás
- Texto "Rede Auto" (font-extrabold) + "Ribeirao" (tracking largo, accent-400, uppercase)

---

## 25. CONFIGURACOES DO PROJETO

### package.json
- name: "vite-react-typescript-starter"
- scripts: dev (vite), build (tsc -b && vite build), preview (vite preview), wa-server (node server/whatsapp/index.cjs)
- dependencies: @supabase/supabase-js ^2.111.0, @whiskeysockets/baileys ^7.0.0-rc14, curve25519-js ^0.0.4, lucide-react ^1.28.0, nodejs-insta-private-api ^5.61.12, qrcode ^1.5.4, qrcode-terminal ^0.12.0, react ^19.2.8, react-dom ^19.2.8, react-router-dom ^7.18.2, tweetnacl ^1.0.3
- devDependencies: @tailwindcss/vite ^4.3.3, @types/node ^22.20.1, @types/react ~19.2.18, @types/react-dom ~19.2.4, @vitejs/plugin-react ^6.0.5, tailwindcss ^4.3.3, typescript ^6.0.3, vite ^8.2.0

### vite.config.ts
- Plugins: react(), tailwindcss(), connectorPlugin()
- resolve.tsconfigPaths: true
- optimizeDeps.exclude: ['lucide-react']

### tsconfig.app.json
- target: ES2023
- lib: ES2023, DOM, DOM.Iterable
- moduleResolution: bundler
- jsx: react-jsx
- paths: { "@/*": ["./src/*"] }
- noUnusedLocals: false
- noUnusedParameters: false
- noFallthroughCasesInSwitch: true

### index.html
- lang: en
- title: "Rede Auto Ribeirao Car Inventory"
- og:image e twitter:card configurados

---

## 26. PRINCIPIOS DE DESIGN SEGUIDOS

- Tema dark navy com accent azul e detalhes dourados
- Glassmorphism em cards e modais
- Animacoes sutis em toda interface (fade-in, hover-lift, spotlight, glow)
- Sistema de espacamento 8px
- Tipografia Inter com 3 pesos maximos (normal, semibold, extrabold/bold)
- Contraste de cores sempre legivel
- Responsivo: mobile (menu hamburger), tablet (2-3 colunas), desktop (4+ colunas com sidebar)
- Micro-interacoes: hover scale, rotate, translate, shimmer, sheen, ripple
- Loading states: spinners duplos, skeletons
- Estados vazios: ilustracoes com icones grandes + CTA
- Modais: backdrop blur, animacao drop-in, borda gradiente no topo
- Botoes: gradient, shadow, hover lift, shine/sheen effect

---

## 27. FLUXO COMPLETO DO USUARIO

1. **Onboarding**: Usuario acessa /, ve pagina de login, cadastra com nome+telefone+email+senha
2. **Dashboard**: Ve visao geral com metricas, acoes rapidas, veiculos e vendas recentes
3. **Estoque**: Cadastra veiculos com fotos, ve detalhes, edita, gerencia status
4. **Vendas**: Registra vendas selecionando veiculo, calcula lucro automaticamente
5. **Financeiro**: Cadastra despesas por categoria, marca fixas/variaveis, controla pagamentos, encerra mes
6. **Financiamento**: Simula com cliente, compara 26 bancos, gera proposta PDF, converte em venda
7. **CRM**: Cria leads, move pelo pipeline kanban, registra interacoes, agenda follow-ups
8. **Atendimento**: Recebe mensagens de WhatsApp/Instagram/Facebook/OLX/Webmotors, responde, IA qualifica leads
9. **Integracoes**: Conecta WhatsApp Cloud API, Meta Graph, OLX, Webmotors com webhooks
10. **Rede**: Busca veiculos de outros lojistas, contata via WhatsApp
11. **Perfil**: Edita dados da loja, logo, capa, ve publicamente em /lojista/:id
12. **Widget**: Embeda chat no site externo, clientes entram em contato

---

## 28. DETALHES IMPORTANTES

- Toda comunicacao com banco usa o cliente Supabase com anon key
- Autenticacao via Supabase Auth (email/senha, sem confirmacao de email)
- Sessao persistida e auto-refresh
- RLS protege todos os dados — cada dealer so ve seus proprios dados
- Veiculos de outros dealers visiveis apenas via view network_vehicles (sem dados financeiros sensiveis)
- Realtime em conversations e messages para atualizacao instantanea no Inbox
- Edge Functions sempre incluem CORS headers completos
- Mensagens de erro sao genericas para nao vazar informacoes (ex: "E-mail ou senha incorretos" em vez de "User not found")
- Sessao obsoleta (user sem registro dealer) faz signOut automatico
- Encerramento mensal arquiva todos os dados em JSON e limpa registros nao fixos
- Proposta de financiamento e relatorio de encerramento geram HTML imprimivel (window.print() para PDF)
