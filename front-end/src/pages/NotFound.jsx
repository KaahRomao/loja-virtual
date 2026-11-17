import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { pillLink } from "../components/ui/styles";

export default function NotFound() {
  return (
    <section className="container-shell">
      <div className="grid min-h-[440px] place-content-center justify-items-center gap-3 py-[60px] text-center text-primary">
        <Search size={36} />
        <h1 className="font-display text-[32px] font-bold leading-[normal] text-deep">Página não encontrada</h1>
        <p className="max-w-[420px] text-muted-foreground">O endereço que você procurou não existe ou mudou de lugar.</p>
        <Link className={pillLink("primary", "md")} to="/">Voltar ao início</Link>
      </div>
    </section>
  );
}
