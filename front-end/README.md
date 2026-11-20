# Front-end do Vora Supermarket

A loja e o painel são uma SPA em React, Vite, React Router e Tailwind CSS. O catálogo, a autenticação, o checkout e as operações administrativas usam a API Express.

Siga o [README do projeto](../README.md) para iniciar o SQLite e a API. No desenvolvimento e no preview, o Vite encaminha `/api` para `http://127.0.0.1:3000`. Para usar uma API em outro endereço no build, defina `VITE_API_URL` com a URL base desse servidor e habilite a origem da loja com `FRONT_URL` no back-end.

```bash
npm ci
npm run dev
npm run lint
npm run build
```

| Acesso | Rotas |
| --- | --- |
| Público | `/`, `/catalogo`, `/categoria/:slug`, `/produto/:id`, `/carrinho`, `/favoritos`, `/entrar` e `/cadastro` |
| Conta autenticada | `/conta` |
| Cliente | `/conta/pedidos`, `/checkout/endereco`, `/checkout/pagamento`, `/checkout/confirmacao` e `/pedido/:id` |
| Administrador | `/admin`, `/admin/produtos`, `/admin/produtos/:id`, `/admin/categorias` e `/admin/pedidos` |

O mesmo formulário de login atende os dois papéis. O visitante que abre a etapa do checkout vai a **Entrar** e, depois da autenticação como cliente, retoma o fluxo. A API verifica o papel nas rotas protegidas. Páginas inexistentes mostram a tela 404 da Vora. A categoria **Congelados** demonstra esse caminho quando ainda não existe no catálogo.

O carrinho e as listas de favoritos são preferências em `localStorage`, com fallback em `sessionStorage`. Os favoritos ficam separados por papel e ID da conta e têm uma lista para o visitante. A sessão autenticada fica em `sessionStorage` e expira em duas horas. Pedidos e pagamentos vêm da API e são consultados no banco.

O campo `img_url` pode indicar a foto principal. A galeria combina esse campo com as fotos locais cadastradas no mapa de imagens do front-end. Use um caminho na pasta pública ou uma URL HTTP(S) ao editar o produto.

[Mapa de imagens](src/data/productImages.js) · [Contrato da API](../documentos/API.md) · [Manual da loja](../documentos/manual.md)
