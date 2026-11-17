import { DollarSign, ClipboardList, Package, TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "../../hooks/useStore";
import { formatPrice, orderLabels, stockStatus } from "../../data/products";
import AdminHeading from "../../components/AdminHeading";
import { adminCard, adminCardH2, adminCardTitle, adminStat, cx, crumbLink, orderTone, statusPill, stockTone } from "../../components/ui/styles";

const statValue = "block font-display text-[23px] font-[550] leading-[normal]";
const statLabel = "block text-[12px] text-muted-foreground";
const simpleRow = "grid items-center gap-3 border-t border-border px-[23px] py-3 text-[14px]";

export default function AdminDashboard() {
  const { orders, rows } = useStore();
  const sales = orders.reduce((s, o) => s + o.total, 0);
  const inProgress = orders.filter((o) => o.status !== "entregue").length;
  const lowRows = rows.filter((r) => stockStatus(r.stock) !== "disponivel");

  return (
    <>
      <AdminHeading eyebrow="VISÃO GERAL" title="Painel" text="Números de exemplo para demonstração." />
      <div className="mb-5 grid grid-cols-4 gap-3.5 tablet:grid-cols-[repeat(2,1fr)]">
        <div className={adminStat}><DollarSign className="text-primary" /><span><b className={statValue}>{formatPrice(sales)}</b><small className={statLabel}>Vendas (exemplo)</small></span></div>
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
            <div className={cx(simpleRow, "grid-cols-[80px_1fr_auto_auto]")} key={o.code}>
              <b>{o.code}</b>
              <span>{o.customer}</span>
              <span>{formatPrice(o.total)}</span>
              <span className={cx(statusPill, orderTone[o.status])}>{orderLabels[o.status]}</span>
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
