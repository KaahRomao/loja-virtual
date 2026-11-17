import { useState } from "react";
import { ShoppingBasket, Heart, Truck } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { products, formatPrice } from "../data/products";
import { useStore } from "../hooks/useStore";
import ProductGrid from "../components/ProductGrid";
import ProductPhoto from "../components/ProductPhoto";
import QuantityStepper from "../components/QuantityStepper";
import SectionHeading from "../components/SectionHeading";
import Button from "../components/ui/Button";
import NotFound from "./NotFound";
import { eyebrow } from "../components/ui/styles";

// A página fica em um componente interno com key={id}: ao trocar de produto, a quantidade volta para 1.
function Detail({ product }) {
  const { setQuantity, setCartOpen, favorites, toggleFavorite, categoryNames } = useStore();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);

  const fav = favorites.includes(product.id);
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <section className="container-shell pb-20">
      <div className="flex items-center gap-[9px] pt-6 text-[12px] text-muted-foreground">
        <Link className="hover:underline" to="/">Início</Link>
        <span>/</span>
        <Link className="hover:underline" to={`/categoria/${product.category}`}>{categoryNames[product.category]}</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <div className="mt-[18px] mb-[60px] grid grid-cols-[1fr_1fr] gap-12 tablet:grid-cols-[1fr]">
        <div className="relative aspect-square overflow-hidden rounded-[24px] bg-card shadow-card">
          <ProductPhoto product={product} />
          {product.oldPrice && (
            <span className="absolute top-3 left-3 rounded-[3px] bg-amber px-2 py-[5px] text-[10px] font-black text-foreground">OFERTA</span>
          )}
        </div>
        <div className="flex flex-col justify-center gap-2.5">
          <span className={eyebrow}>{categoryNames[product.category]}</span>
          <h1 className="font-display text-[40px] font-bold leading-[1.1] text-deep mobile:text-[30px]">{product.name}</h1>
          <span className="text-[13px] text-muted-foreground">{product.unit}</span>
          <p>{product.description}</p>
          {product.oldPrice && (
            <span className="block text-[12px] leading-[1.3] text-muted-foreground line-through">De {formatPrice(product.oldPrice)}</span>
          )}
          <strong className="mt-[3px] mb-[25px] block font-display text-[34px] font-semibold leading-[normal] text-deep">
            {formatPrice(product.price)}
          </strong>
          {product.oldPrice && (
            <span className="self-start rounded-[20px] bg-accent px-3 py-1 text-[13px] font-extrabold text-deep">
              Você economiza {formatPrice(product.oldPrice - product.price)}
            </span>
          )}
          <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
            <QuantityStepper big value={qty} onMinus={() => setQty((q) => Math.max(1, q - 1))} onPlus={() => setQty((q) => q + 1)} />
            <Button
              size="lg"
              onClick={() => {
                setQuantity(product.id, qty);
                navigate("/carrinho");
              }}
            >
              <ShoppingBasket size={16} /> Comprar agora
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setQuantity(product.id, qty);
                setCartOpen(true);
              }}
            >
              Adicionar ao carrinho
            </Button>
            <Button variant="outline" size="icon" aria-label="Favoritar" aria-pressed={fav} onClick={() => toggleFavorite(product.id)}>
              <Heart size={16} fill={fav ? "currentColor" : "none"} />
            </Button>
          </div>
          <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <Truck size={16} /> Entrega calculada pelo CEP no carrinho.
          </p>
        </div>
      </div>

      <SectionHeading className="mb-5" label="COMBINA COM SUA LISTA" title="Produtos parecidos" />
      <ProductGrid items={related} />
    </section>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const product = products.find((p) => p.id === Number(id));
  if (!product) return <NotFound />;
  return <Detail key={product.id} product={product} />;
}
