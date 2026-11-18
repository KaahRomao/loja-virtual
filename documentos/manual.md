# Manual da loja e roteiro de demonstração

## Como comprar

1. Entre no catálogo e use a busca pelo nome ou o filtro de categoria.
2. Abra um produto, escolha a quantidade e adicione ao carrinho. A quantidade é limitada pelo estoque.
3. No carrinho, informe o CEP para calcular a entrega. Preencha o número no formulário seguinte e confira o endereço.
4. Crie uma conta ou entre com uma conta já cadastrada. Confirme o pedido depois de revisar os itens e o frete.
5. Abra o Checkout Pro com a conta e o cartão de teste. Volte à loja e consulte a situação pela página do pedido. Na aba da loja, **Minha conta** também aponta para o último pedido da sessão.
6. A confirmação mostra o número do pedido, o frete, o valor final e o estado do pagamento.

## Como administrar

1. Inicie a API e crie a conta administrativa conforme o README.
2. Abra `/admin` e entre com as credenciais administrativas.
3. Em **Produtos**, use **Novo produto** ou **Ficha** para cadastrar e editar. Ajuste o estoque, indique o preço anterior quando houver oferta e desmarque **Mostrar na loja** para inativar um item.
4. Em **Categorias**, cadastre uma categoria ou edite o nome de uma existente.
5. Em **Pedidos**, acompanhe o pagamento e a entrega. Cancelar um pedido pendente repõe o estoque. Se já existir um link de pagamento, o cancelamento depende da confirmação de que o link expirou e de que o pagamento não está pendente ou aprovado. Um pedido pago pode ser marcado como enviado e depois entregue.

## Roteiro para a apresentação

| Tempo | O que mostrar |
| --- | --- |
| 2 min | Público, marca Vora e catálogo de supermercado |
| 3 min | Requisitos, protótipo usado pela equipe e DER |
| 3 min | React → Express → SQLite, consulta de CEP e Checkout Pro |
| 5 min | Buscar um produto, adicionar ao carrinho, consultar CEP, cadastrar cliente, pagar em teste e abrir o pedido no painel |
| 2 min | Divisão real das tarefas, problemas encontrados e como a equipe os corrigiu |

Antes da apresentação, teste o acesso à internet, a conta de teste do comprador e a credencial de teste do vendedor. Grave o fluxo após a validação no provedor para o vídeo de backup do PDF.
