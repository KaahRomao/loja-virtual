import { ChevronRight, Heart, ShoppingBasket, Truck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { discountPercent, formatPrice, stockStatus } from "../data/products";
import { useStore } from "../hooks/useStore";
import ProductGallery from "../components/ProductGallery";
import ProductGrid from "../components/ProductGrid";
import ProductQuantity from "../components/ProductQuantity";
import SectionHeading from "../components/SectionHeading";
import Button from "../components/ui/Button";
import NotFound from "./NotFound";
import { eyebrow, panel, pillLink } from "../components/ui/styles";

function Detail({ product }) {
  const { products, cart, favorites, toggleFavorite } = useStore();
  const inCart = cart[product.id] > 0;
  const favorite = favorites.includes(product.id);
  const discount = discountPercent(product);
  const related = products.filter((other) => other.category === product.category && other.name !== product.name).slice(0, 4);

  return (
    <section className="container-shell pb-16 mobile:pb-10">
      <nav aria-label="Caminho do produto" className="flex flex-wrap items-center gap-1.5 pt-5 text-xs font-bold text-muted-foreground">
        <Link className="hover:underline" to="/">Início</Link>
        <ChevronRight size={13} aria-hidden="true" />
        <Link className="hover:underline" to={"/categoria/" + product.category}>{product.categoryName}</Link>
      </nav>

      <div className="mt-5 mb-14 grid grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] items-start gap-8 tablet:gap-4 mobile:grid-cols-1">
        <ProductGallery product={product} />
        <div className={panel}>
          <span className={eyebrow}>{product.categoryName.toUpperCase()}</span>
          <h1 className="mt-2 font-display text-[clamp(30px,4vw,42px)] font-semibold leading-[1.08] text-deep">{product.name}</h1>
          {product.unit && <p className="mt-1 text-sm text-muted-foreground">{product.unit}</p>}
          {product.description && <p className="mt-4 text-sm leading-relaxed text-foreground">{product.description}</p>}
          <div className="my-5 border-y py-4">
            {discount > 0 && (
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <del className="text-sm text-muted-foreground">{formatPrice(product.oldPrice)}</del>
                <span className="rounded-full bg-destructive px-2.5 py-1 text-xs font-black text-white">
                  {discount < 1 ? "<1% de desconto" : "−" + Math.floor(discount) + "%"}
                </span>
              </div>
            )}
            <strong className="font-display text-[37px] leading-none font-semibold text-deep">{formatPrice(product.price)}</strong>
            {stockStatus(product.stock) === "baixo" && <p className="mt-2 text-sm font-extrabold text-destructive">Últimas unidades</p>}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <ProductQuantity product={product} large />
            <Button variant="outline" size="icon" aria-label={"Favoritar " + product.name} aria-pressed={favorite} onClick={() => toggleFavorite(product.id)}>
              <Heart size={18} fill={favorite ? "currentColor" : "none"} />
            </Button>
          </div>
          {inCart && <Link className={pillLink("outline", "md") + " mt-3"} to="/carrinho"><ShoppingBasket size={16} /> Ver carrinho</Link>}
          <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
            <Truck size={18} className="shrink-0 text-primary" aria-hidden="true" /> Entrega calculada pelo CEP no carrinho.
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <>
          <SectionHeading title="Produtos parecidos" />
          <ProductGrid items={related} />
        </>
      )}
    </section>
  );
}

export default function ProductDetail() {
  const { products } = useStore();
  const { id } = useParams();
  const product = products.find((item) => item.id === Number(id));
  return product ? <Detail key={product.id} product={product} /> : <NotFound />;
}
