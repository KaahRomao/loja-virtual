import { Minus, Plus } from "lucide-react";
import Button from "./ui/Button";
import { cx } from "./ui/styles";

export default function QuantityStepper({ value, onMinus, onPlus, label, big, max }) {
  return (
    <div className={cx("inline-flex shrink-0 items-center rounded-control border bg-accent/60 text-primary", big ? "min-h-11 px-1.5" : "min-h-10")}>
      <Button variant="ghost" size="step" aria-label={label ? `Diminuir ${label}` : "Diminuir quantidade"} onClick={onMinus}>
        <Minus size={13} />
      </Button>
      <span className="min-w-6 text-center text-[13px] font-black" aria-live="polite">{value}</span>
      <Button variant="ghost" size="step" aria-label={label ? `Aumentar ${label}` : "Aumentar quantidade"} onClick={onPlus} disabled={max !== undefined && value >= max}>
        <Plus size={13} />
      </Button>
    </div>
  );
}
