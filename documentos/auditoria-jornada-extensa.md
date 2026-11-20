# Auditoria da jornada de compra da Vora

Executada em 18/11/2026.

Em 20/11/2026, a revisão da entrega comparou o esquema local com o Turso e conferiu os documentos do banco. Os resultados abaixo são da jornada original. [Guia do banco](banco-de-dados.md) · [Resultados da revisão](testes.csv)

**Reteste: 66 de 66 passos passaram. Os três testes adicionais também passaram.**

A primeira execução registrou 61 passos aprovados, uma falha de exibição do frete e quatro cenários dependentes do cancelamento pelo cliente. A tabela abaixo registra o reteste após corrigir esses pontos.

A execução usou Chromium via Playwright, a API Express e uma cópia temporária de `documentos/voraSupermarket.sqlite`, com perfis separados para dois clientes, um administrador e um visitante. O ViaCEP e o Mercado Pago foram simulados. O processamento da notificação assinada e as transações de estoque foram executados pela API local.

O lint e o build do front-end passaram. A integração da API passou com SQLite, libSQL em arquivo e o motor oficial do Turso executado em um arquivo isolado.

## Visitante (sem login)

| # | Ação | Esperado | Obtido | Resultado |
|---|---|---|---|---|
| 1 | Abre a **Home** | carrega, só produtos ativos, preços formatados em R$ (centavos → reais certo) | 200 · home com preços em reais e produto inativo excluído | PASSOU |
| 2 | Clica numa **categoria** | só itens da categoria | 200 · vitrine só com frutas; filtro por API também conferido | PASSOU |
| 3 | Digita uma **busca** | resultado coerente; busca sem resultado mostra estado vazio, não tela quebrada | 200 · busca coerente e estado vazio renderizado | PASSOU |
| 4 | Abre a página de um **produto** | nome, preço, estoque corretos. Anotar `estoque_inicial` | 200 · nome e preço na tela; estoque inicial por API | PASSOU |
| 5 | Volta (botão do navegador) para o catálogo | mantém filtro/busca, sem recarregar errado | A URL e a busca Banana foram mantidas | PASSOU |
| 6 | Abre um produto **inexistente** (`/produto/9999`) | página de "não encontrado", não tela branca | Tela 404 da Vora e HTTP 404 na API | PASSOU |
| 7 | Tenta abrir **Checkout** ou **Meus pedidos** sem login | redireciona para login (ou mostra aviso); API devolve 401 | As duas telas redirecionaram; a API devolveu 401 | PASSOU |
| 8 | Tenta acessar `GET /pedidos/1` direto sem token | 401 | 401 sem token | PASSOU |

## Cadastro e login

| # | Ação | Esperado | Obtido | Resultado |
|---|---|---|---|---|
| 9 | Abre **Cadastro**, envia formulário **vazio** | validação mostra erros; API 400 | Validação no formulário e HTTP 400 na API | PASSOU |
| 10 | Cadastra com e-mail inválido e depois senha curta | 400 com mensagem clara | Os dois formatos foram barrados na tela e com HTTP 400 | PASSOU |
| 11 | Cadastra **cliente A** corretamente | 201; resposta sem senha/hash | 201 · cadastro e login na tela; resposta sem senha | PASSOU |
| 12 | Tenta cadastrar o **mesmo e-mail** de novo | 409/400, mensagem amigável | 409 · mensagem de e-mail já cadastrado | PASSOU |
| 13 | Login com **senha errada** | 401 | 401 · senha incorreta | PASSOU |
| 14 | Login com **e-mail inexistente** | 401 com mesma mensagem do passo 13 | 401 · mesma mensagem do passo anterior | PASSOU |
| 15 | Login correto do **cliente A** | token guardado (`TOKEN_A`); header/menu mostra usuário logado | 200 · painel Minha conta e sessão de cliente | PASSOU |
| 16 | **Recarrega a página (F5)** | continua logado (se o front guarda o token) | Sessão preservada após F5 | PASSOU |
| 17 | Cadastra e loga o **cliente B** em outra sessão | `TOKEN_B` | 201 · cliente B autenticado em outro navegador isolado | PASSOU |

## Primeira compra (caminho feliz)

| # | Ação | Esperado | Obtido | Resultado |
|---|---|---|---|---|
| 18 | Adiciona **produto X (qtd 2)** ao carrinho | contador do carrinho = 2 | Contador passou para 2 | PASSOU |
| 19 | Adiciona **produto Y (qtd 1)** | subtotal = X×2 + Y | Contador 3 · subtotal R$ 22,97 | PASSOU |
| 20 | Vai ao **Carrinho** | itens, quantidades e subtotal corretos | Itens X×2 e Y×1 · subtotal R$ 22,97 | PASSOU |
| 21 | **Aumenta** a quantidade de X para 3 e **remove** Y | subtotal recalcula; Y some | Y removido · X×3 · subtotal R$ 17,97 | PASSOU |
| 22 | Adiciona Y de volta (qtd 1) |  | Y novamente no carrinho · 4 itens · subtotal R$ 28,96 | PASSOU |
| 23 | Vai ao **Checkout** | resumo igual ao carrinho | Resumo do endereço coincide com o subtotal do carrinho | PASSOU |
| 24 | Digita **CEP inválido** (`abc`) | erro amigável | Erro claro na tela · HTTP 400 na API de CEP | PASSOU |
| 25 | Digita **CEP válido** `06700-000` | endereço preenchido, frete e prazo calculados | 200 · endereço preenchido, frete de R$ 15,00 e prazo de 3 dias úteis na etapa Endereço | PASSOU |
| 26 | Confirma o pedido | 201; situação "Pendente"; **total = (X×3 + Y×1) + frete do CEP**; anotar `ID_PEDIDO_1` | 201 · pedido #1 Pendente · total R$ 43,96 | PASSOU |
| 27 | Consulta estoque de X e Y | X = inicial − 3; Y = inicial − 1 (baixou uma vez só) | Estoque diminuiu 3 unidades de X e 1 de Y | PASSOU |
| 28 | Vai a **Meus pedidos** | pedido 1 aparece "Pendente" (se a rota de listar existir; senão NÃO IMPLEMENTADO) | Pedido encontrado como Pendente no histórico | PASSOU |
| 29 | Abre o **Detalhe do pedido 1** | itens, frete, prazo, total batem com o passo 26 | 200 · itens, frete, prazo e total iguais ao pedido | PASSOU |
| 30 | Clica em **Pagar** | link do Mercado Pago gerado. **PARE AQUI. Não pague.** | 200 · preferência e link gerados pelo SDK simulado; nenhuma cobrança | PASSOU |
| 31 | Volta do Mercado Pago sem pagar (botão voltar / URL de falha) | pedido continua "Pendente", sem pagamento aprovado registrado | Voltou do checkout simulado; pedido ainda Pendente, sem aprovação | PASSOU |
| 32 | Clica em **Pagar** de novo | funciona (novo link ou o mesmo), sem 500, sem duplicar pedido | 200 · mesma preferência; nenhum pedido extra | PASSOU |

## Desistência e cancelamento

| # | Ação | Esperado | Obtido | Resultado |
|---|---|---|---|---|
| 33 | Cria **pedido 2** (1 unidade de Z) e anota estoque de Z antes e depois | Z = inicial − 1 | 201 · pedido #2 criado, estoque de Z baixou 1 | PASSOU |
| 34 | Clica em **Cancelar pedido 2** | 200; situação "Cancelado". Se não existir: **NÃO IMPLEMENTADO** (registrar como lacuna) | 200 · cliente confirmou na tela e recebeu a situação Cancelado | PASSOU |
| 35 | Consulta estoque de Z | **voltou ao inicial** (estoque devolvido). Se não voltou: ✘ falha de regra | Saldo de Z retornou ao valor anterior ao cancelar pelo site | PASSOU |
| 36 | Abre detalhe do pedido 2 | mostra "Cancelado" | 200 · Cancelado no detalhe do cliente | PASSOU |
| 37 | Tenta **cancelar de novo** o pedido 2 | recusa (400/409), não devolve estoque duas vezes | 409 na repetição do cliente e do admin, estoque devolvido uma única vez | PASSOU |
| 38 | Tenta **pagar** o pedido 2 cancelado | recusa; não gera link | 409 no pagamento; sem botão nem preferência nova | PASSOU |
| 39 | Tenta **cancelar um pedido já Pago** (usar pedido aprovado existente, ex.: pedido 14 no ambiente de produção, ou o que o Codex achar no banco local) | comportamento definido (recusa ou estorno). **Registrar**; nunca deixar cancelar "Enviado/Entregue" | 409 para dono e admin; pedido seguiu Pago, aprovado pelo webhook simulado e assinado | PASSOU |
| 40 | Cliente B tenta **cancelar o pedido 1 do A** | 404 (não pode nem saber que existe) e pedido 1 continua "Pendente" | 404 para o cliente B, 401 na rota administrativa, pedido de A seguiu Pendente | PASSOU |

## Cliente B tenta mexer no que não é dele

| # | Ação | Esperado | Obtido | Resultado |
|---|---|---|---|---|
| 41 | B abre `GET /pedidos/<ID_PEDIDO_1>` | **404** | 404 para B | PASSOU |
| 42 | B tenta `POST /pedidos/<ID_PEDIDO_1>/pagamento` | 404/403, nenhum link gerado | 404 · nenhuma preferência criada | PASSOU |
| 43 | B cria pedido com `id_cliente` de A no corpo | pedido sai no nome de B | 201 · pedido pertence a B, conforme o token | PASSOU |
| 44 | B edita a URL do front para `/pedido/<ID_PEDIDO_1>` | tela de "não encontrado", sem dados de A | Tela de pedido não encontrado, sem detalhes de A | PASSOU |

## Compras que dão errado

| # | Ação | Esperado | Obtido | Resultado |
|---|---|---|---|---|
| 45 | A pede quantidade **maior que o estoque** | 409; mensagem clara na tela; nada baixou | 409 com mensagem no checkout; sem pedido e sem baixar estoque | PASSOU |
| 46 | A pede 1 item válido + 1 sem estoque | 409; **nenhum** item baixou (transação) | 409 · os dois estoques e a contagem permaneceram iguais | PASSOU |
| 47 | A pede quantidade 0, -1, 1.5, "abc" | 400 em todos; estoque nunca aumenta | 400 nas quatro entradas; saldo e contagem intactos | PASSOU |
| 48 | A tenta enviar `valor_unitario`/`valor_total`/`valor_frete` falsos | ignorados; total vem do banco | 201 válido · valores enviados ignorados; total R$ 20,99 | PASSOU |
| 49 | A pede o **estoque exato** restante de um produto, depois mais 1 | 201 (estoque 0); depois 409 | 201 · estoque zero; compra adicional 409 | PASSOU |
| 50 | Produto sai de estoque: abrir a página dele depois do passo 49 | mostra indisponível; botão de comprar desabilitado (se front existir) | Esgotado visível e botão desabilitado | PASSOU |
| 51 | **Duplo clique** em "Confirmar pedido" (2 requisições quase simultâneas) | vira **1 pedido** (ou 2 conscientes), estoque coerente. Registrar: é um clássico de bug | Duplo clique gerou um pedido. Duas chamadas simultâneas com a mesma chave retornaram o mesmo ID. | PASSOU |
| 52 | Token expira no meio do checkout (usar token de 1 s) | 401; front manda para login sem perder a tela quebrada | 401 real por JWT de 1 s expirado; voltou ao pagamento após login com carrinho intacto | PASSOU |
| 53 | Servidor offline/lento (parar o servidor e clicar) | mensagem de erro amigável, não tela branca | Conexão interrompida no navegador · aviso de API indisponível, carrinho permaneceu visível | PASSOU |

## Navegação e estado

| # | Ação | Esperado | Obtido | Resultado |
|---|---|---|---|---|
| 54 | Percorrer: Home → Catálogo → Produto → Carrinho → Checkout → Pedidos → Detalhe → Home, usando **menu** | sem página branca, sem erro no console | Oito telas percorridas por links da loja; sem tela branca ou exceção de JavaScript | PASSOU |
| 55 | Mesma rota usando **botão voltar/avançar** do navegador | estado coerente (carrinho não duplica itens) | Voltar e avançar restauraram as páginas e mantiveram o mesmo contador | PASSOU |
| 56 | Abrir cada URL **diretamente** (colar na barra) e dar F5 | nenhuma página dá 404 do servidor (problema comum de SPA em hospedagem) | 12 rotas abertas diretamente e recarregadas com HTTP 200 no ambiente local | PASSOU |
| 57 | Fazer **logout** e apertar voltar | não mostra Pedidos/Checkout com dados do cliente | Sair e voltar duas vezes no navegador manteve o login visível; API sem token retornou 401 | PASSOU |
| 58 | Logar de novo como A | carrinho e pedidos de A continuam lá (se o carrinho for persistido) | Após novo login, contador do carrinho e pedido A preservados | PASSOU |
| 59 | Abrir o site em **tela de celular** (viewport 375 px) e repetir passos 1, 20, 23, 29 | sem layout quebrado, botões clicáveis | 375 px · home, carrinho, checkout e pedido com botões utilizáveis e sem rolagem horizontal | PASSOU |
| 60 | Verificar **console do navegador** e aba de rede durante toda a jornada | nenhum erro 500, nenhuma chamada vazando token/senha em URL | 120 respostas de API observadas; 0 respostas 5xx, 0 exceções JS e 0 credenciais nas URLs | PASSOU |

## Fechamento (somente leitura no banco de teste)

| # | Ação | Esperado | Obtido | Resultado |
|---|---|---|---|---|
| 61 | Nenhum produto com estoque negativo | 0 linhas | SQLite · zero produtos com estoque negativo | PASSOU |
| 62 | Para cada produto usado: estoque_final = estoque_inicial − Σ(pedidos não cancelados) | bate | 33 produtos reconciliados com as quantidades dos pedidos não cancelados | PASSOU |
| 63 | Todo pedido: total = Σ(qtd × valor_unitario) + frete | sem divergência | Todos os pedidos têm itens; soma em centavos mais frete confere | PASSOU |
| 64 | Pedidos que falharam (45–48) não deixaram registro | Nenhum pedido gravado para requisições recusadas | 8 pedidos gravados, todos com HTTP 201. O passo 48 gravou somente a compra recalculada válida | PASSOU |
| 65 | Pedidos cancelados não têm pagamento aprovado | Zero pagamentos aprovados para pedidos cancelados | Zero pagamentos aprovados em pedidos cancelados | PASSOU |
| 66 | Nenhuma senha em texto puro na tabela de clientes | hash bcrypt (`$2`) | 2 clientes com senhas gravadas em bcrypt | PASSOU |

## Correções solicitadas

| # | Ação | Esperado | Obtido | Resultado |
|---|---|---|---|---|
| R1 | Abrir a lista de produtos no painel em três larguras | Rápido e Ficha cabem e abrem a edição | Rápido e Ficha inteiros em 1105, 925 e 375 px; modal e ficha abriram no celular | PASSOU |
| R2 | Criar categoria no painel e abrir a vitrine em outra sessão | Visitante encontra a categoria ativa mesmo vazia | Categoria criada no painel retornou 201 e apareceu vazia na vitrine de visitante independente; categoria-pai incluiu os produtos das subcategorias | PASSOU |
| R3 | Voltar do checkout e usar Atualizar situação | Pedido Pago após consultar o Mercado Pago | Retorno do checkout e botão Atualizar situação confirmaram pagamentos independentes sem webhook | PASSOU |

## Diagnóstico e correções

- **Erro interno ao atualizar pagamento.** Os logs do Render apontaram `SQL_INPUT_ERROR` em `back-end/src/models/pagamentoModel.js`. O motor Turso rejeitava uma subconsulta escalar dentro do `ON CONFLICT`. Reproduzi o erro no motor do Turso isolado. A correção usa o ID da situação como parâmetro e mantém o registro e a promoção do pedido para Pago na mesma transação. O webhook e a atualização manual usam essa lógica.
- **Pedido 17.** A leitura do Turso encontrou um pedido pendente sem pagamentos gravados. O Mercado Pago retornou três pagamentos distintos aprovados pela conta de vendedor de teste, com valores e moeda compatíveis. A preferência original não tinha URL de webhook. A auditoria preservou os registros do pedido. O painel já sinaliza múltiplas aprovações quando elas são importadas.
- **Passo 25, frete na etapa Endereço.** O resumo passou a usar a cotação do próprio formulário e apresenta valor, prazo e total assim que o CEP é aceito. A API recalcula o valor definitivo na criação do pedido.
- **Passos 34, 37, 39 e 40, cancelamento.** O cliente pode confirmar o cancelamento do próprio pedido pendente. O estoque volta na mesma transação. Uma repetição retorna 409, pedido alheio retorna 404 e pedido pago é protegido. O admin usa a mesma regra.
- **Reabertura do checkout.** A API consulta o Mercado Pago antes de devolver uma preferência já existente. Quando encontra pagamento aprovado ou em processamento, responde 409 e o front atualiza a situação do pedido.

## Regras e limites

- Um checkout ativo ou um pagamento em processamento impede o cancelamento. Preferências antigas sem vencimento precisam ser encerradas no provedor antes que o pedido possa ser cancelado.
- O passo 48 registrou uma compra válida com os valores recalculados pelo servidor. O passo 64 confirmou que requisições rejeitadas não deixaram pedidos.
- A jornada usou aprovação e webhook assinados de teste. Nenhum pagamento ou estorno foi enviado durante a auditoria.

## Publicação

O Render e o Vercel receberam a correção. A API pública respondeu 200 em `/health` e 401 na nova rota de cancelamento sem token. O diagnóstico do webhook na nuvem encontrou ausência de `MP_WEBHOOK_SECRET`. A URL pública foi configurada no Render. A entrega assinada segue pendente da chave emitida pelo Mercado Pago. Para a apresentação, pagamentos de teste podem ser conciliados no retorno à loja ou no botão Atualizar situação. O provedor orienta usar o simulador do painel para testar o webhook. [Documentação do Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/payment-notifications)
