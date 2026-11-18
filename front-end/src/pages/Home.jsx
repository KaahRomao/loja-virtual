import { useRef } from "react";
import {
  Apple, ArrowLeft, ArrowRight, Carrot, CupSoda, Milk, ShoppingBasket,
  Snowflake, Wheat,
} from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import PromotionCarousel from "../components/PromotionCarousel";
import SectionHeading from "../components/SectionHeading";
import { categoryTaglines, discountPercent, storeCategories } from "../data/products";
import { useStore } from "../hooks/useStore";
import { cx, textArrow } from "../components/ui/styles";

const categoryIcons = {
  frutas: Apple,
  "legumes-e-verduras": Carrot,
  mercearia: ShoppingBasket,
  bebidas: CupSoda,
  "laticinios-e-frios": Milk,
  padaria: Wheat,
  congelados: Snowflake,
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
  const title = offers ? "Produtos em oferta" : "Em destaque";

  function scroll(direction) {
    const track = rail.current;
    track.scrollBy({ left: track.clientWidth * direction * 0.85 });
  }

  return (
    <section id={offers ? "ofertas" : "destaques"} className="container-shell py-14 mobile:py-9">
      <SectionHeading
        title={title}
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
      <PromotionCarousel offers={offers} />

      {offers.length > 0 ? <ProductShelf items={offers} offers /> : highlights.length > 0 && <ProductShelf items={highlights} />}

      <section className="bg-secondary/50 py-14 mobile:py-9">
        <div className="container-shell">
          <SectionHeading title="Compre por categoria" />
          <div className="grid grid-cols-3 gap-3 mobile:grid-cols-2">
            {Object.entries(storeCategories(categoryNames)).map(([slug, name], index) => {
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

    </>
  );
}
