# VORA Supermarket — Front-end

Loja virtual do Projeto Integrador (SENAI Barueri). Interface em **React 19 + Tailwind CSS 4**, com o visual da loja publicada no Lovable (`vora-market-emoji-grocer.lovable.app`).

## Como rodar

```bash
cd front-end
npm install
npm run dev      # http://localhost:5173
npm run build    # gera dist/
npm run lint
```

## Stack

- React 19 + Vite 8
- Tailwind CSS 4 (`@tailwindcss/vite`) — tokens de cor, fontes e sombras em `src/index.css` (`@theme`)
- react-router-dom 7
- lucide-react (ícones)
- Fontes: Fredoka (títulos) e Nunito (texto), carregadas pelo `index.html`

## Estrutura

```
src/
  assets/          imagens (hero, logo, sprites dos produtos) + index.js
  components/      Header, Footer, CartDrawer, ProductCard, ProductGrid, ...
    ui/            Button e estilos reutilizáveis (styles.js)
  context/         StoreProvider (carrinho, favoritos, endereço, pagamento, pedidos, admin)
  data/products.js produtos, categorias e funções de formatação (dados de exemplo)
  hooks/           useStore
  layouts/         StoreLayout (loja) e AdminLayout (painel)
  pages/           Home, Catalog, ProductDetail, Cart, Checkout*, Login, Signup
  pages/admin/     Dashboard, Produtos, Pedidos, Categorias
```

## Rotas

| Rota | Tela |
| --- | --- |
| `/` | Home |
| `/catalogo`, `/categoria/:slug` | Catálogo / categoria |
| `/produto/:id` | Detalhe do produto |
| `/carrinho` | Carrinho |
| `/checkout/endereco` → `/pagamento` → `/confirmacao` | Checkout |
| `/entrar`, `/cadastro` | Login e cadastro |
| `/admin`, `/admin/produtos`, `/admin/produtos/:id`, `/admin/pedidos`, `/admin/categorias` | Painel administrativo |

## Importante: os dados são de exemplo

Nada aqui conversa com o back-end ainda. Produtos, pedidos, carrinho, login e painel admin vivem em memória (`StoreProvider` + `data/products.js`) e somem ao recarregar a página. Os pontos onde a integração entra estão marcados com o comentário `Aqui você ... no seu back-end`:

- `layouts/AdminLayout.jsx` — login do administrador
- `pages/Login.jsx` e `pages/Signup.jsx` — autenticação do cliente
- `context/StoreProvider.jsx` — envio do pedido
- `pages/admin/AdminProductEdit.jsx` — salvar produto

Ao integrar, atenção às diferenças de formato: o front usa preço em reais (`22.9`), enquanto o back-end trabalha em centavos, e os ids de produto/categoria precisam bater com os da API.

## Responsivo

Breakpoints próprios (definidos com `@custom-variant` em `index.css`): `compact` (≤1100px), `tablet` (≤900px), `mobile` (≤760px) e `tiny` (≤390px).
