import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "../hooks/useStore";
import { discountPercent, formatPrice, stockStatus } from "../data/products";
import ProductPhoto from "./ProductPhoto";
import ProductQuantity from "./ProductQuantity";
import Button from "./ui/Button";

export default function ProductCard({ product, featured = false }) {
  const { favorites, toggleFavorite } = useStore();
  const favorite = favorites.includes(product.id);
  const discount = discountPercent(product);
  const to = "/produto/" + product.id;

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-card border bg-card shadow-card motion-safe:transition-[translate,box-shadow] motion-safe:hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="relative bg-cream">
        <Link className="block aspect-[1.14] overflow-hidden mobile:aspect-square" aria-label={"Ver detalhes de " + product.name} to={to}>
          <ProductPhoto product={product} className="motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105" />
        </Link>
        {discount > 0 ? (
          <span className="pointer-events-none absolute top-2.5 left-2.5 rounded-full bg-destructive px-2.5 py-1 text-xs font-black text-white">
            {discount < 1 ? "<1% de desconto" : "−" + Math.floor(discount) + "%"}
          </span>
        ) : featured && (
          <span className="pointer-events-none absolute top-2.5 left-2.5 rounded-full bg-amber px-2.5 py-1 text-[11px] font-black text-deep">Destaque</span>
        )}
        <Button
          variant="outline"
          size="iconSm"
          className="absolute top-2 right-2 rounded-full bg-card text-primary"
          aria-label={"Favoritar " + product.name}
          aria-pressed={favorite}
          onClick={() => toggleFavorite(product.id)}
        >
          <Heart size={17} fill={favorite ? "currentColor" : "none"} />
        </Button>
      </div>

      <div className="flex flex-1 flex-col p-3.5 mobile:p-2.5">
        <span className="text-[10px] font-black tracking-wide text-primary uppercase">{product.categoryName}</span>
        <h3 className="mt-1 font-display text-[17px] font-medium leading-tight text-deep mobile:text-[15px]">
          <Link className="hover:underline" to={to}>{product.name}</Link>
        </h3>
        {product.unit && <p className="mt-1 text-xs text-muted-foreground">{product.unit}</p>}
        <div className="mt-auto pt-3">
          {discount > 0 && <del className="block text-xs text-muted-foreground">{formatPrice(product.oldPrice)}</del>}
          <strong className="block font-display text-[26px] font-semibold leading-none text-deep mobile:text-[22px]">
            {formatPrice(product.price)}
          </strong>
          {stockStatus(product.stock) === "baixo" && <p className="mt-1 text-xs font-extrabold text-destructive">Últimas unidades</p>}
        </div>
        <div className="mt-3 flex min-h-10 justify-center">
          <ProductQuantity product={product} />
        </div>
      </div>
    </article>
  );
}
