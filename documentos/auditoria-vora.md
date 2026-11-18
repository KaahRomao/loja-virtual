# Auditoria da Vora Supermarket

Auditoria de 18/11/2026. A mesma matriz passou em **113 cenários no SQLite local e 113 cenários no libSQL em arquivo**. A matriz executou a API Express por HTTP com contas sintéticas, frete controlado e respostas simuladas do SDK do Mercado Pago. O navegador usou uma base SQLite separada em 360 px. Nessa rodada, a consulta real de CEP retornou o endereço e o teste encerrou após registrar o pedido.

## Estado do projeto

| Área | Estado e evidência |
| --- | --- |
| Identidade e interface (etapas 02 e 08) | Cabeçalho e logo compartilhados, banner com ofertas, categoria Congelados com tela 404 e galeria por produto. Figma atualizado e manual de marca ficaram sem verificação. |
| Requisitos, dados e API (etapas 03, 05 e 06) | CRUD administrativo, login único por papel, pedidos por cliente e estoque transacional validados. Cópia do SQLite legado preservou 32 registros e exibiu 16 fichas. O modelo e o dicionário existentes podem ser conferidos junto dos scripts SQL atuais. |
| Integrações e testes (etapas 07 e 09) | Frete, total, confirmação, autorização e idempotência validados. Aprovação, recusa, repetição e webhook do Mercado Pago foram simulados nesta auditoria. A compra externa com cartão de teste aprovada anteriormente foi em ambiente local. |
| Git e documentação (etapas 10 e 11) | O repositório tem histórico, README, exemplos da API, requisitos, DER, manual e registros de testes. Briefing, link do protótipo, manual de marca e participação da equipe precisam ser conferidos com a equipe. |
| Apresentação (etapa 12) | O manual contém um roteiro de demonstração. A compra de teste pelo domínio público, o ensaio e o vídeo de reserva ainda precisam ser confirmados. |

## Resultados por fluxo

| Fluxo | Resultado |
| --- | --- |
| F-C1 · compra | Produto ativo, CEP, cadastro, login, pedido com preço da oferta, baixa de estoque e geração de link simulada passaram. |
| F-C2 · isolamento | Cliente B recebe 404 para pedido e checkout de A. O ID de cliente recebido no corpo é ignorado. |
| F-C3 · sessão | JWT de duas horas. Credencial incorreta, ausência de token, token expirado e assinatura inválida foram recusados. |
| F-C4 · estoque e total | Estoque exato, insuficiente, nulo, quantidade inválida, rollback e preço do banco passaram. |
| F-C5 · Mercado Pago | A mesma preferência foi reaproveitada. Recusa manteve o pedido pendente. Aprovação simulada com valor correto foi registrada uma vez. Valor divergente impediu aprovação. |
| F-C6 · robustez | JSON inválido deu 400. Origem da Vercel permitida. Rotas inexistentes deram 404. |
| A-0 a A-4 · administração | Login comum devolve papel admin. Criação, edição e inativação de produto, consulta de pedidos, envio, entrega e cancelamento passaram. O histórico mantém o preço da compra e cancelar devolve estoque uma vez. |
| A-5 · isolamento do admin | As 11 rotas de gestão devolveram 401 tanto para visitante quanto para cliente. Papel enviado no cadastro e adulteração de assinatura foram recusados ou ignorados conforme o caso. |
| Navegador em 360 px | Carrossel alternou sozinho e pôde ser pausado. 404 exibiu a logo. Favorito sobreviveu ao recarregamento. Cliente viu 403 ao abrir o painel. Duplo clique gerou um pedido, listado no histórico do cliente e no painel. |

## Catálogo e pedidos repetidos

- A imagem relatada mostrava dois cartões de água. A auditoria encontrou 32 registros públicos com 16 nomes antes da mudança. Em cópia do banco legado, a nova listagem agrupou 16 pares e preservou os IDs antigos. Os agrupamentos usam nome, descrição, categoria, unidade e imagem. Nenhum registro é apagado pela listagem.
- Aplicação inicial das ofertas gravada no banco em uma única migração. Banana de R$ 6,99 por R$ 5,99, arroz de R$ 27,90 por R$ 24,90 e leite de R$ 5,49 por R$ 4,99, quando os registros ainda têm o preço original e nenhum preço anterior. O mesmo valor vai ao catálogo, ao pedido e ao checkout. Uma edição posterior pelo admin sobrevive ao reinício.
- Reenvios com a mesma chave devolvem o mesmo pedido e baixam estoque uma vez. Pedidos novos com chaves diferentes continuam permitidos. Solicitações antigas sem chave continuam aceitas pela API. A auditoria não consultou pedidos privados no Turso de produção e não conclui se há pedidos históricos repetidos.

## Comportamentos verificados

- Categoria numérica inexistente retorna 200 com lista vazia. Identificador textual inválido retorna 400.
- E-mail em maiúsculas funciona no login. A API combina linhas do mesmo produto e rejeita quantidades textuais. CEP com e sem hífen é aceito.
- Situação fora dos valores aceitos retorna 400. Transição de negócio inválida entre situações reconhecidas retorna 409.
- O webhook vazio é ignorado com 200. Uma consulta válida a uma transação inexistente no provedor simulado retorna 502 e mantém o pedido intacto.
- A tela 404 de Congelados é renderizada pelo React Router. A URL pode ser servida com HTTP 200 pela regra de SPA da Vercel. A API retorna HTTP 404 para recursos inexistentes.

## Matriz de execução

| ID | Cenário | Esperado | Recebido | Resultado nos dois drivers |
| --- | --- | --- | --- | --- |
| T-00 | API responde | 200 | 200 | Passou |
| T-01 | Rota temporária ausente | 404 | 404 | Passou |
| T-10 | Listar catálogo | 200 · 16 produtos | 200 · 16 produtos | Passou |
| T-11 | Categoria existente | 200 · apenas da categoria | 200 | Passou |
| T-12 | Categoria ausente e categoria inválida | 200 vazio para ID inexistente · 400 para texto | 200 vazio · 400 texto | Passou |
| T-13 | Busca por nome | 200 · somente Banana | 200 | Passou |
| T-14 | Busca sem resultados | 200 · vazio | 200 | Passou |
| T-15 | Categoria e busca combinadas | 200 · resultado filtrado | 200 | Passou |
| T-16 | Detalhe e preço em centavos | 200 · preço inteiro | 200 | Passou |
| T-17 | Detalhe do produto 9999 | 404 | 404 | Passou |
| T-18 | Detalhe do produto abc | 400 | 400 | Passou |
| T-19 | Detalhe do produto -1 | 400 | 400 | Passou |
| T-19b | Detalhe do produto 0 | 400 | 400 | Passou |
| T-20 | Detalhe do produto 17 | 404 | 404 | Passou |
| T-21 | Listagem omite inativo | 200 · item inativo ausente | 200 | Passou |
| T-22 | Termo com pontuação SQL tratado como texto | 200 · resultado vazio | 200 | Passou |
| T-30 | Cadastrar cliente | 201 · sem senha | 201 | Passou |
| T-31 | E-mail repetido com caixa diferente | 409 | 409 | Passou |
| T-32 | Cadastro inválido | 400 | 400 | Passou |
| T-33 | Cadastro inválido | 400 | 400 | Passou |
| T-34 | Cadastro inválido | 400 | 400 | Passou |
| T-35 | Cadastro inválido | 400 | 400 | Passou |
| T-36 | Cadastro inválido | 400 | 400 | Passou |
| T-37 | Persistência de senha bcrypt | Hash bcrypt | Hash bcrypt | Passou |
| T-38 | JSON malformado | 400 | 400 | Passou |
| T-40 | Login de cliente pelo formulário comum | 200 · cliente | 200 · cliente | Passou |
| T-41 | JWT de cliente sem senha | ID e tipo | Conferido no SQLite | Passou |
| T-42 | Duração do JWT | 7200 segundos | 7200 segundos | Passou |
| T-43 | Senha errada | 401 | 401 | Passou |
| T-44 | Login inexistente com erro genérico | 401 · mesma mensagem | 401 | Passou |
| T-45 | Login sem campos obrigatórios | 400 | 400 | Passou |
| T-46 | Login sem campos obrigatórios | 400 | 400 | Passou |
| T-47 | Login sem campos obrigatórios | 400 | 400 | Passou |
| T-48 | Login com e-mail maiúsculo | 200 | 200 | Passou |
| T-49 | Cadastro e login de segundo cliente | 201 e 200 | 201 e 200 | Passou |
| T-50 | Pedido sem autenticação | 401 | 401 | Passou |
| T-51 | Token inválido | 401 | 401 | Passou |
| T-52 | Token sem Bearer | 401 | 401 | Passou |
| T-53 | Assinatura adulterada | 401 | 401 | Passou |
| T-54 | Token assinado por terceiro | 401 | 401 | Passou |
| T-55 | Token expirado | 401 | 401 | Passou |
| T-56 | Detalhe sem token | 401 | 401 | Passou |
| T-60 | Criar pedido com frete de São Paulo | 201 · total calculado | 201 | Passou |
| T-61 | Baixa de estoque única | −2 unidades | −2 unidades | Passou |
| T-62 | Pedido com itens diferentes | 201 · 2 itens | 201 | Passou |
| T-63 | Duas linhas do mesmo item | 201 · soma quantidades | 201 | Passou |
| T-64 | Preço enviado no item ignorado | 201 · valor do banco | 201 | Passou |
| T-65 | Total e frete enviados ignorados | 201 · 1500 de frete | 201 | Passou |
| T-66 | Validação de itens, endereço ou CEP | 400 | 400 | Passou |
| T-67 | Validação de itens, endereço ou CEP | 409 | 409 | Passou |
| T-68 | Validação de itens, endereço ou CEP | 400 | 400 | Passou |
| T-69 | Validação de itens, endereço ou CEP | 400 | 400 | Passou |
| T-70 | Validação de itens, endereço ou CEP | 400 | 400 | Passou |
| T-71 | Validação de itens, endereço ou CEP | 400 | 400 | Passou |
| T-72 | Validação de itens, endereço ou CEP | 400 | 400 | Passou |
| T-73 | Validação de itens, endereço ou CEP | 400 | 400 | Passou |
| T-74 | Validação de itens, endereço ou CEP | 400 | 400 | Passou |
| T-75 | Validação de itens, endereço ou CEP | 400 | 400 | Passou |
| T-76 | Validação de itens, endereço ou CEP | 400 | 400 | Passou |
| T-77 | Validação de itens, endereço ou CEP | 400 | 400 | Passou |
| T-78 | Validação de itens, endereço ou CEP | 201 | 201 | Passou |
| T-79 | Validação de itens, endereço ou CEP | 400 | 400 | Passou |
| T-80 | Validação de itens, endereço ou CEP | 400 | 400 | Passou |
| T-81 | Pedido parcialmente inválido | 409 · sem pedido e sem baixa | 409 · estoque e contagem intactos | Passou |
| T-82 | Estoque exato | 201 · estoque zero | 201 · estoque zero | Passou |
| T-83 | Comprar após esgotar | 409 | 409 | Passou |
| T-84 | ID de cliente enviado não muda dono | 201 · dono é o token | 201 · dono é o token | Passou |
| T-90 | Detalhe para o dono | 200 · campos completos | 200 | Passou |
| T-91 | Total persistido | Soma dos itens mais frete | 200 | Passou |
| T-92 | Consulta de pedido inválida ou alheia | 404 | 404 | Passou |
| T-93 | Consulta de pedido inválida ou alheia | 404 | 404 | Passou |
| T-94 | Consulta de pedido inválida ou alheia | 400 | 400 | Passou |
| T-95 | Consulta de pedido inválida ou alheia | 400 | 400 | Passou |
| T-95b | Consulta de pedido inválida ou alheia | 400 | 400 | Passou |
| T-96 | Consulta de pedido inválida ou alheia | 400 | 400 | Passou |
| T-97 | Consulta de pedido inválida ou alheia | 400 | 400 | Passou |
| T-100 | Estoque negativo | 0 linhas | Conferido no SQLite | Passou |
| T-101 | Pedidos sem itens | 0 linhas | Conferido no SQLite | Passou |
| T-102 | Totais divergentes | 0 linhas | Conferido no SQLite | Passou |
| T-103 | Contagem final da série | Apenas pedidos aprovados pela API | Conferido no SQLite | Passou |
| T-104 | Novos pedidos começam pendentes | Todos pendentes | 200 | Passou |
| X-01 | Mesmo produto duplicado no banco, com estoque divergente | Uma ficha e ID antigo preservado | Uma ficha e ID antigo acessível | Passou |
| X-02 | Dois envios simultâneos do mesmo checkout | Mesmo ID e uma baixa | 201/201 mesmo ID · 409 com dados diferentes | Passou |
| X-03 | Soma de quantidades fora do limite seguro | 400 | 400 | Passou |
| X-04 | Consulta de CEP e CORS público | 200 · SP · CORS correto | 200 · SP · CORS correto | Passou |
| X-05 | Pagamento de outro cliente | 404 | 404 | Passou |
| X-06 | Pagamento sem token | 401 | 401 | Passou |
| X-07 | Pedido inexistente no pagamento | 404 | 404 | Passou |
| X-08 | Rota desconhecida em JSON | 404 | 404 | Passou |
| X-09 | Preferência de pagamento reaproveitada | 200 · 1 chamada ao SDK simulado | 200 · mesma preferência | Passou |
| X-10 | Cartão recusado simulado | 200 · pedido ainda Pendente | 200 · Pendente / Recusado | Passou |
| X-11 | Pagamento com valor divergente | Sem aprovar pedido | 200 · pedido continua Pendente | Passou |
| X-12 | Aprovação, repetição e nova tentativa de pagar | Pago · uma aprovação · 409 na nova tentativa | Pago · 1 aprovação · 409 | Passou |
| X-13 | Webhook vazio | 200 | 200 | Passou |
| X-14 | Webhook assinado com transação inexistente | 502 | 502 | Passou |
| X-15 | Webhook sem assinatura | 401 | 401 | Passou |
| X-16 | Histórico do cliente sem duplicação e sem pedidos alheios | 200 · IDs únicos e do cliente | 200 | Passou |
| X-17 | JSON malformado na compra | 400 | 400 | Passou |
| A-0 | Rotas, middleware e tabela administrador | Presentes | Presentes | Passou |
| A-1 | Login único reconhece admin e separa token de cliente | 200 admin · 401 em rota cliente | 200 admin · 401 rota cliente | Passou |
| A-2.1 | Criar produto e categoria | 201 · produto no catálogo | 201 · produto ativo e comprado | Passou |
| A-2.2 | Editar preço e estoque | 200 · valores atualizados | 200 | Passou |
| A-2.3 | Inativar e reativar sem perder pedido antigo | 200/404/200 · histórico acessível | 200/404/200 · histórico acessível | Passou |
| A-2.4 | Dados de produto inválidos | 400 para preço, nome e categoria | 400 nas três situações | Passou |
| A-3.1 | Admin vê pedidos dos dois clientes | 200 · dois clientes | 200 | Passou |
| A-3.2 | Pago, Enviado e Entregue | 200 nas transições · visível ao cliente | 200/200 · Pendente 400 · retrocesso para Enviado 409 | Passou |
| A-3.3 | Cancelar devolve estoque uma vez | 200 · estoque devolvido · 409 repetição | 200 · 1 devolução · 409 repetição | Passou |
| A-4 | Preço histórico e integridade final | Preço original · SQLite íntegro | 200 | Passou |
| A-5.1 | Rotas administrativas sem autorização | 401 para visitante e cliente | 22 respostas 401 | Passou |
| A-5.2 | Papel do JWT alterado sem nova assinatura | 401 | 401 | Passou |
| A-5.3 | Cliente não pode mudar situação para Pago | 401 | 401 | Passou |
| X-18 | Cadastro recusa e-mail reservado para admin | 409 | 409 | Passou |
| X-19 | Login com senha além do limite bcrypt | 400 | 400 | Passou |
