import { useEffect } from "react";
import { Route, Routes, useLocation, useParams } from "react-router-dom";
import { StoreProvider } from "./context/StoreProvider";
import { categorySlugs } from "./data/products";
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
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductEdit from "./pages/admin/AdminProductEdit";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCategories from "./pages/admin/AdminCategories";

// Volta ao topo da página a cada navegação
function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
}

// /categoria/:slug — só aceita categorias que existem
function CategoryPage() {
  const { slug } = useParams();
  return categorySlugs.includes(slug) ? <Catalog key={slug} category={slug} /> : <NotFound />;
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
      <Routes>
        {/* Páginas da loja */}
        <Route element={<StoreLayout />}>
          <Route index element={<Home />} />
          <Route path="catalogo" element={<Catalog />} />
          <Route path="categoria/:slug" element={<CategoryPage />} />
          <Route path="produto/:id" element={<ProductDetail />} />
          <Route path="carrinho" element={<Cart />} />
          <Route path="checkout/endereco" element={<CheckoutAddress />} />
          <Route path="checkout/pagamento" element={<CheckoutPayment />} />
          <Route path="checkout/confirmacao" element={<CheckoutConfirmation />} />
          <Route path="entrar" element={<Login />} />
          <Route path="cadastro" element={<Signup />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Painel do administrador */}
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="produtos" element={<AdminProducts />} />
          <Route path="produtos/:id" element={<AdminProductPage />} />
          <Route path="pedidos" element={<AdminOrders />} />
          <Route path="categorias" element={<AdminCategories />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </StoreProvider>
  );
}
