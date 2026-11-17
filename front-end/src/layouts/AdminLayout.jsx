import { useState } from "react";
import { LayoutDashboard, Package, ClipboardList, Grid2x2, Store, LogOut } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useStore } from "../hooks/useStore";
import { logoImage } from "../assets";
import Button from "../components/ui/Button";
import { cx, crumbLink, eyebrow, formInput, formLabel, noteBox } from "../components/ui/styles";

function AdminLogin() {
  const { setAdminSignedIn } = useStore();
  const [user, setUser] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    // Aqui você valida o administrador no seu back-end.
    if (user.trim().length < 3) return setError("Digite seu usuário de administrador.");
    setAdminSignedIn(true);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-deep p-5">
      <form
        className="grid w-[min(440px,100%)] gap-3.5 rounded-[22px] border border-border bg-card p-[30px] shadow-card"
        noValidate
        onSubmit={submit}
      >
        <img className="mx-auto mb-1" src={logoImage} width="150" height="47" alt="VORA" />
        <span className={eyebrow}>ÁREA RESTRITA</span>
        <h1 className="font-display text-[28px] font-bold leading-[normal] text-deep">Entrar como administrador</h1>
        <label className={formLabel}>
          Usuário
          <input className={formInput} placeholder="ex.: gerente" value={user} onChange={(e) => setUser(e.target.value)} />
        </label>
        <label className={formLabel}>
          Senha
          <input className={formInput} type="password" placeholder="Qualquer senha (demonstração)" />
        </label>
        {error && <p className="mt-1.5 text-[13px] font-bold text-destructive">{error}</p>}
        <Button type="submit" size="lg">Entrar no painel</Button>
        <p className={noteBox}>Demonstração: não há verificação de senha real.</p>
        <Link className={crumbLink} to="/">← Voltar para a loja</Link>
      </form>
    </div>
  );
}

const links = [
  { to: "/admin", label: "Painel", icon: LayoutDashboard },
  { to: "/admin/produtos", label: "Produtos", icon: Package },
  { to: "/admin/pedidos", label: "Pedidos", icon: ClipboardList },
  { to: "/admin/categorias", label: "Categorias", icon: Grid2x2 },
];

const navLink = "flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[14px] font-bold tablet:w-auto";

export default function AdminLayout() {
  const { adminSignedIn, setAdminSignedIn } = useStore();
  const { pathname } = useLocation();

  if (!adminSignedIn) return <AdminLogin />;

  const isActive = (to) => (to === "/admin" ? pathname === "/admin" : pathname.startsWith(to));

  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr] bg-muted tablet:grid-cols-[1fr]">
      <aside className="sticky top-0 flex h-screen flex-col gap-3.5 bg-deep px-4 py-[22px] text-primary-foreground tablet:static tablet:h-auto tablet:flex-row tablet:flex-wrap tablet:items-center">
        <img className="rounded-[12px] bg-card px-2.5 py-1.5" width="140" height="44" alt="VORA" src={logoImage} />
        <span className="self-start rounded-[20px] border border-white/30 px-3 py-[7px] text-[11px] text-primary-foreground">
          Modo demonstração
        </span>
        <nav className="mt-2.5 grid gap-1 tablet:m-0 tablet:flex tablet:flex-wrap">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
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
            onClick={() => setAdminSignedIn(false)}
          >
            <LogOut size={18} />Sair
          </button>
        </div>
      </aside>
      <main className="min-w-0 px-[clamp(16px,3vw,40px)] pt-8 pb-[60px]">
        <section>
          <Outlet />
        </section>
      </main>
    </div>
  );
}
