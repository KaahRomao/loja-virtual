import { CircleCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "../hooks/useStore";
import { formatPrice, paymentLabels } from "../data/products";
import { CheckoutSteps, EmptyCart } from "../components/CheckoutParts";
import { cx, noteBox, pillLink } from "../components/ui/styles";

export default function CheckoutConfirmation() {
  const { lastOrder, address } = useStore();

  return (
    <section className="container-shell min-h-[620px] pt-[30px] pb-[90px]">
      <CheckoutSteps step={lastOrder ? 4 : 3} />
      {!lastOrder ? (
        <EmptyCart />
      ) : (
        <div className="grid min-h-[440px] place-content-center justify-items-center gap-3 py-[60px] text-center text-primary">
          <CircleCheck size={60} />
          <h1 className="font-display text-[32px] font-bold leading-[normal] text-deep">Tudo certo!</h1>
          <p className="max-w-[420px] text-muted-foreground">Seu pedido já está sendo preparado com carinho.</p>
          <div className="grid min-w-[min(380px,90vw)] gap-2 rounded-[18px] border border-border bg-card px-[22px] py-[18px] text-foreground">
            <div className="flex justify-between gap-5"><span className="text-muted-foreground">Pedido</span><b>{lastOrder.code}</b></div>
            <div className="flex justify-between gap-5"><span className="text-muted-foreground">Itens</span><b>{lastOrder.items}</b></div>
            <div className="flex justify-between gap-5"><span className="text-muted-foreground">Total</span><b>{formatPrice(lastOrder.total)}</b></div>
            <div className="flex justify-between gap-5"><span className="text-muted-foreground">Pagamento</span><b>{paymentLabels[lastOrder.payment]}</b></div>
            <div className="flex justify-between gap-5"><span className="text-muted-foreground">Entrega</span><b>{address.street}, {address.number}</b></div>
          </div>
          <p className={cx(noteBox, "max-w-[420px] text-muted-foreground")}>Demonstração: nenhum pedido foi enviado de verdade.</p>
          <Link className={pillLink("primary", "md")} to="/">Voltar às compras</Link>
        </div>
      )}
    </section>
  );
}
