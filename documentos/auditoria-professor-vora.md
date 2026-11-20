# Auditoria da Vora para a apresentação

18 de novembro de 2026

Depois da apresentação, a revisão de 20/11/2026 reuniu os materiais da entrega e atualizou a modelagem. A API pública respondeu em `/health`. O endpoint público de pagamento devolveu 503 ao receber um evento sem assinatura, comportamento do código quando falta o segredo do webhook. O fluxo de consulta manual continua previsto no botão **Atualizar situação**. [README da entrega](../README.md) · [Resultados da revisão](testes.csv)

Na auditoria de 18/11, a página inicial carregou o catálogo do Render, as três faixas de frete responderam com dados do ViaCEP e o pedido #14 constava como Pago com uma aprovação no Turso. A primeira chamada medida a `GET /produtos` levou **1,1 s** naquela execução. [Loja pública](https://loja-virtual-f96n.vercel.app/) · [Saúde da API](https://vora-supermarket.onrender.com/health)

A jornada local passou em **66 passos e três verificações extras**. A matriz de cliente e administração passou em **113 cenários com SQLite e 113 com libSQL**. O teste de integração também passou com o motor do Turso em arquivo isolado. O Newman rodou **35 requisições e 35 verificações** da coleção daquela revisão. Nesses testes, os clientes e pedidos foram descartáveis e as respostas de pagamento simuladas. A versão pública foi consultada separadamente. A seção de correções registra os commits daquela rodada.

## A. Funcionamento ao vivo

| ID | Resultado | Evidência e arquivo relacionado |
| --- | --- | --- |
| A-01 | PASSOU | `GET /produtos` no Render retornou 200 em 1.092 ms, com 16 fichas. Plano gratuito confirmado no painel. |
| A-02 | PASSOU | Leitura no Turso encontrou 32 registros de produto. A API apresenta 16 fichas do catálogo deduplicado. A configuração da conexão está em `back-end/src/database/connection.js`. |
| A-03 | PASSOU local. NÃO SE APLICA à escrita na loja pública nesta auditoria | Playwright criou dois clientes em sessões separadas, autenticou, comprou e abriu o histórico. No Vercel, 16 caminhos responderam 200 no acesso direto e o painel redirecionou visitantes ao login. |
| A-04 | PASSOU por sincronização | Turso mostra o #14 Pago com uma aprovação e o #17 Pago com três aprovações de teste distintas. A repetição da mesma transação em base isolada preservou um único registro por ID externo. A entrega assinada na nuvem depende de `MP_WEBHOOK_SECRET`. |
| A-05 | PASSOU | A integração registrou Recusado no pagamento e manteve o pedido Pendente. `pagamentoService.js` e `pagamentoModel.js`. |
| A-06 | PASSOU | Playwright viu a loja usar a API publicada. O servidor devolveu `Access-Control-Allow-Origin` com a origem autorizada. |
| A-07 | PASSOU | As seis rotas da etapa 6 constam na coleção executada. Catálogo com filtros e detalhe responderam 200 na API pública. |
| A-08 | PASSOU | CEPs públicos de SP, RJ e AM retornaram R$ 15/3 dias, R$ 20/5 dias e R$ 30/8 dias. CEP inexistente retornou 404. O link, o retorno e a consulta de pagamento passaram com a integração simulada. |
| A-09 | PASSOU | O usuário cancela o próprio pedido pendente elegível em `POST /pedidos/:id/cancelar`. A repetição retorna 409 e o estoque é reposto uma vez. |
| A-10 | PASSOU | `GET /pedidos` e **Minha conta → Meus pedidos** mostram apenas o histórico do cliente autenticado. |

## B. Segurança básica

| ID | Resultado | Evidência e arquivo relacionado |
| --- | --- | --- |
| B-01 | PASSOU | A matriz e o SQLite verificaram bcrypt e ausência de hash no retorno de cadastro e login. O Turso confirmou o formato em 4 de 4 contas pelo agregado. |
| B-02 | PASSOU | Sem token, inválido, adulterado ou expirado retornaram 401 no teste local. Cliente e admin receberam validade de 7.200 segundos após a correção. |
| B-03 | PASSOU | Segundo cliente recebeu 404 para consulta, pagamento e cancelamento do pedido alheio. |
| B-04 | PASSOU | Valores enviados pelo cliente foram descartados e o servidor recalculou a compra em centavos. |
| B-05 | PASSOU nas rotas HTTP | Busca, IDs e demais valores usam parâmetros em `src/models`. Interpolações do painel usam colunas de lista fixa ou trechos SQL do próprio código. O utilitário de migração é uma operação manual de manutenção e recebe um arquivo de origem confiável. |
| B-06 | PASSOU no ambiente local | O comprimento verificado de `JWT_SECRET` foi 64. O conector de diagnóstico não revela a configuração privada do Render. |
| B-07 | PASSOU na checagem realizada | `git ls-files` não retornou `.env` real, `*.db` nem `node_modules`. Os padrões auditados em 437 blobs históricos não revelaram tokens. `documentos/voraSupermarket.sqlite` é uma base histórica de catálogo. Tem zero clientes, admins, pedidos e pagamentos. |
| B-08 | PASSOU após correção | Os exemplos cobrem as 13 variáveis do back-end, incluindo `RENDER` por orientação de configuração, e `VITE_API_URL` no front. Os campos sensíveis estão vazios. |
| B-09 | PASSOU | `GET /produtos` com origem externa recebeu a resposta HTTP sem o cabeçalho que permitiria a leitura pelo navegador. A origem da Vercel recebeu o cabeçalho correto. |
| B-10 | PASSOU | Uma falha sintética devolveu HTTP 500 com `Erro interno do servidor`. O corpo permaneceu genérico após a correção. |
| B-11 | PASSOU nos cenários executados | Cadastro vazio, senha acima de 72 bytes, JSON malformado, CEP incorreto e quantidade inválida foram recusados. A URL com codificação incompleta passou a retornar 400. |
| B-12 | PASSOU | `GET /teste-token` retornou 404 na API pública. Rotas administrativas sem autenticação retornaram 401. |
| B-13 | PASSOU após correção | Um erro sintético aparecia inteiro no log. Depois da correção o log preservou o código de diagnóstico e omitiu o detalhe e a causa. Teste em `back-end/test/compra.test.js`. |

## C. Regras e dados

| ID | Resultado | Evidência e arquivo relacionado |
| --- | --- | --- |
| C-01 | PASSOU | Compra com dois itens e um sem estoque retornou 409 e reverteu o conjunto. Turso registrou zero estoques negativos. `pedidoModel.js` e trigger de estoque. |
| C-02 | PASSOU | Produto inativo saiu da lista e do detalhe e o checkout recusou sua compra. O pedido histórico continuou acessível. |
| C-03 | PASSOU | Consulta de leitura no Turso retornou zero pedidos com itens ausentes ou total incompatível. A jornada repetiu a conferência no SQLite. |
| C-04 | PASSOU | Duplo clique e duas requisições concorrentes com a mesma chave compartilharam um único ID e uma baixa de estoque. Turso retornou zero duplicidades por chave. |
| C-05 | PASSOU em base isolada | Webhook assinado simulado e sincronização repetidos não duplicaram a transação. A loja também confirmou pagamentos simulados no retorno e pelo botão, sem webhook. |
| C-06 | PASSOU | As nove situações do SQL inicial batem com as consultadas no Turso, incluindo Pendente, Pago, Enviado, Entregue e Cancelado. |
| C-07 | NÃO SE APLICA como correção automática | O slide cita MySQL/PostgreSQL e decimal. A implementação acordada usa SQLite/libSQL e centavos inteiros. A justificativa para a banca está em Decisões para o aluno. |
| C-08 | PASSOU nos requisitos funcionais auditados | Veja a matriz de rastreabilidade abaixo. Os limites de apresentação e operação estão registrados separadamente. |

| Requisito | Rota ou tela e evidência |
| --- | --- |
| RF01 · Catálogo, busca e detalhe | `GET /produtos`, `GET /produtos/:id`, `/catalogo` e `/categoria/:slug`. Roteiro validou filtro, busca vazia e item inexistente. |
| RF02 · Cadastro e login | `POST /clientes`, `POST /login`, `/cadastro` e `/entrar`. Cliente e admin usam o mesmo formulário. |
| RF03 · Carrinho | `/carrinho` e controles no cartão e na ficha. Ajuste de quantidade, remoção e subtotal passaram. |
| RF04 · Entrega | `GET /cep/:cep`, carrinho e `/checkout/endereco`. Frete e prazo ficam visíveis antes da confirmação. |
| RF05 · Fechar e consultar | `POST /pedidos`, `GET /pedidos/:id`, `/pedido/:id` e `/conta/pedidos`. |
| RF06 · Pagamento de teste | `POST /pedidos/:id/pagamento`, `POST /pagamentos/sincronizar` e Checkout Pro. Pedido #14 é a evidência pública. |
| RF07 · Gestão de catálogo | `/admin/produtos`, `/admin/categorias` e respectivas rotas protegidas. Categoria criada ficou visível em outro perfil. |
| RF08 · Gestão de pedidos | `/admin/pedidos` e `PATCH /admin/pedidos/:id/situacao`. Enviado, Entregue e Cancelado passaram nos casos válidos. |
| RNF01–RNF04 · Senha, banco, responsividade e backup | Bcrypt, JWT, SQLite/Turso e visualização móvel verificados. O procedimento de backup consta nos requisitos. A restauração de produção não foi ensaiada nesta auditoria. |

## D. Código

| ID | Resultado | Evidência e arquivo relacionado |
| --- | --- | --- |
| D-01 | PASSOU nas rotas principais | A compra segue router → controller → service → model. `/health` e a listagem simples `/categorias` são exceções no `app.js`, sem regra de compra. |
| D-02 | PASSOU no código percorrido | Não encontrei TODO pendente nos fluxos percorridos. Logs de inicialização e ferramentas manuais têm finalidade operacional. O código do protótipo e scripts antigos de migração não compõem o caminho público do Render. |
| D-03 | PASSOU com observação | Campos SQL e JSON preservam nomes de domínio em português. React usa nomes em inglês em componentes e estado. Uma padronização global afetaria contratos que a turma já demonstra. |
| D-04 | PASSOU após correção | `npm ci` em clone limpo instalou front e back. `npm start`, `npm run dev`, lint, build Vite e sintaxe JS passaram. `require.resolve("./back-end")` passou a apontar para `server.js`. O `npm audit --omit=dev` relatou zero alertas no dia. |
| D-05 | PASSOU nos cenários executados | Banco e integrações são aguardados no caminho de checkout e pagamento. Falha de CEP e erro interno foram exercitados. |
| D-06 | PASSOU após correção | Frete e prazo por UF estão em `cepService.js`. `tokenService.js` passou a centralizar o prazo de 2 h dos dois perfis. |

## E. Versionamento e documentos

| ID | Resultado | Evidência e arquivo relacionado |
| --- | --- | --- |
| E-01 | PASSOU | `git ls-remote` mostrou `main` e `vercel` em `9f7b5f8`. O Render implanta `vercel`. O Vercel publicou essa mesma versão. Não há divergência a mesclar entre elas. |
| E-02 | FALHOU no histórico anterior | Há mensagens antigas como `123` e `cont.`. Os novos commits descrevem uma correção por vez. O histórico anterior foi preservado. |
| E-03 | PASSOU após correção | `git check-ignore` passou a cobrir `.env`, `node_modules`, `.db`, `.sqlite`, `.sqlite3` e arquivos auxiliares na raiz e nas subpastas. |
| E-04 | PASSOU | `assets/`, `back-end/`, `documentos/` e `front-end/` constam no clone. |
| E-05 | PASSOU após correção | O README recebeu os links públicos, as variáveis de exemplo e os nomes dos botões do checkout atual. |
| E-06 | PASSOU | `documentos/API.md` cobre método, autenticação, corpo e resposta das rotas de loja e administração. |
| E-07 | PASSOU com atualização na revisão | `PRAGMA quick_check` retornou `ok` e a verificação de chaves não apontou órfãos na base histórica. Em 20/11, os campos que estavam apenas no complemento de requisitos passaram ao dicionário e ao Draw.io. [Guia do banco](banco-de-dados.md) |
| E-08 | PASSOU após correção | A coleção importada no Newman executou 35 requisições e 35 verificações com zero falhas. [Coleção Postman](Vora.postman_collection.json) |

## F. Execução do zero

| ID | Resultado | Evidência e arquivo relacionado |
| --- | --- | --- |
| F-01 | PASSOU após correção | Clone da `main` e duas instalações com `npm ci` passaram. Com o `HOST` herdado, o servidor anunciou `localhost.localdomain` e a conexão IPv4 falhou. Com a correção, API, HTML do Vite e proxy responderam no clone. A porta 3000 estava em uso na máquina, por isso o ensaio usou portas isoladas. |
| F-02 | PASSOU | O boot inicial executou `create.sql`, `insert.sql` e a atualização de ofertas. O clone apresentou 16 fichas sem exigir restaurar um arquivo do banco. |

## Interface e materiais para a banca

- **Loja.** Catálogo publicado, página de categoria e rotas diretas conferidos em navegador. O roteiro local testou 375 px no checkout, no pedido e no painel. Na versão pública, em 375 px, o carrossel respeitou movimento reduzido, a banana exibiu duas fotos com zoom fechável por Escape, o favorito persistiu após F5 e a rota inexistente mostrou a logo no 404. A paleta do PDF coincide com o CSS. Contrastes medidos de texto branco no verde, âmbar no verde escuro, vermelho no fundo claro e verde escuro no fundo claro foram 6,34:1, 7,23:1, 6,56:1 e 11,53:1.
- **Identidade.** O PDF em A4 contém o logo colorido e branco, cinco cores com códigos e as fontes Fredoka e Nunito. A revisão de 20/11 publicou o logo e o símbolo reduzido em SVG a partir da arte vetorial original. [Identidade visual](identidade-visual-vora.pdf) · [Logo em SVG](marca/vora-logo.svg) · [Símbolo em SVG](marca/vora-simbolo.svg)
- **Figma.** O conector confirmou os quadros **Perfil no Instagram**, **Post 1080 × 1080**, **Capa do Reel 1080 × 1920** e **Roteiro de 12 s**. O acesso confirmado foi o da conta conectada. O vídeo exportado do Reel, os slides e o vídeo de backup da demonstração ficaram sem evidência nos materiais auditados. [Arquivo no Figma](https://www.figma.com/design/II23DswXQi3jbtvJJz2k6o/Vora-Supermarket-%E2%80%94-Instagram--post-e-Reel?node-id=0-1&p=f)
- **Planejamento e protótipo.** O briefing no Notion identifica o público e compara Atacadão, Carrefour e Assaí. A tarefa de prototipagem aponta para o Lovable. O protótipo abriu com HTTP 200, apresentou 16 rotas internas e abriu o catálogo. Se a banca exigir especificamente um protótipo de loja no Figma, confirme esse formato. [Briefing](https://app.notion.com/p/3de09d7f657080d8ac7dd21d67a69077) · [Planejamento do protótipo](https://app.notion.com/p/3e609d7f6570802e9f78ed817ceb7e26) · [Protótipo navegável](https://vora-supermarket-front.lovable.app/)
- **Sequência de 15 min.** 2 min de loja e marca, 3 min de requisitos e DER, 3 min de arquitetura, 5 min de demo e 2 min de divisão de tarefas. Na demo, abra o catálogo, use o CEP 01001-000, mostre o frete no endereço, entre no checkout e abra um pedido pago. No painel mostre estoque, situação e a categoria publicada. Reserve o #14 para mostrar o estado Pago registrado.

## Correções, commits e explicação para a banca

| Commit | Falha, mudança e reteste | Como explicar |
| --- | --- | --- |
| `5d3e426` | `server.js` passou a usar `VORA_HOST`, com padrão IPv4 local. `vite.config.js` usa o mesmo endereço no proxy e o README do front acompanha. Antes, a porta IPv4 não respondia com `HOST=localhost.localdomain`. Depois, API e proxy responderam com o catálogo. | “A variável HOST vinha do sistema. Passei a usar uma variável da Vora e alinhei o proxy ao endereço da API.” |
| `4342d12` | Controllers delegam falhas inesperadas a `next(erro)`. `app.js` registra método, rota e código, sem serializar a exceção. O teste injeta um detalhe fictício e verifica 500 genérico e log seguro. | “A mensagem pública é genérica. O servidor conserva o código de diagnóstico sem gravar o conteúdo da exceção.” |
| `af5af4a` | `app.js` trata `URIError` de rota malformada como 400 e a suíte repete o endereço. Antes era 500. | “O endereço entrou com codificação inválida. A API agora responde 400 porque o problema está na requisição.” |
| `ab5b028` | `.gitignore` raiz cobre variáveis secretas, dependências e bancos locais, com exceção nominal do catálogo histórico vazio de dados pessoais. O `git check-ignore` confirmou as regras. | “Os bancos e segredos de cada máquina ficam fora do Git. A base versionada contém apenas o catálogo usado em testes de compatibilidade.” |
| `e00c9c8` | `.env.example` cobre conexão de desenvolvimento e chaves de implantação com campos vazios. O README indica links públicos e os botões reais. Um script comparou os nomes usados pelo código com os exemplos. | “Quem clona tem onde conferir todas as variáveis. As credenciais ficam no ambiente de cada pessoa ou no Render.” |
| `9600ca3` | `Vora.postman_collection.json` agrupa catálogo, cliente, pedidos, pagamento e admin. `API.md` e README apontam para ela. O Newman executou o roteiro completo em base local. | “A coleção reproduz o contrato das rotas. Cada request verifica seu código HTTP e o login alimenta o token das próximas chamadas.” |
| `d54dc07` | `tokenService.js` emite o JWT com ID, papel e prazo comum. Login cliente e admin chamam a função. O teste confirmou os dois papéis e 7.200 segundos. | “As duas contas usam a mesma regra de duração. O servidor continua conferindo o papel antes de abrir cada rota.” |
| `8142296` | `package.json` indica `server.js`, que existe. A resolução anterior retornava `MODULE_NOT_FOUND`, e a nova passou. | “O pacote apontava para um arquivo inexistente. Agora a entrada resolve para o mesmo servidor que o npm inicia.” |

## Decisões para o aluno

- **Banco e preço.** Confirme se o professor aceita SQLite/libSQL no lugar de MySQL/PostgreSQL. O SQLite em arquivo facilita a execução no laboratório e o Turso mantém os registros no Render gratuito. Centavos inteiros guardam o valor exato sem `float`. Cotações futuras que exijam frações de centavo precisariam de outra convenção.
- **Entrega, trocas e cancelamento.** Apresente as faixas por UF como a regra implementada. A equipe precisa justificar a área atendida, a política de troca e a duração de links ou reservas de estoque. O cancelamento atual exige pedido pendente e proteção contra pagamento ativo.
- **Webhook.** A API aceita notificações assinadas quando recebe o segredo da aplicação. A loja de teste usa sincronização no retorno ou por **Atualizar situação**. O Render tem a URL, mas ainda retornou 503 para evento sem assinatura por falta do segredo. Para demonstrar a entrega assinada, configure a chave no painel e use o simulador oficial. [Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/payment-notifications)
- **Versionamento.** As branches da loja pública já estão iguais. Revise `correcoes-professor` antes de decidir se as novas correções devem ir para a publicação. Nenhum push ou merge foi feito nesta auditoria.
- **Relação pedido e pagamento.** O desenho preliminar do Notion usa 1:1. No fluxo entregue, cada pedido pode ter zero ou várias tentativas. Isso preserva pagamentos recusados e permite conferir aprovações múltiplas. Alinhe o modelo apresentado e a narrativa com essa regra antes da banca. [Modelagem preliminar](https://app.notion.com/p/40109d7f657080daa9c6fcb1d55ced51)
- **Materiais.** Valide o compartilhamento do Figma com o professor. Confirme com a equipe onde estão os slides e o vídeo de backup, além da exportação de Reel se for exigida na apresentação.
- **Credencial de teste fora do Git.** Uma página interna do Notion exibe a senha do comprador de teste em texto aberto. Troque essa senha e mantenha o acesso de teste em local apropriado antes de compartilhar a documentação.

## Perguntas orais para ensaiar

1. **Por que centavos?** `0.1 + 0.2` em JavaScript pode resultar em `0.30000000000000004`. Em centavos, `10 + 20` resulta em 30 e o front formata o valor em reais.
2. **Por que SQLite/Turso?** SQLite simplifica o ambiente local e Turso oferece persistência remota com SQL compatível. Valide com o professor a diferença em relação à tecnologia citada no enunciado.
3. **O que é bcrypt?** É um algoritmo de hash de senha com custo configurável. O salt aleatório faz o hash mudar para senhas iguais.
4. **O que tem no JWT?** ID, papel e datas de emissão e validade. A API assina o token e rejeita alterações que invalidem a assinatura.
5. **Por que o preço vem do banco?** O navegador envia IDs e quantidades. A API lê o preço de cada item e recalcula o total e o frete.
6. **Por que 404 no pedido alheio?** A busca usa o ID do pedido e o ID do cliente. O resultado é o mesmo para pedido ausente ou fora da conta do usuário, evitando confirmar a existência de compra alheia.
7. **O que é transação?** É um conjunto de operações que confirma por inteiro. Se a segunda parte falhar, as gravações parciais são revertidas.
8. **Por que o trigger?** A inserção de um item do pedido dispara a baixa no banco. O código valida disponibilidade e grava a compra dentro da mesma transação.
9. **Como funciona o webhook?** O provedor envia um aviso assinado, a API confere a assinatura e consulta a transação. A restrição por ID externo permite receber o mesmo aviso novamente sem duplicar o registro.
10. **O que é CORS?** É a regra que o navegador usa para permitir que uma página leia a resposta de outra origem. A API permite a origem da loja e a autenticação continua sendo verificada nas rotas protegidas.
11. **Por que excluir o .env?** Ele contém segredos de acesso. Em caso de exposição, primeiro revogue ou troque o segredo no serviço, depois trate a cópia versionada.
12. **Qual o caminho de uma requisição?** O router associa método e caminho ao controller. O controller valida, o service aplica a regra, o model executa SQL e o controller devolve o resultado.
13. **Por que o Render pode demorar?** O plano gratuito pode suspender um serviço ocioso. A primeira requisição depois disso aguarda a retomada.
14. **O que mudou entre as branches publicadas?** Na auditoria, `main` e `vercel` apontavam para o mesmo commit. As correções novas foram registradas apenas em `correcoes-professor`.
