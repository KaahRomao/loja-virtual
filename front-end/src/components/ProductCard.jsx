import { Heart, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "../hooks/useStore";
import { formatPrice } from "../data/products";
import ProductPhoto from "./ProductPhoto";
import Button from "./ui/Button";

export default function ProductCard({ product }) {
  const { cart, setQuantity, favorites, toggleFavorite, categoryNames } = useStore();
  const fav = favorites.includes(product.id);
  const disponivel = product.stock > (cart[product.id] || 0);
  const to = `/produto/${product.id}`;

  return (
    <article className="min-w-0 overflow-hidden rounded-[7px] border border-border bg-card shadow-card transition-[translate,box-shadow] duration-200 hover:-translate-y-[3px] hover:shadow-card-hover motion-reduce:transition-none">
      <Link className="relative block aspect-[1.22] cursor-pointer bg-surface tiny:aspect-square" aria-label={`Ver detalhes de ${product.name}`} to={to}>
        <ProductPhoto product={product} />
        {product.oldPrice && (
          <span className="absolute top-3 left-3 rounded-[3px] bg-amber px-2 py-[5px] text-[10px] font-black text-foreground">OFERTA</span>
        )}
        <button
          className="absolute top-[9px] right-[9px] inline-flex size-[34px] items-center justify-center rounded-full bg-card text-primary"
          aria-label={`Favoritar ${product.name}`}
          aria-pressed={fav}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(product.id);
          }}
        >
          <Heart size={17} fill={fav ? "currentColor" : "none"} />
        </button>
      </Link>
      <div className="p-4 mobile:p-3 tiny:p-2.5">
        <span className="block text-[10px] font-black tracking-[.08em] text-primary uppercase">{categoryNames[product.category]}</span>
        <h3 className="mt-[5px] cursor-pointer overflow-hidden font-display text-[18px] font-medium text-ellipsis whitespace-nowrap text-deep mobile:text-[15px]">
          <Link to={to}>{product.name}</Link>
        </h3>
        <p className="mt-[3px] text-[12px] text-muted-foreground">{product.unit}</p>
        <div className="mt-3 flex min-h-[54px] items-end justify-between gap-[5px] mobile:min-h-12">
          <div>
            {product.oldPrice && (
              <span className="block text-[12px] leading-[1.3] text-muted-foreground line-through">{formatPrice(product.oldPrice)}</span>
            )}
            <strong className="block font-display text-[24px] font-semibold leading-[1.1] text-deep mobile:text-[20px] tiny:text-[18px]">
              {formatPrice(product.price)}
            </strong>
          </div>
          {product.stock === 0 && <span className="text-xs text-muted-foreground">Esgotado</span>}
          <Button variant="primary" size="icon" disabled={!disponivel} aria-label={`Adicionar ${product.name} ao carrinho`} onClick={() => setQuantity(product.id, 1)}>
            <Plus size={16} />
          </Button>
        </div>
      </div>
    </article>
  );
}
