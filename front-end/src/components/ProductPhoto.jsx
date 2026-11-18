import { useState } from "react";
import { sheets } from "../assets";

const recortes = {
  "/img/produtos/arroz-5kg.jpg": [sheets.comida, "0% 0%"],
  "/img/produtos/feijao-carioca.jpg": [sheets.comida, "50% 0%"],
  "/img/produtos/macarrao-espaguete.jpg": [sheets.comida, "100% 0%"],
  "/img/produtos/alface-crespa.jpg": [sheets.comida, "100% 100%"],
  "/img/produtos/tomate-italiano.jpg": [sheets.comida, "100% 100%"],
  "/img/produtos/iogurte-natural.jpg": [sheets.snacks, "50% 100%"],
};

// Foto vinda de product.imageUrl (pasta public/img/produtos). Se faltar, mostra a inicial do produto.
export default function ProductPhoto({ product }) {
  const [imagemComErro, setImagemComErro] = useState(null);

  if (product.imageUrl && imagemComErro !== product.imageUrl) {
    return (
      <img
        src={product.imageUrl}
        alt={product.name}
        loading="lazy"
        onError={() => setImagemComErro(product.imageUrl)}
        className="size-full bg-surface object-cover"
      />
    );
  }

  const recorte = recortes[product.imageUrl];
  if (recorte) {
    const [imagem, posicao] = recorte;
    return (
      <div role="img" aria-label={product.name} className="size-full bg-surface"
        style={{ backgroundImage: `url(${imagem})`, backgroundSize: "300% 300%", backgroundPosition: posicao }}
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
