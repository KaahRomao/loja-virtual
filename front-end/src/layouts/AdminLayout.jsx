import { useEffect, useState } from "react";
import { LayoutDashboard, Package, ClipboardList, Grid2x2, Store, LogOut } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useStore } from "../hooks/useStore";
import { adaptarProduto, request, slugify } from "../services/api";
import Button from "../components/ui/Button";
import { cx, formError } from "../components/ui/styles";

const links = [
  { to: "/admin", label: "Painel", icon: LayoutDashboard },
  { to: "/admin/produtos", label: "Produtos", icon: Package },
  { to: "/admin/pedidos", label: "Pedidos", icon: ClipboardList },
  { to: "/admin/categorias", label: "Categorias", icon: Grid2x2 },
];

const navLink = "flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[14px] font-bold tablet:w-auto";

export default function AdminLayout() {
  const { admin } = useStore();
  return <AdminArea key={admin.token} admin={admin} />;
}

function AdminArea({ admin }) {
  const { logout, refreshProducts } = useStore();
  const { pathname } = useLocation();

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const { token } = admin;

  useEffect(() => {
    const controller = new AbortController();
    const options = { token, signal: controller.signal };
    Promise.all(["produtos", "categorias", "pedidos"].map((path) => request(`/admin/${path}`, options)))
      .then(([produtos, categories, orders]) => {
        setData({ rows: produtos.map(adaptarProduto), categories, orders });
      })
      .catch((erro) => {
        if (controller.signal.aborted) return;
        if (erro.status === 401) logout();
        else setError(erro.message);
      });
    return () => controller.abort();
  }, [token, revision, pathname, logout]);

  async function mutate(path, method, body) {
    try {
      return await request(`/admin/${path}`, { token, method, body });
    } catch (erro) {
      if (erro.status === 401) logout();
      throw erro;
    }
  }

  async function saveProduct(id, payload) {
    const produto = await mutate(id ? `produtos/${id}` : "produtos", id ? "PUT" : "POST", payload);
    const row = adaptarProduto(produto);
    setData((v) => ({
      ...v,
      rows: id ? v.rows.map((r) => r.id === id ? row : r) : [...v.rows, row],
    }));
    refreshProducts();
    return row;
  }

  async function saveCategory(id, payload) {
    await mutate(id ? `categorias/${id}` : "categorias", id ? "PUT" : "POST", payload);
    setRevision((v) => v + 1);
    refreshProducts();
  }

  async function setOrderStatus(id, situacao) {
    const pedido = await mutate(`pedidos/${id}/situacao`, "PATCH", { situacao });
    setData((v) => ({ ...v, orders: v.orders.map((o) => o.id === id ? { ...o, situacao: pedido.situacao } : o) }));
    refreshProducts();
  }

  const categoryNames = Object.fromEntries((data?.categories ?? []).map((c) => [slugify(c.nome_categoria), c.nome_categoria]));

  const isActive = (to) => (to === "/admin" ? pathname === "/admin" : pathname.startsWith(to));

  return (
    <div className="grid min-h-[600px] grid-cols-[240px_1fr] bg-muted tablet:grid-cols-[1fr]">
      <aside className="flex flex-col gap-3.5 bg-deep px-4 py-[22px] text-primary-foreground tablet:static tablet:h-auto tablet:flex-row tablet:flex-wrap tablet:items-center">
        <span className="self-start rounded-[20px] border border-white/30 px-3 py-[7px] text-[11px] text-primary-foreground">
          {admin.name}
        </span>
        <nav className="mt-2.5 grid gap-1 tablet:m-0 tablet:flex tablet:flex-wrap">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              aria-current={isActive(to) ? "page" : undefined}
              className={cx(navLink, isActive(to) ? "bg-primary opacity-100" : "opacity-80 hover:bg-white/8 hover:opacity-100")}
              to={to}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto grid gap-1 tablet:m-0 tablet:flex">
          <Link className={cx(navLink, "opacity-80 hover:bg-white/8 hover:opacity-100")} to="/">
            <Store size={18} />Ver loja
          </Link>
          <button
            type="button"
            className={cx(navLink, "opacity-80 hover:bg-white/8 hover:opacity-100")}
            onClick={() => logout()}
          >
            <LogOut size={18} />Sair
          </button>
        </div>
      </aside>
      <div className="min-w-0 px-[clamp(16px,3vw,40px)] pt-8 pb-[60px]">
        <section>
          {error ? (
            <div className="grid justify-items-start gap-3">
              <p className={formError} role="alert">{error}</p>
              <Button onClick={() => { setError(""); setRevision((v) => v + 1); }}>Tentar novamente</Button>
            </div>
          ) : data ? (
            <Outlet context={{ ...data, categoryNames, saveProduct, saveCategory, setOrderStatus }} />
          ) : <p role="status">Carregando painel…</p>}
        </section>
      </div>
    </div>
  );
}
