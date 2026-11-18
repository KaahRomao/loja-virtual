import { useState } from "react";
import { ArrowRight, MapPin, Menu, Search, ShoppingBasket, Tag, UserRound } from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useStore } from "../hooks/useStore";
import { discountPercent, formatPrice, formatZip } from "../data/products";
import { logoImage } from "../assets";
import Button from "./ui/Button";
import { cx } from "./ui/styles";

function SearchForm({ initial, onSearch }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initial);

  function submit(event) {
    event.preventDefault();
    const term = query.trim();
    navigate(term ? "/catalogo?q=" + encodeURIComponent(term) : "/catalogo");
    onSearch();
  }

  return (
    <form
      className="flex h-11 min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-control border bg-surface pl-3 text-soft-ink focus-within:border-primary focus-within:ring-1 focus-within:ring-primary mobile:order-last mobile:basis-full"
      role="search"
      onSubmit={submit}
    >
      <Search size={18} className="shrink-0" aria-hidden="true" />
      <input
        className="w-full min-w-0 flex-1 border-0 bg-transparent py-2 text-sm text-foreground outline-none focus-visible:outline-none"
        placeholder="O que você está procurando?"
        aria-label="Buscar produtos"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <Button type="submit" size="search" aria-label="Buscar">
        <Search size={18} />
      </Button>
    </form>
  );
}

export default function Header() {
  const { totalItems, total, setCartOpen, address, user, categoryNames, products } = useStore();
  const { pathname, search } = useLocation();
  const [params] = useSearchParams();
  const [navOpen, setNavOpen] = useState(false);
  const offers = params.get("ofertas") === "true";
  const hasOffers = products.some((product) => discountPercent(product) > 0 && product.stock > 0);
  const closeNav = () => setNavOpen(false);

  const links = [
    { to: "/catalogo", label: "Todos os produtos", active: pathname === "/catalogo" && !offers },
    ...Object.entries(categoryNames).map(([slug, label]) => ({
      to: "/categoria/" + slug, label, active: pathname === "/categoria/" + slug,
    })),
    { to: "/catalogo?ofertas=true", label: "Ofertas", active: pathname === "/catalogo" && offers, promo: true },
  ];

  return (
    <header className="border-b bg-card">
      <div className="bg-deep text-xs font-extrabold text-white">
        <div className="container-shell flex min-h-9 flex-wrap items-center justify-between gap-x-4 gap-y-1 py-1.5 mobile:justify-center">
          <span className="compact:hidden">Economia de verdade para a sua família</span>
          <Link className="inline-flex items-center gap-1.5 text-amber hover:underline" to={hasOffers ? "/catalogo?ofertas=true" : "/catalogo"} onClick={closeNav}>
            <Tag size={15} aria-hidden="true" /> {hasOffers ? "Ofertas da semana" : "Economia em cada compra"} <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="container-shell flex min-h-[76px] flex-wrap items-center gap-x-5 gap-y-2 py-3 compact:gap-x-3 mobile:gap-x-1.5">
        <Button variant="ghost" size="iconSm" className="not-mobile:hidden" aria-label={navOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={navOpen} aria-controls="store-nav" onClick={() => setNavOpen((open) => !open)}>
          <Menu size={21} />
        </Button>
        <Link className="shrink-0" aria-label="VORA, página inicial" to="/" onClick={closeNav}>
          <img className="brand-logo" src={logoImage} width="148" height="48" alt="VORA" />
        </Link>
        <SearchForm key={pathname === "/catalogo" ? search : "fora-do-catalogo"} initial={params.get("q") || ""} onSearch={closeNav} />
        <div className="ml-auto flex shrink-0 items-center gap-3 mobile:gap-0.5">
          <Link className="inline-flex min-h-10 items-center gap-2 rounded-control px-1 text-deep hover:text-primary tablet:hidden" to="/carrinho" onClick={closeNav}>
            <MapPin size={21} aria-hidden="true" />
            <div><small className="block text-[10px] text-muted-foreground">Entrega para</small><b className="block text-xs">{address.zip ? formatZip(address.zip) : "Informar CEP"}</b></div>
          </Link>
          <Link className="inline-flex min-h-10 min-w-9 items-center justify-center gap-1.5 rounded-control px-1 text-deep hover:text-primary" to="/entrar" aria-label={user ? "Minha conta" : "Entrar ou cadastrar"} onClick={closeNav}>
            <UserRound size={20} aria-hidden="true" />
            <b className="text-sm mobile:hidden">{user ? "Minha conta" : "Entrar"}</b>
          </Link>
          <Button
            size="lg"
            className="gap-2 rounded-full mobile:px-2.5"
            aria-label={"Abrir carrinho, " + totalItems + (totalItems === 1 ? " item" : " itens") + ", " + formatPrice(total)}
            onClick={() => setCartOpen(true)}
          >
            <span key={totalItems} className={cx("relative inline-flex", totalItems > 0 && "motion-safe:animate-cart-bump")}>
              <ShoppingBasket size={21} aria-hidden="true" />
              {totalItems > 0 && <span className="absolute -top-2 -right-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-amber px-0.5 text-[9px] text-deep">{totalItems}</span>}
            </span>
            <span aria-live="polite" className="text-xs font-black">{formatPrice(total)}</span>
          </Button>
        </div>
      </div>

      <nav id="store-nav" className={cx("border-t", !navOpen && "mobile:hidden")} aria-label="Navegação principal">
        <div className="container-shell flex min-h-11 flex-wrap items-center gap-x-5 text-sm compact:gap-x-3 mobile:grid mobile:grid-cols-2 mobile:gap-1 mobile:py-2">
          {links.map(({ to, label, active, promo }) => (
            <Link key={to} to={to} aria-current={active ? "page" : undefined} onClick={closeNav}
              className={cx("inline-flex min-h-10 items-center gap-1.5 rounded-control px-2.5 font-extrabold hover:bg-accent hover:text-primary", active && "bg-accent text-primary", promo && "text-destructive")}>
              {promo && <Tag size={15} aria-hidden="true" />} {label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
