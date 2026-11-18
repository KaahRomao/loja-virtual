# Front-end do Vora Supermarket

A loja e o painel são uma SPA em React, Vite, React Router e Tailwind CSS. O catálogo, a autenticação, o checkout e as operações administrativas usam a API Express.

Siga o [README do projeto](../README.md) para iniciar o SQLite e a API. No desenvolvimento e no preview, o Vite encaminha `/api` para `http://localhost:3000`. Para usar uma API em outro endereço no build, defina `VITE_API_URL` com a URL base desse servidor e habilite a origem da loja com `FRONT_URL` no back-end.

```bash
npm ci
npm run dev
npm run lint
npm run build
```

As rotas principais são `/`, `/catalogo`, `/categoria/:slug`, `/produto/:id`, `/carrinho`, `/checkout/endereco`, `/checkout/pagamento`, `/pedido/:id`, `/entrar`, `/cadastro` e `/admin`. O carrinho e as sessões ficam disponíveis na aba ao recarregar a página. Os pedidos e pagamentos são consultados no SQLite pela API.
