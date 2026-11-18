import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { formatOrderDate, formatPrice, orderTransitions } from "../../data/products";
import AdminHeading from "../../components/AdminHeading";
import { adminCard, adminFilterField, cx, formError, orderTone, statusPill } from "../../components/ui/styles";

const cols = "grid grid-cols-[70px_minmax(0,1.4fr)_1fr_50px_1fr_85px_120px] items-center gap-3 px-5 py-3 tablet:grid-cols-[1fr_1fr]";

export default function AdminOrders() {
  const { orders, setOrderStatus } = useOutletContext();
  const [status, setStatus] = useState("todos");
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");
  const list = orders.filter((o) => status === "todos" || o.situacao === status);

  async function update(id, situacao) {
    setError("");
    setBusy(id);
    try {
      await setOrderStatus(id, situacao);
    } catch (erro) {
      setError(erro.message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <AdminHeading eyebrow="VENDAS" title="Pedidos" text="Acompanhe os pedidos da loja." />
      <div className={adminCard}>
        <div className="flex flex-wrap gap-2.5 px-5 py-4">
          <select className={adminFilterField} aria-label="Filtrar por situação" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="todos">Todas as situações</option>
            {Object.keys(orderTransitions).map((v) => <option key={v}>{v}</option>)}
          </select>
          {error && <p className={formError} role="alert">{error}</p>}
        </div>
        <div className={cx(cols, "text-[12px] font-extrabold uppercase text-muted-foreground tablet:hidden")}>
          <span>Pedido</span><span>Cliente</span><span>Data</span><span>Itens</span><span>Pagamento</span><span>Total</span><span>Situação</span>
        </div>
        {list.map((o) => {
          const options = orderTransitions[o.situacao] ?? [];
          return (
            <div className={cx(cols, "border-t border-border text-[14px]")} key={o.id}>
              <b>#{o.id}</b>
              <span>{o.nome_cliente}</span>
              <span className="text-[12px] text-muted-foreground">{formatOrderDate(o.data_criado)}</span>
              <span>{o.itens ?? 0} {o.itens === 1 ? "item" : "itens"}</span>
              <span className="text-[12px] text-muted-foreground">{o.forma_pagamento ? "Mercado Pago" : "Sem pagamento"}</span>
              <b>{formatPrice(o.valor_total / 100)}</b>
              <select className={cx(statusPill, orderTone[o.situacao])} aria-label={`Situação do pedido ${o.id}`}
                value={o.situacao} disabled={busy !== null || !options.length}
                onChange={(e) => update(o.id, e.target.value)}>
                {[o.situacao, ...options].map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
          );
        })}
        {!list.length && <p className="p-[30px] text-center text-muted-foreground">Nenhum pedido nessa situação.</p>}
      </div>
    </>
  );
}
