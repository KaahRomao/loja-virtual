// Textos, formatadores e dados de exemplo do painel admin.
// Os produtos NÃO ficam mais aqui: vêm da API (veja services/api.js e context/StoreProvider.jsx).

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

export const formatZip = (v) =>
  v.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2");

export function validateZip(v) {
  const digits = v.replace(/\D/g, "");
  if (digits.length !== 8) return "Digite um CEP com 8 números.";
  const n = Number(digits);
  if (n < 1000000 || n > 19999999)
    return "Ainda não entregamos nesse CEP. Tente outro endereço.";
  return null;
}

// ===== Dados do painel administrativo (exemplo) =====
export const stockStatus = (stock) =>
  stock === 0 ? "esgotado" : stock < 15 ? "baixo" : "disponivel";
export const stockLabels = {
  disponivel: "Disponível",
  baixo: "Estoque baixo",
  esgotado: "Esgotado",
};
export const paymentLabels = {
  pix: "Pix",
  cartao: "Cartão na entrega",
  dinheiro: "Dinheiro na entrega",
};
export const orderLabels = {
  recebido: "Recebido",
  separando: "Separando",
  entrega: "Saiu para entrega",
  entregue: "Entregue",
};

export const sampleOrders = [
  {
    code: "VR-1048",
    customer: "Maria Souza",
    date: "22/10 18:40",
    items: 9,
    total: 128.4,
    payment: "pix",
    status: "recebido",
  },
  {
    code: "VR-1047",
    customer: "João Lima",
    date: "22/10 17:12",
    items: 4,
    total: 46.9,
    payment: "cartao",
    status: "separando",
  },
  {
    code: "VR-1046",
    customer: "Ana Ferreira",
    date: "22/10 15:05",
    items: 12,
    total: 203.15,
    payment: "pix",
    status: "entrega",
  },
  {
    code: "VR-1045",
    customer: "Carlos Rocha",
    date: "21/10 19:30",
    items: 6,
    total: 74.3,
    payment: "dinheiro",
    status: "entregue",
  },
  {
    code: "VR-1044",
    customer: "Juliana Alves",
    date: "21/10 11:48",
    items: 3,
    total: 31.47,
    payment: "pix",
    status: "entregue",
  },
];
