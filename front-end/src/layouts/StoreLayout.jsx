import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import { useStore } from "../hooks/useStore";

// Moldura de todas as páginas da loja: cabeçalho + conteúdo (Outlet) + rodapé + carrinho lateral
export default function StoreLayout() {
  const { loading, error } = useStore();

  return (
    <div className="overflow-clip">
      <Header />
      <main>
        {loading ? (
          <p className="container-shell min-h-[420px] py-24 text-center text-muted-foreground">
            Carregando produtos…
          </p>
        ) : error ? (
          <div className="container-shell min-h-[420px] py-24 text-center">
            <h1 className="font-display text-[26px] font-medium text-deep">
              Não conseguimos carregar a loja.
            </h1>
            <p className="mt-2 text-muted-foreground">{error}</p>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
