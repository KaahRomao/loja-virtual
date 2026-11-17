import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";

// Moldura de todas as páginas da loja: cabeçalho + conteúdo (Outlet) + rodapé + carrinho lateral
export default function StoreLayout() {
  return (
    <div className="overflow-clip">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
