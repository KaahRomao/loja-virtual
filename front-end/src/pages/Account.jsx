import { Heart, LayoutDashboard, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "../hooks/useStore";
import Button from "../components/ui/Button";
import { panel, pillLink } from "../components/ui/styles";

export default function Account() {
  const { account, logout } = useStore();

  return (
    <section className="container-shell py-10">
      <div className={panel + " grid max-w-xl justify-items-start gap-4"}>
        <h1 className="font-display text-3xl font-semibold text-deep">Minha conta</h1>
        <div>
          <p className="font-extrabold">{account.name}</p>
          <p className="break-all text-sm text-muted-foreground">{account.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {account.role === "admin" ? (
            <Link className={pillLink("primary")} to="/admin"><LayoutDashboard size={17} /> Painel da loja</Link>
          ) : (
            <Link className={pillLink("primary")} to="/conta/pedidos"><Package size={17} /> Meus pedidos</Link>
          )}
          <Link className={pillLink("outline")} to="/favoritos"><Heart size={17} /> Favoritos</Link>
        </div>
        <Button variant="ghost" onClick={() => logout()}>Sair</Button>
      </div>
    </section>
  );
}
