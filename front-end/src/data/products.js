// Textos e formatadores compartilhados pela loja e pelo painel.

export const categoryTaglines = {
  frutas: "Fresquinhas, direto pra sua mesa",
  "legumes-e-verduras": "Frescor para o dia a dia",
  mercearia: "O essencial da sua despensa",
  bebidas: "Para matar a sede",
  "laticinios-e-frios": "Cremosos e fresquinhos",
  padaria: "Quentinho para o café",
};

export const formatPrice = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    v,
  );

export function discountPercent({ price, oldPrice }) {
  if (!(oldPrice > price && price >= 0)) return 0;
  return (oldPrice - price) * 100 / oldPrice + 1e-9;
}

export const formatZip = (v) =>
  v.replace(/\D/g, "").slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2");

export function validateZip(v) {
  const digits = v.replace(/\D/g, "");
  if (digits.length !== 8) return "Digite um CEP com 8 números.";
  return null;
}

export const stockStatus = (stock) =>
  stock === 0 ? "esgotado" : stock < 15 ? "baixo" : "disponivel";
export const stockLabels = {
  disponivel: "Disponível",
  baixo: "Estoque baixo",
  esgotado: "Esgotado",
};
export const orderTransitions = {
  Pendente: ["Cancelado"],
  Pago: ["Enviado"],
  Enviado: ["Entregue"],
  Entregue: [],
  Cancelado: [],
};

export const formatOrderDate = (data) =>
  new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" })
    .format(new Date(data.replace(" ", "T") + "Z"));

export function camposDePreco(price, oldPrice, stock) {
  const preco = /^\d+(?:[.,]\d{1,2})?$/.test(price) ? Math.round(Number(price.replace(",", ".")) * 100) : 0;
  const anterior = /^\d+(?:[.,]\d{1,2})?$/.test(oldPrice)
    ? Math.round(Number(oldPrice.replace(",", ".")) * 100) : 0;
  if (!Number.isSafeInteger(preco) || preco <= 0) throw new Error("Informe um preço atual válido.");
  if (oldPrice && (!Number.isSafeInteger(anterior) || anterior <= preco)) {
    throw new Error("O preço anterior deve ser maior que o preço atual.");
  }
  if (!/^\d+$/.test(stock) || !Number.isSafeInteger(Number(stock))) {
    throw new Error("Informe uma quantidade inteira para o estoque.");
  }
  return { preco, preco_anterior: anterior || null, estoque: Number(stock) };
}
