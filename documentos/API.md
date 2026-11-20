# API do Vora Supermarket

Use `http://127.0.0.1:3000` no ambiente local e `https://vora-supermarket.onrender.com` para a API publicada. Envie `Content-Type: application/json` em requisições com corpo e `Authorization: Bearer <token>` nas rotas protegidas. Os exemplos mostram os campos principais. Valores monetários são inteiros em centavos. O esquema SQLite novo usa horário UTC. Alguns padrões de data legados do Turso usam `localtime`, e a API grava as datas de pagamento em UTC explicitamente. [Saúde da API publicada](https://vora-supermarket.onrender.com/health) · [Guia do banco](banco-de-dados.md)

A coleção Postman tem 37 requisições para a API local. Use uma base descartável, preencha as variáveis de teste e crie o admin local conforme o README. Os logins salvam os JWTs na sessão da coleção. Compartilhe a coleção sem copiar valores locais de senhas ou JWTs. [Coleção Postman](Vora.postman_collection.json) · [Instalação local](../README.md#rodar-localmente)

## Loja

| Método e rota | Envio | Exemplo de resposta |
| --- | --- | --- |
| GET `/` | Sem corpo | 200 · `{"mensagem":"API da VORA no ar"}` |
| GET `/health` | Sem corpo | 200 · `{"status":"ok"}` se o SQLite estiver legível, ou 503 |
| GET `/produtos?categoria=1&busca=Banana` | Ambos os filtros são opcionais | 200 · `[{"id":1,"nome_produto":"Banana Prata 1kg","preco":599,"preco_anterior":699,"estoque":80,"ids_equivalentes":[]}]` |
| GET `/produtos/1` | ID na rota | 200 · `{"id":1,"nome_produto":"Banana Prata 1kg","preco":599,"preco_anterior":699}` |
| GET `/categorias` | Sem token | 200 · categorias ativas, inclusive as que ainda não têm produtos |
| POST `/clientes` | `{"nome_cliente":"Cliente Teste","email":"cliente@example.com","senha":"senha-de-exemplo"}`. `telefone` é opcional. | 201 · `{"id":1,"nome_cliente":"Cliente Teste","email":"cliente@example.com"}` |
| POST `/login` | E-mail e senha da conta | 200 · `{"token":"<JWT>","role":"cliente","cliente":{"id":1,"nome_cliente":"Cliente Teste"}}` ou `{"token":"<JWT>","role":"admin","admin":{"id":1,"nome":"Admin Vora"}}` |
| GET `/cep/01001000` | CEP na rota | 200 · `{"cep":"01001-000","logradouro":"Praça da Sé","bairro":"Sé","cidade":"São Paulo","uf":"SP","valor_frete":1500,"prazo_entrega":3}` |
| POST `/pedidos` | Token de cliente e corpo do exemplo abaixo | 201 · `{"id":1,"situacao":"Pendente","valor_total":2099,"itens":[{"id_produto":1,"quantidade":1,"valor_unitario":599}]}` |
| GET `/pedidos` | Token de cliente | 200 · `[{"id":1,"situacao":"Pendente","valor_total":2099,"data_criado":"2026-11-18 12:00:00"}]` |
| GET `/pedidos/1` | Token do dono | 200 · `{"id":1,"situacao":"Pago","valor_total":2099,"pagamentos":[{"id_transacao_externa":"123456","situacao":"Aprovado"}]}` |
| POST `/pedidos/1/pagamento` | Token do dono do pedido pendente | 200 · `{"id":"<preferência>","link":"<url checkout>","retorno_configurado":false}`. Retorna 409 se já houver pagamento aprovado ou em processamento. |
| POST `/pedidos/1/cancelar` | Token do dono do pedido pendente | 200 · `{"id":1,"situacao":"Cancelado"}`. Devolve o estoque. Retorna 404 para pedido alheio e 409 se houver link ainda ativo, pagamento em curso ou situação incompatível. |
| POST `/pagamentos/sincronizar` | Token do dono. Informe `{"pedido_id":1}` para buscar pela referência, `{"payment_id":"123456"}` para consultar uma transação ou envie os dois para restringir ao pedido. | 200 · `{"processado":true}` quando um registro muda, ou `{"processado":false}` quando a consulta não altera os dados. |
| POST `/pagamentos/webhook?data.id=123456` | Evento `{"type":"payment","data":{"id":"123456"}}` com `x-signature` e `x-request-id`. O ID assinado vem da query. | 200 · evento recebido. Retorna 401 para assinatura ausente ou inválida e 503 quando falta o segredo do webhook no servidor. |

```json
{
  "itens": [{"id_produto": 1, "quantidade": 1}],
  "endereco_entrega": "Praça da Sé, 100, São Paulo/SP",
  "cep_entrega": "01001-000",
  "chave_checkout": "f5c0ffb0-3f65-4e70-8c94-93faecd6bdac"
}
```

Reenvie a mesma `chave_checkout` quando repetir o envio após falha de conexão. A API mantém o mesmo ID e responde 201. Usar a mesma chave com itens ou endereço diferentes retorna 409. Gere uma nova chave para um novo pedido.

A listagem do catálogo apresenta uma ficha para registros equivalentes. O campo `ids_equivalentes` contém os IDs anteriores que podem estar em carrinhos ou favoritos. O histórico mantém o ID e o valor unitário gravados na compra.

## Administração

O formulário da loja usa `POST /login` para clientes e administradores. As rotas de gestão exigem token com papel administrativo. O login específico permanece disponível para clientes de API anteriores. Os JWTs dos dois papéis expiram em duas horas. O token ausente, expirado, inválido ou de outro papel recebe 401 nas rotas protegidas. Um cliente que consulta pedido alheio recebe 404.

| Método e rota | Envio | Exemplo de resposta |
| --- | --- | --- |
| POST `/admin/login` | `{"email":"admin@vora.test","senha":"senha-de-exemplo"}` | 200 · `{"token":"<JWT>","role":"admin","admin":{"id":1,"nome":"Admin Vora"}}` |
| GET `/admin/resumo` | Sem corpo | 200 · `[{"situacao":"Pago","quantidade":1,"total":2099}]` |
| GET `/admin/produtos` | Sem corpo | 200 · `[{"id":1,"nome_produto":"Banana Prata 1kg","situacao":"Ativo"}]` |
| GET `/admin/produtos/1` | ID na rota | 200 · `{"id":1,"nome_produto":"Banana Prata 1kg","situacao":"Ativo"}` |
| POST `/admin/produtos` | `{"nome_produto":"Produto teste","descricao":"Produto do catálogo","preco":599,"estoque":10,"id_categoria":1}` | 201 · `{"id":17,"nome_produto":"Produto teste","preco":599}` |
| PUT `/admin/produtos/17` | Objeto parcial, por exemplo `{"preco":549,"preco_anterior":599,"estoque":12}` | 200 · `{"id":17,"preco":549,"preco_anterior":599,"estoque":12}` |
| DELETE `/admin/produtos/17` | ID na rota | 200 · `{"ids":[17]}`. Inativa a ficha e seus produtos equivalentes sem apagar o histórico. Para restaurar um registro, use PUT com `{"situacao":"Ativo"}`. |
| GET `/admin/categorias` | Sem corpo | 200 · `[{"id":1,"nome_categoria":"Hortifruti","status":1}]` |
| POST `/admin/categorias` | `{"nome_categoria":"Congelados"}`. Informe `id_categoria_pai` opcionalmente para vincular a uma categoria ativa. | 201 · `{"id":8,"nome_categoria":"Congelados","status":1}` |
| PUT `/admin/categorias/8` | `{"nome_categoria":"Congelados e sorvetes"}` | 200 · `{"id":8,"nome_categoria":"Congelados e sorvetes","status":1}` |
| DELETE `/admin/categorias/8` | ID na rota | 200 · `{"id":8,"status":0}`. Retorna 409 se houver produto ou subcategoria ativa. Para restaurar, use PUT com `{"status":1}`. |
| GET `/admin/pedidos` | Sem corpo | 200 · `[{"id":1,"nome_cliente":"Cliente Teste","situacao":"Pago","valor_total":2099}]` |
| GET `/admin/pedidos/1` | ID na rota | 200 · `{"id":1,"situacao":"Pago","itens":[{"id_produto":1,"quantidade":1}]}` |
| PATCH `/admin/pedidos/1/situacao` | `{"situacao":"Enviado"}` | 200 · `{"id":1,"situacao":"Enviado"}` |

Um pedido pendente sem link de pagamento pode ser cancelado, devolvendo o estoque. Se já houver um link, o cancelamento exige que a preferência esteja expirada no Mercado Pago e que a consulta ao provedor confirme que não há pagamento pendente ou aprovado. Um pedido pago pode avançar para enviado e depois entregue.

A lista e o detalhe administrativos retornam `alerta_pagamento` com `APROVACAO_APOS_CANCELAMENTO` ou `MULTIPLAS_APROVACOES` quando houver divergência. O detalhe inclui o histórico em `pagamentos` para conferência. Cada divergência deve ser tratada no provedor, mantendo o histórico do pedido.

## Respostas de erro

| Código | Condição |
| --- | --- |
| 400 | Dados malformados ou inválidos, por exemplo CEP fora do formato ou JSON inválido. |
| 401 | Credenciais erradas ou falha de autenticação. O webhook usa esse código quando a assinatura não confere. |
| 404 | Recurso ausente ou pedido não pertencente ao cliente. |
| 409 | Cadastro, saldo, tentativa de checkout ou transição em conflito com o estado atual. |
| 413 | Corpo da requisição acima do limite do Express. |
| 500 | Falha interna. A API devolve uma mensagem genérica e registra o código técnico no servidor. |
| 502 | Integração indisponível ou resposta inválida do provedor. |
| 503 | Banco indisponível em `/health` ou configuração de pagamento ausente ou inválida, conforme a rota. |
