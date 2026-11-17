import { useState } from "react";
import { useStore } from "../../hooks/useStore";
import { formatPrice, orderLabels, paymentLabels } from "../../data/products";
import AdminHeading from "../../components/AdminHeading";
import { adminCard, adminFilterField, cx, orderTone, statusPill } from "../../components/ui/styles";

const cols =
  "grid grid-cols-[90px_1.4fr_1fr_60px_1.3fr_100px_150px] items-center gap-3 px-[23px] py-3 tablet:grid-cols-[1fr_1fr]";

export default function AdminOrders() {
  const { orders, setOrders } = useStore();
  const [status, setStatus] = useState("todos");
  const list = orders.filter((o) => status === "todos" || o.status === status);

  const update = (code, value) => setOrders((all) => all.map((o) => (o.code === code ? { ...o, status: value } : o)));

  return (
    <>
      <AdminHeading eyebrow="VENDAS" title="Pedidos" text="Pedidos de exemplo. Os feitos na loja aparecem aqui nesta visita." />
      <div className={adminCard}>
        <div className="flex flex-wrap gap-2.5 px-[23px] pb-4">
          <select className={adminFilterField} aria-label="Filtrar por situação" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="todos">Todas as situações</option>
            {Object.entries(orderLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className={cx(cols, "text-[12px] font-extrabold uppercase text-muted-foreground tablet:hidden")}>
          <span>Pedido</span><span>Cliente</span><span>Data</span><span>Itens</span><span>Pagamento</span><span>Total</span><span>Situação</span>
        </div>
        {list.map((o) => (
          <div className={cx(cols, "border-t border-border text-[14px]")} key={o.code}>
            <b>{o.code}</b>
            <span>{o.customer}</span>
            <span className="text-[12px] text-muted-foreground">{o.date}</span>
            <span>{o.items}</span>
            <span className="text-[12px] text-muted-foreground">{paymentLabels[o.payment]}</span>
            <b>{formatPrice(o.total)}</b>
            <select
              className={cx(statusPill, "cursor-pointer", orderTone[o.status])}
              aria-label={`Situação do pedido ${o.code}`}
              value={o.status}
              onChange={(e) => update(o.code, e.target.value)}
            >
              {Object.entries(orderLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        ))}
        {!list.length && <p className="p-[30px] text-center text-muted-foreground">Nenhum pedido nessa situação.</p>}
      </div>
    </>
  );
}
