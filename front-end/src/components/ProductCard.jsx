import React from "react";

export function ProductCard({
  name,
  category,
  unit,
  price,
  oldPrice,
  isOffer,
  image,
  onAddToCart,
}) {
  return (
    <article className="w-80 h-96 relative bg-white rounded-md border border-gray-300 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
      {/* Imagem do Produto */}
      <div className="w-full h-64 relative bg-gray-100 overflow-hidden">
        <img
          src={image || "https://placehold.co/305x250"}
          alt={name}
          className="w-full h-full object-cover"
        />

        {/* Badge de Oferta */}
        {isOffer && (
          <div className="w-14 h-6 absolute top-3 left-3 bg-amber-500 rounded-xs flex items-center justify-center">
            <span className="text-teal-950 text-[10px] font-black font-['Nunito'] uppercase">
              Oferta
            </span>
          </div>
        )}

        {/* Ícone de Favorito */}
        <button
          className="absolute top-2.5 right-3 text-teal-700 text-2xl font-normal font-['Nunito'] hover:scale-110 transition-transform cursor-pointer"
          aria-label="Favoritar produto"
        >
          ♡
        </button>
      </div>

      {/* Detalhes do Produto */}
      <div className="p-4 flex flex-col justify-between flex-1 relative">
        <div>
          <span className="text-teal-700 text-[10px] font-black font-['Nunito'] uppercase tracking-wider block">
            {category}
          </span>
          <h3 className="text-emerald-800 text-lg font-medium font-['Fredoka'] leading-snug mt-0.5">
            {name}
          </h3>
          <p className="text-gray-600 text-xs font-normal font-['Nunito'] mt-0.5">
            {unit}
          </p>
        </div>

        {/* Preço e Botão de Adicionar */}
        <div className="flex items-end justify-between mt-2 pt-2">
          <div className="flex flex-col">
            {oldPrice && (
              <span className="text-gray-600 text-xs font-normal font-['Nunito'] line-through leading-tight">
                R$ {oldPrice.toFixed(2).replace(".", ",")}
              </span>
            )}
            <strong className="text-emerald-800 text-2xl font-semibold font-['Fredoka'] leading-7">
              R$ {price.toFixed(2).replace(".", ",")}
            </strong>
          </div>

          <button
            onClick={onAddToCart}
            className="w-9 h-9 bg-teal-700 rounded-md flex items-center justify-center text-white text-xl font-normal font-['Nunito'] hover:bg-teal-800 transition-colors cursor-pointer"
            aria-label={`Adicionar ${name} ao carrinho`}
          >
            +
          </button>
        </div>
      </div>
    </article>
  );
}
