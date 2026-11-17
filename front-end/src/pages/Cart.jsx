import { useState } from "react";
import { Trash2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "../hooks/useStore";
import { formatPrice, formatZip, validateZip } from "../data/products";
import ProductPhoto from "../components/ProductPhoto";
import QuantityStepper from "../components/QuantityStepper";
import Button from "../components/ui/Button";
import { CheckoutSteps, OrderSummary, EmptyCart } from "../components/CheckoutParts";
import { cx, formError, formInput, panel, pillLink, textArrow } from "../components/ui/styles";

export default function Cart() {
  const { cartItems, setQuantity, removeItem, address, setAddress } = useStore();
  const [zip, setZip] = useState(address.zip ? formatZip(address.zip) : "");
  const [feedback, setFeedback] = useState(null);

  const calc = () => {
    const err = validateZip(zip);
    if (err) return setFeedback({ error: true, text: err });
    setAddress((a) => ({ ...a, zip: zip.replace(/\D/g, "") }));
    setFeedback({ error: false, text: "Boa notícia! A entrega para o seu CEP é grátis." });
  };

  return (
    <section className="container-shell min-h-[620px] pt-[30px] pb-[90px]">
      <CheckoutSteps step={0} />
      <h1 className="mt-[18px] mb-[22px] font-display text-[34px] font-bold leading-[normal] text-deep">Meu carrinho</h1>
      {cartItems.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)_340px] items-start gap-7 tablet:grid-cols-[1fr]">
          <div className="grid gap-3">
            {cartItems.map((item) => (
              <div
                className="grid grid-cols-[74px_1fr_auto_100px_auto] items-center gap-4 rounded-[16px] border border-border bg-card p-3 mobile:grid-cols-[60px_1fr_auto]"
                key={item.id}
              >
                <Link className="block size-[74px] overflow-hidden rounded-[12px] mobile:size-[60px]" to={`/produto/${item.id}`}>
                  <ProductPhoto product={item} />
                </Link>
                <div className="grid">
                  <b className="block font-display text-[17px] font-medium leading-[normal]">{item.name}</b>
                  <small className="block text-muted-foreground">{item.unit} · {formatPrice(item.price)} cada</small>
                </div>
                <QuantityStepper
                  value={item.qty}
                  label={item.name}
                  onMinus={() => setQuantity(item.id, -1)}
                  onPlus={() => setQuantity(item.id, 1)}
                />
                <strong>{formatPrice(item.price * item.qty)}</strong>
                <Button variant="ghost" size="iconSm" aria-label={`Remover ${item.name}`} onClick={() => removeItem(item.id)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
            <div className={panel}>
              <label className="mb-2 block font-extrabold" htmlFor="cep">Calcular entrega</label>
              <div className="flex gap-2">
                <input
                  className={formInput}
                  id="cep"
                  inputMode="numeric"
                  placeholder="00000-000"
                  value={zip}
                  maxLength={9}
                  onChange={(e) => setZip(formatZip(e.target.value))}
                />
                <Button variant="outline" size="md" onClick={calc}>Calcular</Button>
              </div>
              {feedback && (
                <p className={feedback.error ? formError : "bg-pale px-6 py-3 text-[13px]"}>{feedback.text}</p>
              )}
            </div>
          </div>
          <div>
            <OrderSummary />
            <Link className={cx(pillLink("primary", "lg"), "mt-3.5 w-full")} to="/checkout/endereco">
              Continuar compra <ArrowRight size={18} />
            </Link>
            <Link className={cx(textArrow, "mt-3 w-full justify-center")} to="/catalogo">Continuar comprando</Link>
          </div>
        </div>
      )}
    </section>
  );
}
