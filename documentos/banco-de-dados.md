# Banco de dados da Vora

O projeto usa SQLite em arquivo no desenvolvimento e libSQL no Turso para a loja pública. O modelo da aplicação tem **13 tabelas, 76 campos, 14 chaves estrangeiras e quatro triggers**. A conferência de 20/11/2026 comparou o esquema de um SQLite novo com os metadados do Turso em uso.

[Modelo editável no Draw.io](loja_virtual.drawio) · [Dicionário de dados em Excel](lojaVirtual_dicionario.xlsx)

## Entidades e persistência

| Área | Tabelas | O que é registrado |
| --- | --- | --- |
| Contas | `cliente`, `administrador` | Nome, e-mail, hash bcrypt, status e data de criação. `cliente` inclui telefone opcional. A autenticação distingue os dois papéis. |
| Catálogo | `categoria`, `produto` | Hierarquia de categorias, descrição, unidade, referência da imagem, preços, estoque e visibilidade. |
| Compras | `pedido`, `produto_pedido`, `pagamento` | Cabeçalho, itens, cópias de preço e endereço, CEP, frete, prazo e transações registradas. |
| Situações | `situacao` | Estados compartilhados de produtos, pedidos e pagamentos. |
| Apoio | `carrinho`, `produto_carrinho`, `endereco`, `estado` | Estruturas do modelo SQL. A loja salva o carrinho no navegador e a API consulta a UF no ViaCEP e grava o endereço textual em `pedido`. |
| Inicialização | `migracao` | Controle dos passos já aplicados. A inicialização registra a carga de `ofertas-iniciais`. |

Cada pedido pertence a um cliente. Um pedido criado pela API tem pelo menos um item e pode ter zero ou mais tentativas de pagamento. Cada item referencia um produto e mantém o preço unitário da compra. O pai da categoria é opcional. As referências físicas de apoio incluem, por exemplo, um carrinho por cliente e o vínculo entre endereço e estado.

O carrinho e os favoritos usam armazenamento do navegador. Cada conta tem seus favoritos naquele navegador. O campo `produto.img_url` guarda a referência da imagem principal. As demais imagens do catálogo ficam no front-end.

## Restrições e transações

- **Valores e quantidades.** Preços e frete são inteiros em centavos, como `599` para R$ 5,99. Os itens exigem quantidade positiva e a coluna `estoque` tem restrição de saldo não negativo. O SQL novo exige `preco_anterior > preco` quando há oferta.
- **Idempotência do pedido.** O índice único `pedido_checkout` combina cliente e chave de checkout. A mesma chave e os mesmos dados retornam o pedido original. A API rejeita a reutilização da chave com dados diferentes.
- **Conciliação.** O índice único `pedido_referencia` identifica a referência enviada ao Mercado Pago. `pagamento.id_transacao_externa` é única. O banco mantém a referência da preferência e os resultados de pagamento. A API usa a referência, o total e a moeda BRL para conciliar.
- **Estoque.** `trg_produto_pedido_baixa_estoque` baixa a quantidade ao inserir o item. Pedido, itens e baixa são gravados juntos. O cancelamento elegível repõe o estoque na transação que muda a situação.
- **Carrinho de apoio.** `trg_produto_carrinho_ai`, `trg_produto_carrinho_au` e `trg_produto_carrinho_ad` atualizam `carrinho.atualizado_em` após inserir, atualizar ou excluir um item no banco.

| Fluxo | Situações que usa |
| --- | --- |
| Produto | Ativo, Inativo |
| Pedido | Pendente, Pago, Enviado, Entregue, Cancelado |
| Pagamento | Pendente, Aprovado, Recusado |

## Criação e compatibilidade

1. A primeira inicialização de uma base vazia aplica o SQL das tabelas, dos índices e dos triggers. Em seguida, insere estados, situações, categorias e 16 produtos iniciais.
2. Ao abrir o esquema anterior, a aplicação acrescenta os campos de telefone, apresentação do produto e checkout que estiverem faltando. Ela garante os dois índices do pedido e o trigger de estoque. A carga inicial de ofertas tem um marcador próprio na tabela `migracao`.
3. O Turso existente tem os mesmos campos, tipos, chaves e regras de nulidade do SQLite novo. A ordem de certas colunas difere por causa das migrações. A declaração de alguns padrões e os triggers do carrinho usam `DATETIME('now', 'localtime')` no banco existente. O esquema novo usa `DATETIME('now')`. A API grava explicitamente o horário UTC quando registra pagamentos.
4. No Turso existente, `produto.preco_anterior` foi acrescentado sem o `CHECK` que existe no SQL novo. A API administrativa valida a oferta nos dois ambientes.

Os scripts e o código de inicialização registram as regras executadas. O arquivo `voraSupermarket.sqlite` da pasta de documentos é uma cópia histórica para consulta. A execução local usa o arquivo definido em `DB_PATH` ou cria `back-end/data/vora.sqlite`.

[Criação das tabelas](../back-end/src/database/sql/create.sql) · [Dados iniciais](../back-end/src/database/sql/insert.sql) · [Ofertas iniciais](../back-end/src/database/sql/ofertas-iniciais.sql) · [Inicialização na API](../back-end/src/database/connection.js)
