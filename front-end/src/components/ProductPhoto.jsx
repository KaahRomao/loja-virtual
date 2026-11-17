import { useState } from "react";

// Foto vinda de product.imageUrl (pasta public/img/produtos). Se faltar, mostra a inicial do produto.
export default function ProductPhoto({ product }) {
  const [falhou, setFalhou] = useState(false);

  if (product.imageUrl && !falhou) {
    return (
      <img
        src={product.imageUrl}
        alt={product.name}
        loading="lazy"
        onError={() => setFalhou(true)}
        className="size-full bg-surface object-cover"
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={product.name}
      className="grid size-full place-items-center bg-pale font-display text-[44px] font-semibold text-primary"
    >
      {product.name.charAt(0)}
    </div>
  );
}
