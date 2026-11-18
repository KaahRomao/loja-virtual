import { useEffect } from "react";
import { Navigate, Outlet, Route, Routes, useLocation, useParams } from "react-router-dom";
import { StoreProvider } from "./context/StoreProvider";
import { useStore } from "./hooks/useStore";
import StoreLayout from "./layouts/StoreLayout";
import AdminLayout from "./layouts/AdminLayout";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import CheckoutAddress from "./pages/CheckoutAddress";
import CheckoutPayment from "./pages/CheckoutPayment";
import CheckoutConfirmation from "./pages/CheckoutConfirmation";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Account from "./pages/Account";
import Orders from "./pages/Orders";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductEdit from "./pages/admin/AdminProductEdit";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCategories from "./pages/admin/AdminCategories";

const pageMetadata = {
  "/catalogo": ["Catálogo", "Encontre produtos, categorias e ofertas na Vora Supermarket."],
  "/carrinho": ["Meu carrinho", "Revise os produtos e calcule a entrega pelo CEP."],
  "/checkout/endereco": ["Endereço de entrega", "Confira os dados de entrega do seu pedido."],
  "/checkout/pagamento": ["Pagamento", "Confira o pedido e prossiga para o Mercado Pago."],
  "/checkout/confirmacao": ["Acompanhar pedido", "Consulte a situação do seu pedido na Vora."],
  "/entrar": ["Entrar", "Acesse sua conta na Vora Supermarket."],
  "/cadastro": ["Criar conta", "Cadastre-se para fazer sua compra na Vora."],
  "/conta": ["Minha conta", "Acesse os dados da sua conta na Vora."],
  "/conta/pedidos": ["Meus pedidos", "Acompanhe suas compras na Vora."],
  "/favoritos": ["Favoritos", "Reveja os produtos que você salvou."],
};

function PageMetadata() {
  const { pathname, search } = useLocation();
  const { products, categoryNames } = useStore();
  const product = pathname.startsWith("/produto/") && products.find((item) => "/produto/" + item.id === pathname);
  const category = pathname.startsWith("/categoria/") && categoryNames[pathname.slice("/categoria/".length)];
  const [title, description] = pageMetadata[pathname] ?? (
    product ? [product.name, product.description || "Confira o produto e adicione ao carrinho."] :
      category ? [category, "Explore os produtos de " + category + " na Vora."] :
        pathname.startsWith("/pedido/") ? pageMetadata["/checkout/confirmacao"] :
          pathname.startsWith("/admin") ? ["Painel da loja", "Área administrativa da Vora Supermarket."] :
            ["Tudo que você precisa", "Produtos para o seu dia a dia, com qualidade de verdade e preço que faz bem."]
  );
  const offerPage = pathname === "/catalogo" && new URLSearchParams(search).get("ofertas") === "true";

  useEffect(() => {
    document.title = (offerPage ? "Ofertas da semana" : title) + " | VORA Supermarket";
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  }, [title, description, offerPage]);

  return null;
}

// Volta ao topo da página a cada navegação
function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
}

function RequireAccount({ role }) {
  const { account } = useStore();
  const { pathname, search } = useLocation();
  if (!account) return <Navigate to="/entrar" replace state={{ returnTo: pathname + search }} />;
  if (role && account.role !== role) return <NotFound restricted />;
  return <Outlet />;
}

// /categoria/:slug — só aceita categorias que existem
function CategoryPage() {
  const { slug } = useParams();
  const { categorySlugs } = useStore();
  return categorySlugs.includes(slug) ? (
    <Catalog key={slug} category={slug} />
  ) : (
    <NotFound />
  );
}

// /admin/produtos/:id — o key reinicia o formulário ao trocar de produto
function AdminProductPage() {
  const { id } = useParams();
  return <AdminProductEdit key={id} id={id} />;
}

export default function App() {
  return (
    <StoreProvider>
      <ScrollToTop />
      <PageMetadata />
      <Routes>
        {/* Páginas da loja */}
        <Route element={<StoreLayout />}>
          <Route index element={<Home />} />
          <Route path="catalogo" element={<Catalog />} />
          <Route path="categoria/:slug" element={<CategoryPage />} />
          <Route path="produto/:id" element={<ProductDetail />} />
          <Route path="carrinho" element={<Cart />} />
          <Route path="favoritos" element={<Favorites />} />
          <Route element={<RequireAccount />}>
            <Route path="conta" element={<Account />} />
          </Route>
          <Route element={<RequireAccount role="cliente" />}>
            <Route path="conta/pedidos" element={<Orders />} />
            <Route path="checkout/endereco" element={<CheckoutAddress />} />
            <Route path="checkout/pagamento" element={<CheckoutPayment />} />
            <Route path="checkout/confirmacao" element={<CheckoutConfirmation />} />
            <Route path="pedido/:id" element={<CheckoutConfirmation />} />
          </Route>
          <Route path="entrar" element={<Login />} />
          <Route path="cadastro" element={<Signup />} />

          <Route element={<RequireAccount role="admin" />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="produtos" element={<AdminProducts />} />
              <Route path="produtos/:id" element={<AdminProductPage />} />
              <Route path="pedidos" element={<AdminOrders />} />
              <Route path="categorias" element={<AdminCategories />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </StoreProvider>
  );
}
