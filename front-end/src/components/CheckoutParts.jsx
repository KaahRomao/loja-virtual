import { Check, ShoppingBasket, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "../hooks/useStore";
import { formatPrice } from "../data/products";
import { cx, noteBox, panel, pillLink } from "./ui/styles";

// Tela/bloco mostrado quando não há nada no carrinho
export function EmptyCart({ onAction }) {
  return (
    <div className="px-[15px] py-[90px] text-center">
      <ShoppingBasket size={48} className="m-auto text-primary" />
      <h3 className="mt-[17px] font-display text-[24px] font-medium leading-[normal]">Seu carrinho está vazio</h3>
      <p className="mt-2 mb-6 text-[14px] text-muted-foreground">Que tal encontrar algo gostoso para começar?</p>
      <Link className={pillLink("primary", "md")} to="/catalogo?ofertas=true" onClick={onAction}>
        Ver ofertas da semana <ArrowRight size={16} />
      </Link>
    </div>
  );
}

const steps = ["Carrinho", "Endereço", "Pagamento", "Confirmação"];

// step: 0..3 = etapa atual; 4 = tudo concluído
export function CheckoutSteps({ step }) {
  return (
    <ol className="flex flex-wrap gap-2 p-0">
      {steps.map((label, i) => (
        <li
          key={label}
          className={cx(
            "flex items-center gap-2 rounded-full border bg-card py-1.5 pr-3.5 pl-1.5 text-[13px] font-bold",
            i === step ? "border-primary text-primary" : "border-border text-muted-foreground",
          )}
        >
          <span
            className={cx(
              "grid size-6 place-items-center rounded-[50%] text-[12px]",
              i <= step ? "bg-primary text-primary-foreground" : "bg-muted",
            )}
          >
            {i < step ? <Check size={14} /> : i + 1}
          </span>
          {label}
        </li>
      ))}
    </ol>
  );
}

export function OrderSummary() {
  const { totalItems, total } = useStore();
  return (
    <aside className={cx(panel, "grid gap-2.5")}>
      <h2 className="font-display text-[20px] font-semibold leading-[normal]">Resumo</h2>
      <div className="flex justify-between"><span>Itens</span><b>{totalItems}</b></div>
      <div className="flex justify-between"><span>Subtotal</span><b>{formatPrice(total)}</b></div>
      <div className="flex justify-between"><span>Entrega</span><b className="text-primary">Grátis</b></div>
      <div className="flex justify-between border-t border-border pt-2.5 text-[18px]"><span>Total</span><b>{formatPrice(total)}</b></div>
      <p className={noteBox}>Demonstração: nenhum pedido ou pagamento é real.</p>
    </aside>
  );
}
