import { Link } from "react-router-dom";
import { logoImage } from "../assets";
import { pillLink } from "../components/ui/styles";

export default function NotFound({ restricted = false }) {
  return (
    <section className="container-shell py-10">
      <div className="grid min-h-[385px] place-content-center justify-items-center gap-4 rounded-card border bg-cream px-5 py-12 text-center">
        <img src={logoImage} alt="VORA" className="brand-logo" width="148" height="48" />
        <p className="font-display text-5xl font-semibold leading-none text-primary">{restricted ? "403" : "404"}</p>
        <h1 className="font-display text-3xl font-semibold leading-tight text-deep">{restricted ? "Sem permissão" : "Página não encontrada"}</h1>
        <p className="max-w-xs text-sm text-muted-foreground">
          {restricted ? "Sua conta não tem acesso a esta área da Vora." : "Esta página da Vora está indisponível."}
        </p>
        <Link className={pillLink("primary")} to={restricted ? "/conta" : "/catalogo"}>{restricted ? "Ir para minha conta" : "Ver produtos"}</Link>
      </div>
    </section>
  );
}
