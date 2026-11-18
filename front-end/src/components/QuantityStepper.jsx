import { Minus, Plus } from "lucide-react";
import Button from "./ui/Button";
import { cx } from "./ui/styles";

export default function QuantityStepper({ value, onMinus, onPlus, label, big, max }) {
  return (
    <div className={cx("flex items-center rounded-[5px] border border-border text-primary", big ? "h-11 px-1.5" : "h-9")}>
      <Button variant="ghost" size="step" aria-label={label ? `Diminuir ${label}` : "Diminuir quantidade"} onClick={onMinus}>
        <Minus size={13} />
      </Button>
      <span className="min-w-[19px] text-center text-[13px] font-black">{value}</span>
      <Button variant="ghost" size="step" aria-label={label ? `Aumentar ${label}` : "Aumentar quantidade"} onClick={onPlus} disabled={max !== undefined && value >= max}>
        <Plus size={13} />
      </Button>
    </div>
  );
}
