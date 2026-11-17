import { useEffect } from "react";
import { X, Trash2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "../hooks/useStore";
import { formatPrice } from "../data/products";
import ProductPhoto from "./ProductPhoto";
import QuantityStepper from "./QuantityStepper";
import Button from "./ui/Button";
import { EmptyCart } from "./CheckoutParts";
import { eyebrow, pillLink } from "./ui/styles";

export default function CartDrawer() {
  const { cartOpen, setCartOpen, cartItems, totalItems, total, setQuantity, removeItem } = useStore();

  // Esc fecha o carrinho
  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (e) => e.key === "Escape" && setCartOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cartOpen, setCartOpen]);

  if (!cartOpen) return null;
  const close = () => setCartOpen(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-[oklch(16%_.02_175/.52)]" onClick={close}>
      <aside
        className="flex h-full w-[min(440px,100%)] flex-col bg-card shadow-[-15px_0_50px_oklch(18%_.02_175/.18)]"
        role="dialog"
        aria-modal="true"
        aria-label="Seu carrinho"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border p-6">
          <div>
            <span className={eyebrow}>SUA COMPRA</span>
            <h2 className="font-display text-[26px] font-[550] leading-[normal]">
              Meu carrinho{" "}
              <span className="rounded-[50%] bg-pale px-2 py-[3px] align-middle font-sans text-[12px] font-bold leading-[normal] text-primary">
                {totalItems}
              </span>
            </h2>
          </div>
          <Button variant="ghost" size="icon" aria-label="Fechar carrinho" onClick={close}>
            <X size={16} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          {cartItems.length === 0 ? (
            <EmptyCart onAction={close} />
          ) : (
            cartItems.map((item) => (
              <div className="flex gap-[15px] border-b border-border py-[19px]" key={item.id}>
                <div className="h-[95px] flex-[0_0_95px] overflow-hidden rounded-[5px]">
                  <ProductPhoto product={item} />
                </div>
                <div className="flex-1">
                  <b className="block font-display text-[17px] font-medium leading-[normal]">{item.name}</b>
                  <small className="block text-muted-foreground">{item.unit}</small>
                  <strong className="mt-[5px] block text-deep">{formatPrice(item.price * item.qty)}</strong>
                  <div className="mt-2 flex items-center justify-between">
                    <QuantityStepper
                      value={item.qty}
                      label={item.name}
                      onMinus={() => setQuantity(item.id, -1)}
                      onPlus={() => setQuantity(item.id, 1)}
                    />
                    <Button variant="ghost" size="iconSm" aria-label={`Remover ${item.name}`} onClick={() => removeItem(item.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-border px-6 pt-[21px] pb-[26px]">
            <div className="mt-6 flex justify-between text-[15px]">
              <span>Subtotal</span>
              <b className="font-display text-[24px] font-[550] leading-[normal] text-deep">{formatPrice(total)}</b>
            </div>
            <p className="mt-[5px] mb-[15px] text-[11px] text-muted-foreground">A entrega é calculada no carrinho.</p>
            <Link className={pillLink("primary", "lg")} to="/carrinho" onClick={close}>
              Ver carrinho e finalizar <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
