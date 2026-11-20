# Manual da loja e roteiro de demonstração

Abra a loja publicada ou inicie a aplicação local seguindo o README. [Site da Vora](https://loja-virtual-f96n.vercel.app/) · [Instalação local](../README.md#rodar-localmente)

## Como comprar

1. Entre no catálogo e use a busca pelo nome ou o filtro de categoria.
2. Abra um produto, escolha a quantidade e adicione ao carrinho. A quantidade é limitada pelo estoque.
3. Para salvar um produto, toque no coração do cartão. Abra o coração do cabeçalho para consultar **Favoritos**.
4. No carrinho, informe o CEP para calcular a entrega. Entre na Vora para continuar, preencha o endereço e confira o frete e o total.
5. Clique em **Pagar com Mercado Pago** e **Abrir Mercado Pago**. Use a conta e o cartão de teste. Volte à loja e consulte a situação em **Minha conta → Meus pedidos**.
6. O detalhe mostra o número do pedido, os itens, o frete, o valor final e o estado do pagamento.
7. Use **Atualizar situação** para consultar o provedor. **Cancelar pedido** aparece para pedidos pendentes. A API confirma se a compra pode ser cancelada.

## Como administrar

1. Para usar o ambiente local, inicie a API e crie a conta administrativa conforme o README.
2. Use **Entrar** na loja com as credenciais administrativas. O menu **Painel da loja** aparece depois de entrar.
3. Em **Produtos**, use **Novo produto**, **Rápido** ou **Ficha** para cadastrar e editar. Ajuste o estoque, informe o preço anterior de uma oferta e use **Repor estoque** para filtrar os saldos abaixo de 15. A ficha mostra quantas unidades faltam para esse mínimo.
4. Na ficha, **Excluir produto** inativa o item e os registros equivalentes. Para restaurar um produto, abra-o com o filtro **Inativos** e marque **Mostrar na loja**.
5. Em **Categorias**, use o cadastro ou **Editar**. **Excluir** retira a categoria da loja após mover ou inativar os produtos e subcategorias dependentes. **Restaurar** publica novamente a categoria. Se houver uma categoria superior, restaure-a primeiro.
6. Em **Pedidos**, acompanhe o pagamento e a entrega. Cancelar um pedido pendente elegível repõe o estoque. Se houver um link de pagamento, o cancelamento depende de sua expiração e da ausência de aprovação ou pagamento em processamento. Um pedido pago pode ser marcado como enviado e depois entregue.

## Roteiro para a apresentação

| Tempo | O que mostrar |
| --- | --- |
| 2 min | Público, marca Vora e catálogo de supermercado |
| 3 min | Requisitos, protótipo usado pela equipe e DER |
| 3 min | React → Express → SQLite, consulta de CEP e Checkout Pro |
| 5 min | Buscar um produto, adicionar ao carrinho, consultar CEP, cadastrar cliente, pagar em teste e abrir o pedido no painel |
| 2 min | Divisão real das tarefas, problemas encontrados e como a equipe os corrigiu |

Para repetir a demonstração, confira a saúde da API e use as credenciais de teste da aplicação no Mercado Pago. Para a etapa de design, mostre a identidade em PDF e as peças para Instagram no Figma.

[Identidade visual](identidade-visual-vora.pdf) · [Figma](https://www.figma.com/design/II23DswXQi3jbtvJJz2k6o/Vora-Supermarket-%E2%80%94-Instagram--post-e-Reel?node-id=0-1&p=f) · [Materiais da entrega](../README.md#documentação-e-materiais)
