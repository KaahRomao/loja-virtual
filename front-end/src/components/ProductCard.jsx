import React from "react";

export function ProductCard({
  id,
  name,
  category,
  unit,
  price,
  oldPrice,
  isOffer,
  image,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
}) {
  return (
    <article className="w-full max-w-[320px] bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200">
      {/* Imagem do Produto */}
      <div className="w-full h-56 relative bg-gray-50 flex items-center justify-center overflow-hidden">
        <img
          src={
            image ||
            "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80"
          }
          alt={name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />

        {/* Badge de Oferta */}
        {isOffer && (
          <div className="absolute top-3 left-3 bg-amber-500 text-emerald-950 text-[10px] font-black font-['Nunito'] uppercase px-2.5 py-1 rounded-md shadow-xs">
            OFERTA
          </div>
        )}

        {/* Ícone de Favorito */}
        <button
          onClick={() => onToggleFavorite && onToggleFavorite(id)}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-xs transition-transform hover:scale-110 ${
            isFavorite
              ? "bg-red-50 text-red-500"
              : "bg-white/90 text-emerald-700 hover:text-red-500"
          }`}
          aria-label="Favoritar produto"
        >
          {isFavorite ? "♥" : "♡"}
        </button>
      </div>

      {/* Detalhes do Produto */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <span className="text-emerald-700 text-[10px] font-black font-['Nunito'] uppercase tracking-wider block">
            {category}
          </span>
          <h3 className="text-emerald-900 text-base font-semibold font-['Fredoka'] leading-snug mt-1">
            {name}
          </h3>
          <p className="text-gray-500 text-xs font-normal font-['Nunito'] mt-0.5">
            {unit}
          </p>
        </div>

        {/* Preço e Botão Adicionar */}
        <div className="flex items-end justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex flex-col">
            {oldPrice && (
              <span className="text-gray-400 text-xs font-normal font-['Nunito'] line-through leading-tight">
                R$ {oldPrice.toFixed(2).replace(".", ",")}
              </span>
            )}
            <strong className="text-emerald-900 text-xl font-bold font-['Fredoka']">
              R$ {price.toFixed(2).replace(".", ",")}
            </strong>
          </div>

          <button
            onClick={() =>
              onAddToCart &&
              onAddToCart({
                id,
                name,
                category,
                unit,
                price,
                oldPrice,
                isOffer,
                image,
              })
            }
            className="w-9 h-9 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg flex items-center justify-center text-xl font-medium transition-colors cursor-pointer shadow-xs"
            aria-label={`Adicionar ${name} ao carrinho`}
          >
            +
          </button>
        </div>
      </div>
    </article>
  );
}
