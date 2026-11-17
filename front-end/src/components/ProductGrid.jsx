import ProductCard from "./ProductCard";
import { cx } from "./ui/styles";

// Grade de produtos. "catalog" tem 3 colunas (a lateral de filtros ocupa espaço); o resto tem 4.
export default function ProductGrid({ items, catalog = false }) {
  return (
    <div
      className={cx(
        "grid gap-[18px] mobile:grid-cols-2 mobile:gap-2.5",
        catalog ? "grid-cols-3 compact:grid-cols-2" : "grid-cols-4",
      )}
    >
      {items.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
