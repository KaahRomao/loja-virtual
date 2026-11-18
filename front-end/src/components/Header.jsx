import { useState } from "react";
import { Menu, Search, MapPin, UserRound, ShoppingBasket, Tag, Truck } from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useStore } from "../hooks/useStore";
import { formatZip } from "../data/products";
import { logoImage } from "../assets";
import Button from "./ui/Button";
import { cx } from "./ui/styles";

// Classes de cada link do menu (muda a cor quando a página está ativa)
const navClass = ({ active, offers }) =>
  cx(
    "inline-flex h-full items-center gap-1.5 border-b-[3px] text-[13px] leading-[normal] hover:text-primary mobile:h-auto mobile:border-b-0 mobile:p-2.5",
    offers ? "font-black" : "font-extrabold",
    active ? "border-primary text-primary" : cx("border-transparent", offers ? "text-deep" : "text-foreground"),
  );

// Campo de busca. Fica em um componente próprio para reiniciar quando a URL da busca muda.
function SearchForm({ initial, onSearch }) {
  const navigate = useNavigate();
  const [q, setQ] = useState(initial);

  const submit = (e) => {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/catalogo?q=${encodeURIComponent(term)}` : "/catalogo");
    onSearch();
  };

  return (
    <form
      className="flex h-12 flex-1 items-center gap-[11px] rounded-md border border-border bg-surface pl-[17px] text-soft-ink focus-within:outline-2 focus-within:outline-ring mobile:mt-3 mobile:h-11 mobile:order-5 mobile:flex-[0_0_100%]"
      role="search"
      onSubmit={submit}
    >
      <Search size={20} />
      <input
        className="min-w-0 flex-1 border-0 bg-transparent text-[14px] text-foreground outline-0 placeholder:text-soft-ink"
        placeholder="O que você está procurando?"
        aria-label="Buscar produtos"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <Button type="submit" variant="primary" size="search" aria-label="Buscar">
        <Search size={16} />
      </Button>
    </form>
  );
}

export default function Header() {
  const { totalItems, setCartOpen, address, user, categoryNames } = useStore();
  const { pathname, search } = useLocation();
  const [params] = useSearchParams();
  const [navOpen, setNavOpen] = useState(false);

  const offers = params.get("ofertas") === "true";
  const closeNav = () => setNavOpen(false);

  return (
    <>
      <div className="flex min-h-[35px] items-center justify-between gap-5 bg-deep px-[max(32px,calc(50vw_-_640px))] py-1.5 text-[12px] text-primary-foreground mobile:justify-center mobile:px-3.5 mobile:text-center">
        <span>
          Economia de verdade para a sua família. <b className="font-extrabold">Qualidade que cabe no bolso!</b>
        </span>
        <span className="flex items-center gap-[7px] whitespace-nowrap mobile:hidden">
          <Truck size={15} /> Suas compras, do seu jeito
        </span>
      </div>

      <header className="border-b border-border bg-card">
        <div className="container-shell flex h-[91px] items-center gap-[34px] compact:gap-[17px] mobile:h-auto mobile:min-h-[76px] mobile:flex-wrap mobile:gap-0 mobile:py-3">
          <Button variant="ghost" size="icon" className="not-mobile:hidden mr-2.5" aria-label="Abrir menu" onClick={() => setNavOpen((o) => !o)}>
            <Menu size={16} />
          </Button>

          <Link className="shrink-0" aria-label="VORA, página inicial" to="/" onClick={closeNav}>
            <img className="h-auto w-[166px] mobile:w-[115px]" src={logoImage} width="166" height="52" alt="VORA" />
          </Link>

          <SearchForm
            key={pathname === "/catalogo" ? search : "fora-do-catalogo"}
            initial={params.get("q") || ""}
            onSearch={closeNav}
          />

          <div className="flex items-center gap-5 compact:gap-[13px] mobile:ml-auto mobile:gap-[9px]">
            <Link className="flex items-center gap-[9px] text-left mobile:hidden" to="/carrinho">
              <MapPin size={21} />
              <span className="compact:hidden">
                <small className="block text-[11px] leading-[1.25] text-muted-foreground">Entrega para</small>
                <b className="block text-[12px] font-extrabold leading-[1.25] whitespace-nowrap">
                  {address.zip ? formatZip(address.zip) : "Informar CEP"}
                </b>
              </span>
            </Link>
            <Link className="flex items-center gap-[9px] text-left" to="/entrar" aria-label={user ? "Minha conta" : "Entrar ou cadastrar"}>
              <UserRound size={21} />
              <span className="compact:hidden">
                <small className="block text-[11px] leading-[1.25] text-muted-foreground">
                  {user ? `Olá, ${user.name}!` : "Bem-vindo!"}
                </small>
                <b className="block text-[12px] font-extrabold leading-[1.25] whitespace-nowrap">
                  {user ? "Minha conta" : "Entrar ou cadastrar"}
                </b>
              </span>
            </Link>
            <Button
              variant="primary"
              size="md"
              weight="font-extrabold"
              className="relative shrink-0 mobile:w-[42px] mobile:px-0"
              aria-label={`Abrir carrinho com ${totalItems} itens`}
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBasket size={21} />
              <span className="mobile:hidden">Carrinho</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 left-4 grid h-[19px] min-w-[19px] place-items-center rounded-[50%] bg-amber px-1 text-[10px] text-foreground">
                  {totalItems}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <nav className={cx("border-b border-border bg-card", !navOpen && "mobile:hidden")} aria-label="Navegação principal">
        <div className="container-shell flex h-[49px] items-center gap-[25px] compact:gap-[15px] mobile:grid mobile:h-auto mobile:gap-0.5 mobile:py-2.5">
          <Link className={navClass({ active: pathname === "/" })} to="/" onClick={closeNav}>Início</Link>
          <Link className={navClass({ active: pathname === "/catalogo" })} to="/catalogo" onClick={closeNav}>Todos os produtos</Link>
          {Object.entries(categoryNames).map(([slug, name]) => (
            <Link key={slug} className={navClass({ active: pathname === `/categoria/${slug}` })} to={`/categoria/${slug}`} onClick={closeNav}>
              {name}
            </Link>
          ))}
          <Link className={navClass({ active: offers, offers: true })} to="/catalogo?ofertas=true" onClick={closeNav}>
            <Tag size={16} /> Ofertas
          </Link>
        </div>
      </nav>
    </>
  );
}
