import { useRef } from "react";
import {
  Apple, ArrowLeft, ArrowRight, Carrot, CupSoda, Milk, ShoppingBasket,
  Sparkles, Tag, Truck, Wheat,
} from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import SectionHeading from "../components/SectionHeading";
import { categoryTaglines, discountPercent } from "../data/products";
import { useStore } from "../hooks/useStore";
import { heroImage } from "../assets";
import { cx, pillLink, textArrow } from "../components/ui/styles";

const categoryIcons = {
  frutas: Apple,
  "legumes-e-verduras": Carrot,
  mercearia: ShoppingBasket,
  bebidas: CupSoda,
  "laticinios-e-frios": Milk,
  padaria: Wheat,
};
const tileColors = ["bg-pale", "bg-cream", "bg-secondary"];

function uniqueProducts(products) {
  const names = new Set();
  return products.filter((product) => {
    const name = product.name.trim().toLowerCase();
    if (names.has(name)) return false;
    names.add(name);
    return true;
  });
}

function ProductShelf({ items, offers = false }) {
  const rail = useRef(null);
  const title = offers ? "Ofertas da semana" : "Em destaque";

  function scroll(direction) {
    const track = rail.current;
    track.scrollBy({ left: track.clientWidth * direction * 0.85 });
  }

  return (
    <section id={offers ? "ofertas" : "destaques"} className="container-shell py-14 mobile:py-9">
      <SectionHeading
        title={title}
        text={offers ? "Economize no que não pode faltar em casa." : "Encontre o básico de sempre para a sua lista."}
      >
        <div className="flex items-center gap-2">
          <Link className={cx(textArrow, "mr-2 text-sm")} to={offers ? "/catalogo?ofertas=true" : "/catalogo"}>
            {offers ? "Todas as ofertas" : "Ver catálogo"} <ArrowRight size={17} />
          </Link>
          {items.length > 4 && (
            <>
              <button type="button" aria-label={title + " anteriores"} className="grid size-10 place-items-center rounded-full border bg-card text-primary hover:bg-accent mobile:hidden" onClick={() => scroll(-1)}><ArrowLeft size={18} /></button>
              <button type="button" aria-label={title + " seguintes"} className="grid size-10 place-items-center rounded-full border bg-card text-primary hover:bg-accent mobile:hidden" onClick={() => scroll(1)}><ArrowRight size={18} /></button>
            </>
          )}
        </div>
      </SectionHeading>
      <div className="product-rail" ref={rail} tabIndex={0} role="region" aria-label={title}>
        {items.map((product) => <ProductCard key={product.id} product={product} featured={!offers} />)}
      </div>
    </section>
  );
}

export default function Home() {
  const { categoryNames, products } = useStore();
  const offers = uniqueProducts(products.filter((product) => discountPercent(product) && product.stock > 0)).slice(0, 10);
  const highlights = uniqueProducts(products.filter((product) => product.stock > 0)).slice(0, 8);

  return (
    <>
      <section className="bg-cream py-5 mobile:py-3" aria-labelledby="home-title">
        <div className="container-shell relative isolate grid min-h-[455px] items-center overflow-hidden rounded-[28px] bg-pale tablet:min-h-[420px] mobile:min-h-0 mobile:rounded-[22px]">
          <img
            className="absolute inset-y-0 right-0 -z-20 h-full w-[68%] object-cover object-right tablet:w-[75%] mobile:relative mobile:inset-auto mobile:order-2 mobile:h-[170px] mobile:w-full mobile:object-[center_62%]"
            src={heroImage}
            alt=""
            fetchPriority="high"
          />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,var(--color-pale)_0%,var(--color-pale)_36%,transparent_78%)] mobile:hidden" />
          <div className="max-w-[660px] px-[clamp(24px,5vw,68px)] py-12 mobile:py-7">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-2 text-[10px] font-black tracking-[.08em] text-deep uppercase">
              <Sparkles size={14} aria-hidden="true" /> O mercado da sua família
            </span>
            <h1 id="home-title" className="mt-5 font-display text-[clamp(43px,4.05vw,64px)] font-semibold leading-[1.04] text-deep mobile:mt-4 mobile:text-[clamp(32px,8.7vw,48px)]">
              Tudo que você precisa. <span className="block text-primary">Do jeitinho que cabe no bolso.</span>
            </h1>
            <p className="mt-5 max-w-[370px] text-base leading-relaxed text-deep mobile:mt-3 mobile:text-sm">
              Produtos para o seu dia a dia, com qualidade de verdade e preço que faz bem.
            </p>
            <div className="mt-7 flex flex-wrap gap-2.5 mobile:mt-5">
              <Link className={pillLink("primary", "lg")} to="/catalogo">Comprar agora <ArrowRight size={18} /></Link>
              {(offers.length > 0 || highlights.length > 0) && (
                <a className={pillLink("amber")} href={offers.length ? "#ofertas" : "#destaques"}>{offers.length ? "Ver ofertas" : "Ver destaques"}</a>
              )}
            </div>
          </div>
        </div>
        <div className="container-shell mt-4 flex flex-wrap items-center justify-center gap-x-9 gap-y-2 px-3 pb-1 text-sm font-extrabold text-deep mobile:justify-start mobile:gap-x-4 mobile:text-xs">
          <span className="inline-flex items-center gap-2"><Truck size={18} aria-hidden="true" /> Frete calculado pelo CEP</span>
          <Link to="/catalogo?ofertas=true" className="inline-flex items-center gap-2 hover:underline"><Tag size={17} aria-hidden="true" /> Confira as ofertas</Link>
        </div>
      </section>

      {offers.length > 0 ? <ProductShelf items={offers} offers /> : highlights.length > 0 && <ProductShelf items={highlights} />}

      <section className="bg-secondary/50 py-14 mobile:py-9">
        <div className="container-shell">
          <SectionHeading title="Compre por categoria" text="Encontre tudo para sua próxima compra." />
          <div className="grid grid-cols-3 gap-3 mobile:grid-cols-2">
            {Object.entries(categoryNames).map(([slug, name], index) => {
              const Icon = categoryIcons[slug] ?? ShoppingBasket;
              return (
                <Link
                  key={slug}
                  className={cx("group grid min-w-0 content-between gap-3 rounded-card border border-primary/12 p-5 text-deep transition-colors hover:bg-card mobile:p-3.5", tileColors[index % tileColors.length])}
                  to={"/categoria/" + slug}
                >
                  <span className="grid size-11 place-items-center rounded-full bg-card/80 text-primary mobile:size-9">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <div>
                    <b className="block font-display text-[22px] leading-tight font-medium mobile:text-[17px]">{name}</b>
                    {categoryTaglines[slug] && <p className="mt-1 text-sm text-soft-ink mobile:text-xs">{categoryTaglines[slug]}</p>}
                  </div>
                  <ArrowRight size={18} className="justify-self-end text-primary motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {offers.length > 0 && highlights.length > 0 && <ProductShelf items={highlights} />}

      <section className="container-shell py-10">
        <div className="flex flex-wrap items-center justify-between gap-5 rounded-[22px] bg-deep px-8 py-7 text-primary-foreground mobile:px-5">
          <h2 className="font-display text-[29px] font-medium">Sua lista fica mais leve por aqui.</h2>
          <Link className={pillLink("light")} to="/catalogo">Explorar produtos <ArrowRight size={18} /></Link>
        </div>
      </section>
    </>
  );
}
