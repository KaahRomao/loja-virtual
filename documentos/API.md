# API do Vora Supermarket

Base local `http://localhost:3000`. Envie `Content-Type: application/json` em requisições com corpo e `Authorization: Bearer <token>` em rotas protegidas. Os exemplos mostram os campos principais. Preços e frete são centavos, e datas novas estão em UTC.

## Loja

| Método e rota | Envio | Exemplo de resposta |
| --- | --- | --- |
| GET `/` | Sem corpo | 200 · `{"mensagem":"API da VORA no ar"}` |
| GET `/health` | Sem corpo | 200 · `{"status":"ok"}` se o SQLite estiver legível, ou 503 |
| GET `/produtos?categoria=1&busca=Banana` | Ambos os filtros são opcionais | 200 · `[{"id":1,"nome_produto":"Banana Prata 1kg","preco":699,"estoque":80}]` |
| GET `/produtos/1` | ID na rota | 200 · `{"id":1,"nome_produto":"Banana Prata 1kg","preco":699}` |
| POST `/clientes` | `{"nome_cliente":"Cliente Teste","email":"cliente@example.com","senha":"senha-de-exemplo"}` | 201 · `{"id":1,"nome_cliente":"Cliente Teste","email":"cliente@example.com"}` |
| POST `/login` | `{"email":"cliente@example.com","senha":"senha-de-exemplo"}` | 200 · `{"token":"<JWT>","cliente":{"id":1,"nome_cliente":"Cliente Teste"}}` |
| GET `/cep/01001000` | CEP na rota | 200 · `{"cep":"01001-000","logradouro":"Praça da Sé","bairro":"Sé","cidade":"São Paulo","uf":"SP","valor_frete":1500,"prazo_entrega":3}` |
| POST `/pedidos` | Token de cliente e corpo do exemplo abaixo | 201 · `{"id":1,"situacao":"Pendente","valor_total":2199,"itens":[{"id_produto":1,"quantidade":1,"valor_unitario":699}]}` |
| GET `/pedidos/1` | Token do dono | 200 · `{"id":1,"situacao":"Pago","valor_total":2199,"pagamentos":[{"id_transacao_externa":"123456","situacao":"Aprovado"}]}` |
| POST `/pedidos/1/pagamento` | Token do dono do pedido pendente | 200 · `{"id":"<preferência>","link":"<url checkout>","retorno_configurado":false}` |
| POST `/pagamentos/sincronizar` | Token do dono e `{"pedido_id":1}`. O `payment_id` pode ser enviado junto quando disponível | 200 · `{"processado":true}` |
| POST `/pagamentos/webhook?data.id=123456` | Evento `{"type":"payment","data":{"id":"123456"}}` com cabeçalhos de assinatura do provedor | 200 · evento recebido |

```json
{
  "itens": [{"id_produto": 1, "quantidade": 1}],
  "endereco_entrega": "Praça da Sé, 100, São Paulo/SP",
  "cep_entrega": "01001-000",
  "chave_checkout": "f5c0ffb0-3f65-4e70-8c94-93faecd6bdac"
}
```

Reenvie a mesma `chave_checkout` quando repetir o mesmo envio após falha de conexão. Usar a mesma chave com itens ou endereço diferentes retorna 409. Gere uma nova chave para um novo pedido.

## Administração

Todas as rotas abaixo, exceto o login, exigem o token administrativo.

| Método e rota | Envio | Exemplo de resposta |
| --- | --- | --- |
| POST `/admin/login` | `{"email":"admin@vora.test","senha":"senha-de-exemplo"}` | 200 · `{"token":"<JWT>","admin":{"id":1,"nome":"Admin Vora"}}` |
| GET `/admin/resumo` | Sem corpo | 200 · `[{"situacao":"Pago","quantidade":1,"total":2199}]` |
| GET `/admin/produtos` | Sem corpo | 200 · `[{"id":1,"nome_produto":"Banana Prata 1kg","situacao":"Ativo"}]` |
| GET `/admin/produtos/1` | ID na rota | 200 · `{"id":1,"nome_produto":"Banana Prata 1kg","situacao":"Ativo"}` |
| POST `/admin/produtos` | `{"nome_produto":"Produto teste","descricao":"Produto do catálogo","preco":599,"estoque":10,"id_categoria":1}` | 201 · `{"id":17,"nome_produto":"Produto teste","preco":599}` |
| PUT `/admin/produtos/17` | Objeto parcial, por exemplo `{"preco":549,"preco_anterior":599,"estoque":12}` | 200 · `{"id":17,"preco":549,"preco_anterior":599,"estoque":12}` |
| GET `/admin/categorias` | Sem corpo | 200 · `[{"id":1,"nome_categoria":"Hortifruti","status":1}]` |
| POST `/admin/categorias` | `{"nome_categoria":"Congelados"}` | 201 · `{"id":8,"nome_categoria":"Congelados","status":1}` |
| PUT `/admin/categorias/8` | `{"nome_categoria":"Congelados e sorvetes"}` | 200 · `{"id":8,"nome_categoria":"Congelados e sorvetes","status":1}` |
| GET `/admin/pedidos` | Sem corpo | 200 · `[{"id":1,"nome_cliente":"Cliente Teste","situacao":"Pago","valor_total":2199}]` |
| GET `/admin/pedidos/1` | ID na rota | 200 · `{"id":1,"situacao":"Pago","itens":[{"id_produto":1,"quantidade":1}]}` |
| PATCH `/admin/pedidos/1/situacao` | `{"situacao":"Enviado"}` | 200 · `{"id":1,"situacao":"Enviado"}` |

Um pedido pendente sem link de pagamento pode ser cancelado, devolvendo o estoque. Se já houver um link, o cancelamento exige que a preferência esteja expirada no Mercado Pago e que a consulta ao provedor confirme que não há pagamento pendente ou aprovado. Um pedido pago pode avançar para enviado e depois entregue.

A lista e o detalhe administrativos retornam `alerta_pagamento` com `APROVACAO_APOS_CANCELAMENTO` ou `MULTIPLAS_APROVACOES` quando houver divergência. O detalhe inclui o histórico em `pagamentos` para conferência. Cada divergência deve ser tratada no provedor, mantendo o histórico do pedido.

Erros de dados retornam 400, credenciais ou token inválidos retornam 401, recurso inexistente retorna 404 e conflito de cadastro, estoque ou transição retorna 409. As integrações podem retornar 502 quando indisponíveis. Um checkout sem credencial configurada devolve 503.
