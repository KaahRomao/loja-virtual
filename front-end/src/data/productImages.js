const illustratedProducts = new Set([
  "banana-prata", "maca-fuji", "tomate-italiano", "alface-crespa", "arroz-5kg",
  "feijao-carioca", "macarrao-espaguete", "cafe-500g", "suco-laranja-1l",
  "agua-15l", "refrigerante-cola-2l", "leite-integral-1l", "mussarela-200g",
  "iogurte-natural", "pao-frances", "pao-de-forma",
]);

export function productImages({ imageUrl, name }) {
  const slug = /^\/img\/produtos\/([a-z0-9-]+)\.jpg$/.exec(imageUrl ?? "")?.[1];
  if (illustratedProducts.has(slug)) {
    return [
      { url: "/img/produtos/vora/" + slug + "-1.webp", alt: name + " — vista principal", illustrative: true },
      { url: "/img/produtos/vora/" + slug + "-2.webp", alt: name + " — outro ângulo", illustrative: true },
    ];
  }
  return imageUrl ? [{ url: imageUrl, alt: name }] : [];
}
