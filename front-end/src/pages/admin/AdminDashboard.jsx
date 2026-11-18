import { DollarSign, ClipboardList, Package, TriangleAlert } from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";
import { formatPrice, stockStatus } from "../../data/products";
import AdminHeading from "../../components/AdminHeading";
import { adminCard, adminCardH2, adminCardTitle, adminStat, cx, crumbLink, orderTone, statusPill, stockTone } from "../../components/ui/styles";

const statValue = "block font-display text-[23px] font-[550] leading-[normal]";
const statLabel = "block text-[12px] text-muted-foreground";
const simpleRow = "grid items-center gap-3 border-t border-border px-[23px] py-3 text-[14px]";

export default function AdminDashboard() {
  const { orders, rows } = useOutletContext();
  const sales = orders.filter((o) => ["Pago", "Enviado", "Entregue"].includes(o.situacao))
    .reduce((s, o) => s + o.valor_total, 0) / 100;
  const inProgress = orders.filter((o) => !["Entregue", "Cancelado"].includes(o.situacao)).length;
  const lowRows = rows.filter((r) => stockStatus(r.stock) !== "disponivel");

  return (
    <>
      <AdminHeading eyebrow="VISÃO GERAL" title="Painel" text="Resumo de pedidos e estoque." />
      <div className="mb-5 grid grid-cols-4 gap-3.5 tablet:grid-cols-[repeat(2,1fr)]">
        <div className={adminStat}><DollarSign className="text-primary" /><span><b className={statValue}>{formatPrice(sales)}</b><small className={statLabel}>Vendas confirmadas</small></span></div>
        <div className={adminStat}><ClipboardList className="text-primary" /><span><b className={statValue}>{orders.length}</b><small className={statLabel}>Pedidos</small></span></div>
        <div className={adminStat}><Package className="text-primary" /><span><b className={statValue}>{inProgress}</b><small className={statLabel}>Em andamento</small></span></div>
        <div className={adminStat}><TriangleAlert className="text-primary" /><span><b className={statValue}>{lowRows.length}</b><small className={statLabel}>Estoque baixo/esgotado</small></span></div>
      </div>
      <div className="grid grid-cols-[1fr_1fr] gap-[18px] tablet:grid-cols-[1fr]">
        <div className={adminCard}>
          <div className={adminCardTitle}>
            <h2 className={adminCardH2}>Últimos pedidos</h2>
            <Link className={crumbLink} to="/admin/pedidos">Ver todos</Link>
          </div>
          {orders.slice(0, 5).map((o) => (
            <div className={cx(simpleRow, "grid-cols-[80px_1fr_auto_auto]")} key={o.id}>
              <b>#{o.id}</b>
              <span>{o.nome_cliente}</span>
              <span>{formatPrice(o.valor_total / 100)}</span>
              <span className={cx(statusPill, orderTone[o.situacao])}>{o.situacao}</span>
            </div>
          ))}
        </div>
        <div className={adminCard}>
          <div className={adminCardTitle}>
            <h2 className={adminCardH2}>Repor estoque</h2>
            <Link className={crumbLink} to="/admin/produtos">Produtos</Link>
          </div>
          {lowRows.slice(0, 6).map((r) => {
            const st = stockStatus(r.stock);
            return (
              <div className={cx(simpleRow, "grid-cols-[1fr_auto_auto]")} key={r.id}>
                <Link className={crumbLink} to={`/admin/produtos/${r.id}`}>{r.name}</Link>
                <span>{r.stock} un.</span>
                <span className={cx(statusPill, stockTone[st])}>{st === "baixo" ? "Baixo" : "Esgotado"}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
