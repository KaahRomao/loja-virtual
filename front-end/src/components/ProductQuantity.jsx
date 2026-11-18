import { Plus } from "lucide-react";
import { useStore } from "../hooks/useStore";
import QuantityStepper from "./QuantityStepper";
import Button from "./ui/Button";

export default function ProductQuantity({ product, large = false }) {
  const { cart, setQuantity } = useStore();
  const count = cart[product.id] || 0;

  if (count > 0) {
    return (
      <QuantityStepper
        value={count}
        label={product.name}
        max={product.stock}
        big={large}
        onMinus={() => setQuantity(product.id, -1)}
        onPlus={() => setQuantity(product.id, 1)}
      />
    );
  }

  return (
    <Button
      size={large ? "lg" : "md"}
      className={large ? "" : "w-full px-2"}
      disabled={product.stock <= 0}
      aria-label={product.stock > 0 ? "Adicionar " + product.name + " ao carrinho" : undefined}
      onClick={() => setQuantity(product.id, 1)}
    >
      {product.stock > 0 ? <><Plus size={16} aria-hidden="true" /> {large ? "Adicionar ao carrinho" : "Adicionar"}</> : "Esgotado"}
    </Button>
  );
}
