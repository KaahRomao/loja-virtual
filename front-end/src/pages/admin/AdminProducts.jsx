import { useState } from "react";
import { Plus, PackageCheck, Tag, TriangleAlert, PackageX, Search, Pencil, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "../../hooks/useStore";
import { formatPrice, stockStatus, stockLabels } from "../../data/products";
import AdminHeading from "../../components/AdminHeading";
import ProductPhoto from "../../components/ProductPhoto";
import Button from "../../components/ui/Button";
import {
  adminCard, adminCardH2, adminCardTitle, adminFilterField, adminStat, adminTableHead,
  crumbLink, cx, pillLink, statusPill, stockTone,
} from "../../components/ui/styles";

const modalLabel = "grid gap-[7px] text-[13px] font-extrabold";
const modalInput = "rounded-[5px] border border-border px-3 py-[11px] outline-ring";
const statValue = "block font-display text-[23px] font-[550] leading-[normal]";
const statLabel = "block text-[12px] text-muted-foreground";
const rowCols =
  "grid grid-cols-[minmax(0,2.2fr)_1fr_1fr_.8fr_1.1fr_100px] items-center gap-3.5 px-[23px] py-[11px] tablet:grid-cols-[1fr_auto] tablet:[&>:nth-child(2)]:hidden tablet:[&>:nth-child(4)]:hidden";

// Janelinha de edição rápida (nome, preços e estoque)
function QuickEdit({ row, onClose, onSave }) {
  const [form, setForm] = useState({
    name: row.name,
    price: row.price.toFixed(2),
    oldPrice: row.oldPrice ? row.oldPrice.toFixed(2) : "",
    stock: String(row.stock),
    active: row.active,
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const save = () => {
    const price = parseFloat(form.price.replace(",", "."));
    const oldPrice = parseFloat(form.oldPrice.replace(",", "."));
    onSave({
      ...row,
      name: form.name.trim() || row.name,
      price: isNaN(price) ? row.price : price,
      oldPrice: isNaN(oldPrice) ? undefined : oldPrice,
      stock: Math.max(0, parseInt(form.stock, 10) || 0),
      active: form.active,
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[oklch(16%_.02_175/.52)] p-5" onClick={onClose}>
      <div
        className="relative w-[min(430px,100%)] rounded-[8px] bg-card p-[26px] shadow-[0_20px_70px_oklch(18%_.02_175/.25)]"
        role="dialog"
        aria-modal="true"
        aria-label="Editar produto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-[24px] font-medium leading-[normal]">Editar produto</h2>
          <Button variant="ghost" size="icon" aria-label="Fechar" onClick={onClose}><X size={16} /></Button>
        </div>
        <label className={modalLabel}>Nome do produto<input className={modalInput} maxLength={48} value={form.name} onChange={set("name")} /></label>
        <div className="grid grid-cols-[repeat(3,1fr)] gap-2.5 tablet:grid-cols-[1fr]">
          <label className={modalLabel}>Preço atual (R$)<input className={modalInput} inputMode="decimal" value={form.price} onChange={set("price")} /></label>
          <label className={modalLabel}>Preço "de" (R$)<input className={modalInput} inputMode="decimal" placeholder="Sem oferta" value={form.oldPrice} onChange={set("oldPrice")} /></label>
          <label className={modalLabel}>Estoque (un.)<input className={modalInput} inputMode="numeric" value={form.stock} onChange={set("stock")} /></label>
        </div>
        <label className="flex items-center gap-[7px] text-[13px] font-extrabold">
          <input className={cx(modalInput, "w-auto")} type="checkbox" checked={form.active} onChange={set("active")} /> Mostrar na loja
        </label>
        <div className="mt-[25px] flex justify-end gap-[9px]">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={save}>Salvar alteração</Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const { rows, setRows, categoryNames } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("todos");
  const [status, setStatus] = useState("todos");
  const [editing, setEditing] = useState(null);

  const counts = {
    total: rows.length,
    offers: rows.filter((r) => r.oldPrice).length,
    low: rows.filter((r) => stockStatus(r.stock) === "baixo").length,
    out: rows.filter((r) => stockStatus(r.stock) === "esgotado").length,
  };

  const list = rows.filter(
    (r) =>
      r.name.toLowerCase().includes(q.toLowerCase()) &&
      (cat === "todos" || r.category === cat) &&
      (status === "todos" || (status === "ofertas" ? r.oldPrice : stockStatus(r.stock) === status)),
  );

  return (
    <>
      <AdminHeading eyebrow="CATÁLOGO" title="Produtos" text="Preços, ofertas e estoque.">
        <Link className={pillLink("primary", "md")} to="/admin/produtos/novo"><Plus size={16} /> Novo produto</Link>
      </AdminHeading>
      <div className="mt-[34px]">
        <div className="mb-5 grid grid-cols-4 gap-3.5 tablet:grid-cols-[repeat(2,1fr)]">
          <div className={adminStat}><PackageCheck className="text-primary" /><span><b className={statValue}>{counts.total}</b><small className={statLabel}>Produtos cadastrados</small></span></div>
          <div className={adminStat}><Tag className="text-primary" /><span><b className={statValue}>{counts.offers}</b><small className={statLabel}>Em oferta</small></span></div>
          <div className={adminStat}><TriangleAlert className="text-primary" /><span><b className={statValue}>{counts.low}</b><small className={statLabel}>Estoque baixo</small></span></div>
          <div className={adminStat}><PackageX className="text-primary" /><span><b className={statValue}>{counts.out}</b><small className={statLabel}>Esgotados</small></span></div>
        </div>
        <div className={adminCard}>
          <div className={adminCardTitle}>
            <h2 className={adminCardH2}>Produtos</h2>
            <span className="text-[12px] text-muted-foreground mobile:hidden">
              Alterações visíveis somente nesta visita · <Link className={crumbLink} to="/admin/produtos/novo">+ Novo produto</Link>
            </span>
          </div>
          <div className="flex flex-wrap gap-2.5 px-[23px] pb-4">
            <label className="flex min-w-[200px] flex-1 items-center gap-2 rounded-[4px] border border-border px-2.5 text-muted-foreground">
              <Search size={16} />
              <input className="h-[38px] w-full border-0 bg-transparent text-foreground outline-0" placeholder="Buscar produto" value={q} onChange={(e) => setQ(e.target.value)} />
            </label>
            <select className={adminFilterField} aria-label="Filtrar por categoria" value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="todos">Todas as categorias</option>
              {Object.entries(categoryNames).map(([slug, name]) => <option key={slug} value={slug}>{name}</option>)}
            </select>
            <select className={adminFilterField} aria-label="Filtrar por situação" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="todos">Todas as situações</option>
              <option value="disponivel">Disponível</option>
              <option value="baixo">Estoque baixo</option>
              <option value="esgotado">Esgotado</option>
              <option value="ofertas">Em oferta</option>
            </select>
          </div>
          <div className={cx(rowCols, adminTableHead, "tablet:hidden")}>
            <span>Produto</span><span>Categoria</span><span>Preço</span><span>Estoque</span><span>Situação</span><span>Ações</span>
          </div>
          {list.map((r) => {
            const st = stockStatus(r.stock);
            return (
              <div className={cx(rowCols, "border-t border-border text-[13px]", !r.active && "opacity-55")} key={r.id}>
                <div className="flex min-w-0 items-center gap-[11px]">
                  <span className="block size-11 flex-none overflow-hidden rounded-[5px]"><ProductPhoto product={r} /></span>
                  <span>
                    <b className="block">{r.name}</b>
                    <small className="block text-[12px] text-muted-foreground">#{String(r.id).padStart(3, "0")} · {r.unit}</small>
                  </span>
                </div>
                <span className="text-[12px] text-muted-foreground">{categoryNames[r.category]}</span>
                <span>
                  {r.oldPrice && <small className="block text-[12px] leading-[1.3] text-muted-foreground line-through">{formatPrice(r.oldPrice)}</small>}
                  <b>{formatPrice(r.price)}</b>
                </span>
                <span>{r.stock} un.</span>
                <span className={cx(statusPill, stockTone[st])}>{stockLabels[st]}</span>
                <span className="flex items-center gap-2.5">
                  <Button variant="outline" size="sm" onClick={() => setEditing(r)}><Pencil size={16} /> Rápido</Button>
                  <Link className={crumbLink} to={`/admin/produtos/${r.id}`}>Ficha</Link>
                </span>
              </div>
            );
          })}
          {!list.length && <p className="p-[30px] text-center text-muted-foreground">Nenhum produto encontrado.</p>}
        </div>
      </div>
      {editing && (
        <QuickEdit
          row={editing}
          onClose={() => setEditing(null)}
          onSave={(updated) => {
            setRows((all) => all.map((x) => (x.id === updated.id ? updated : x)));
            setEditing(null);
          }}
        />
      )}
    </>
  );
}
