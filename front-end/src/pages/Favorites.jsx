import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import ProductGrid from "../components/ProductGrid";
import { pillLink } from "../components/ui/styles";
import { useStore } from "../hooks/useStore";

export default function Favorites() {
  const { favorites, products } = useStore();
  const items = products.filter((product) => favorites.includes(product.id));

  return (
    <section className="container-shell py-10">
      <h1 className="mb-6 font-display text-3xl font-semibold text-deep">Favoritos</h1>
      {items.length > 0 ? <ProductGrid items={items} /> : (
        <div className="grid justify-items-center gap-3 rounded-card border bg-card px-4 py-12 text-center">
          <Heart size={32} className="text-primary" aria-hidden="true" />
          <p>Toque no coração de um produto para encontrá-lo aqui.</p>
          <Link className={pillLink("primary")} to="/catalogo">Ver catálogo</Link>
        </div>
      )}
    </section>
  );
}
