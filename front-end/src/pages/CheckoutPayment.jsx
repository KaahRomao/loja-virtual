import { QrCode, CreditCard, Banknote, ArrowLeft } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useStore } from "../hooks/useStore";
import { formatPrice, formatZip } from "../data/products";
import { CheckoutSteps, OrderSummary, EmptyCart } from "../components/CheckoutParts";
import Button from "../components/ui/Button";
import { cx, crumbLink, formCard, pillLink } from "../components/ui/styles";

const options = [
  { id: "pix", icon: QrCode, title: "Pix", text: "Aprovação na hora" },
  { id: "cartao", icon: CreditCard, title: "Cartão na entrega", text: "Débito ou crédito na maquininha" },
  { id: "dinheiro", icon: Banknote, title: "Dinheiro na entrega", text: "Informe se precisa de troco" },
];

export default function CheckoutPayment() {
  const { cartItems, address, payment, setPayment, total, placeOrder } = useStore();
  const navigate = useNavigate();

  // Sem endereço preenchido, volta para a etapa anterior
  if (cartItems.length && (!address.name || !address.zip)) return <Navigate to="/checkout/endereco" replace />;

  return (
    <section className="container-shell min-h-[620px] pt-[30px] pb-[90px]">
      <CheckoutSteps step={2} />
      <h1 className="mt-[18px] mb-[22px] font-display text-[34px] font-bold leading-[normal] text-deep">Como você quer pagar?</h1>
      {cartItems.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)_340px] items-start gap-7 tablet:grid-cols-[1fr]">
          <div className={formCard}>
            <div className="grid gap-2.5" role="radiogroup" aria-label="Forma de pagamento">
              {options.map(({ id, icon: Icon, title, text }) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={payment === id}
                  className={cx(
                    "flex items-center gap-3.5 rounded-[14px] border-2 p-4 text-left",
                    payment === id ? "border-primary bg-accent" : "border-border bg-background",
                  )}
                  onClick={() => setPayment(id)}
                >
                  <Icon className="text-primary" />
                  <span className="grid">
                    <b>{title}</b>
                    <small className="text-muted-foreground">{text}</small>
                  </span>
                </button>
              ))}
            </div>
            <div className="grid gap-1 rounded-[14px] bg-muted p-3.5 text-[14px]">
              <b>Entregar para {address.name}</b>
              <span>
                {address.street}, {address.number}
                {address.complement ? ` · ${address.complement}` : ""} · CEP {formatZip(address.zip)}
              </span>
              <Link className={crumbLink} to="/checkout/endereco">Alterar</Link>
            </div>
            <div className="mt-1.5 flex flex-wrap justify-between gap-2.5">
              <Link className={pillLink("outline", "md")} to="/checkout/endereco"><ArrowLeft size={16} /> Voltar</Link>
              <Button
                size="lg"
                onClick={() => {
                  placeOrder();
                  navigate("/checkout/confirmacao");
                }}
              >
                Confirmar pedido · {formatPrice(total)}
              </Button>
            </div>
          </div>
          <OrderSummary />
        </div>
      )}
    </section>
  );
}
