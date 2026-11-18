import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "../hooks/useStore";
import { formatOrderDate, formatPrice } from "../data/products";
import { request } from "../services/api";
import Button from "../components/ui/Button";
import { formError, panel, pillLink, textArrow } from "../components/ui/styles";

export default function Orders() {
  const { user, logout } = useStore();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    request("/pedidos", { token: user.token, signal: controller.signal })
      .then(setOrders)
      .catch((failure) => {
        if (controller.signal.aborted) return;
        if (failure.status === 401) logout();
        else setError(failure.message);
      });
    return () => controller.abort();
  }, [user.token, logout, revision]);

  return (
    <section className="container-shell grid max-w-3xl gap-4 py-10">
      <h1 className="font-display text-3xl font-semibold text-deep">Meus pedidos</h1>
      {error ? (
        <div className={panel}>
          <p className={formError} role="alert">{error}</p>
          <Button className="mt-3" onClick={() => { setError(""); setRevision((n) => n + 1); }}>Tentar novamente</Button>
        </div>
      ) : orders === null ? <p role="status">Carregando pedidos…</p> : orders.length === 0 ? (
        <div className={panel}>
          <p>Você ainda não fez nenhum pedido.</p>
          <Link className={pillLink("primary") + " mt-4"} to="/catalogo">Ver catálogo</Link>
        </div>
      ) : (
        <ul className="grid gap-3">
          {orders.map((order) => (
            <li key={order.id} className={panel + " flex flex-wrap items-center justify-between gap-3"}>
              <div>
                <p className="font-extrabold text-deep">Pedido #{order.id}</p>
                <p className="text-xs text-muted-foreground">{formatOrderDate(order.data_criado)}</p>
              </div>
              <div className="text-sm">
                <p className="font-extrabold">{formatPrice(order.valor_total / 100)}</p>
                <p>{order.situacao}</p>
              </div>
              <Link className={textArrow} to={"/pedido/" + order.id} aria-label={"Detalhes do pedido " + order.id}>Ver pedido <ArrowRight size={17} /></Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
