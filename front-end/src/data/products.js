// Dados de exemplo — troque por chamadas ao seu back-end.
import { sheets } from "../assets";

const comida = [
  { name: "Arroz branco", unit: "Pacote 5 kg", price: 22.9, oldPrice: 27.9, image: 0, description: "Arroz soltinho para acompanhar as refeições da família." },
  { name: "Feijão carioca", unit: "Pacote 1 kg", price: 7.49, oldPrice: 9.9, image: 1, description: "Feijão carioca selecionado para o dia a dia." },
  { name: "Macarrão espaguete", unit: "Pacote 500 g", price: 4.79, image: 2, description: "Uma refeição prática e gostosa para toda a família." },
  { name: "Carne moída", unit: "Bandeja 500 g", price: 18.9, oldPrice: 22.9, image: 3, description: "Versátil para receitas de todo dia." },
  { name: "Peito de frango", unit: "Bandeja 1 kg", price: 19.9, image: 4, description: "Peito de frango fresco para preparar do seu jeito." },
  { name: "Ovos", unit: "Caixa com 6 un.", price: 6.99, image: 5, description: "Ovos frescos para suas receitas." },
  { name: "Azeite de oliva", unit: "Garrafa 500 ml", price: 29.9, image: 6, description: "Mais sabor para saladas e pratos especiais." },
  { name: "Cenoura e batata", unit: "Combo 1 kg", price: 8.9, image: 7, description: "Legumes fresquinhos para sua cozinha." },
  { name: "Alface e tomate", unit: "Combo 1 un. + 500 g", price: 9.49, image: 8, description: "Verduras frescas para completar a mesa." },
  { name: "Molho de tomate", unit: "Pote 300 g", price: 3.99, image: 9, description: "Sabor e praticidade para o seu macarrão." },
  { name: "Sal refinado", unit: "Pacote 1 kg", price: 2.69, image: 10, description: "Um ingrediente essencial na cozinha." },
  { name: "Farinha de trigo", unit: "Pacote 1 kg", price: 5.49, image: 11, description: "Para pães, bolos e receitas caseiras." },
];

const snacks = [
  { name: "Milho de pipoca", unit: "Pacote 500 g", price: 5.99, image: 0, description: "Pipoca para deixar o filme ainda melhor." },
  { name: "Amendoim torrado", unit: "Pacote 200 g", price: 7.9, image: 1, description: "Crocante e gostoso para qualquer hora." },
  { name: "Barra de cereal", unit: "Unidade 25 g", price: 2.79, image: 2, description: "Uma opção prática para levar com você." },
  { name: "Biscoito recheado", unit: "Pacote 120 g", price: 3.99, oldPrice: 4.99, image: 3, description: "Um doce para compartilhar em casa." },
  { name: "Torradas", unit: "Pacote 160 g", price: 6.49, image: 4, description: "Leves e crocantes para o café da manhã." },
  { name: "Salgadinho", unit: "Pacote 80 g", price: 5.49, image: 5, description: "Crocância para a hora do lanche." },
  { name: "Chocolate", unit: "Barra 90 g", price: 7.99, image: 6, description: "Um carinho doce para o seu dia." },
  { name: "Iogurte natural", unit: "Pote 170 g", price: 4.29, image: 7, description: "Cremoso e versátil para o lanche." },
  { name: "Frutas secas", unit: "Pacote 150 g", price: 11.9, image: 8, description: "Mix de frutas para beliscar." },
  { name: "Cookies", unit: "Pacote 150 g", price: 8.49, image: 9, description: "Cookies crocantes para acompanhar o café." },
  { name: "Pão de queijo congelado", unit: "Pacote 400 g", price: 12.9, oldPrice: 15.9, image: 10, description: "Prontinho para assar e servir quentinho." },
  { name: "Maçã e banana", unit: "Combo 1 kg", price: 8.99, image: 11, description: "Frutas frescas para um lanche gostoso." },
];

const limpeza = [
  { name: "Detergente neutro", unit: "Frasco 500 ml", price: 2.99, image: 0, description: "Praticidade para lavar a louça." },
  { name: "Sabão em pó", unit: "Caixa 800 g", price: 12.9, image: 1, description: "Roupas limpas no dia a dia." },
  { name: "Amaciante", unit: "Frasco 2 L", price: 13.49, image: 2, description: "Um toque macio para suas roupas." },
  { name: "Desinfetante", unit: "Frasco 1 L", price: 6.99, image: 3, description: "Para cuidar da limpeza da casa." },
  { name: "Água sanitária", unit: "Frasco 1 L", price: 4.49, image: 4, description: "Aliada da limpeza do dia a dia." },
  { name: "Limpador multiuso", unit: "Frasco 500 ml", price: 7.9, image: 5, description: "Ajuda prática para várias superfícies." },
  { name: "Esponja de louça", unit: "Unidade", price: 2.49, image: 6, description: "Um item essencial para a cozinha." },
  { name: "Sabão em barra", unit: "Unidade 200 g", price: 3.99, image: 7, description: "Para a limpeza de todo dia." },
  { name: "Sacos de lixo", unit: "Rolo com 15 un.", price: 9.9, image: 8, description: "Praticidade para manter tudo organizado." },
  { name: "Flanela de limpeza", unit: "Unidade", price: 4.99, image: 9, description: "Pano macio para cuidar da casa." },
  { name: "Limpa-vidros", unit: "Frasco 500 ml", price: 8.49, image: 10, description: "Vidros limpos com menos esforço." },
  { name: "Álcool 70%", unit: "Frasco 500 ml", price: 6.79, image: 11, description: "Para manter os cuidados da casa em dia." },
];

export const products = [
  ...comida.map((p, i) => ({ ...p, id: i + 1, category: "comida" })),
  ...snacks.map((p, i) => ({ ...p, id: i + 13, category: "snacks" })),
  ...limpeza.map((p, i) => ({ ...p, id: i + 25, category: "limpeza" })),
];

export const categorySlugs = ["comida", "snacks", "limpeza"];

export const categoryInfo = {
  comida: { tagline: "O essencial da sua mesa" },
  snacks: { tagline: "Gostosuras para a pausa" },
  limpeza: { tagline: "Casa limpa, vida leve" },
};

export const formatPrice = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export const formatZip = (v) => v.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2");

export function validateZip(v) {
  const digits = v.replace(/\D/g, "");
  if (digits.length !== 8) return "Digite um CEP com 8 números.";
  const n = Number(digits);
  if (n < 1000000 || n > 19999999) return "Ainda não entregamos nesse CEP. Tente outro endereço.";
  return null;
}

// Recorte da foto do produto dentro da folha de imagens da categoria.
export function photoStyle(product) {
  const i = product.image;
  const style = { backgroundImage: `url(${sheets[product.category]})` };
  if (i < 9) {
    style.backgroundSize = "300% 300%";
    style.backgroundPosition = `${(i % 3) * 50}% ${Math.floor(i / 3) * 50}%`;
  } else {
    style.backgroundSize = "300% 100%";
    style.backgroundPosition = `${(i - 9) * 50}% 0%`;
  }
  return style;
}

// ===== Dados do painel administrativo (exemplo) =====
export const stockStatus = (stock) => (stock === 0 ? "esgotado" : stock < 15 ? "baixo" : "disponivel");
export const stockLabels = { disponivel: "Disponível", baixo: "Estoque baixo", esgotado: "Esgotado" };
export const paymentLabels = { pix: "Pix", cartao: "Cartão na entrega", dinheiro: "Dinheiro na entrega" };
export const orderLabels = { recebido: "Recebido", separando: "Separando", entrega: "Saiu para entrega", entregue: "Entregue" };

export const adminProducts = products.map((p) => ({
  ...p,
  stock: [48, 12, 0, 75, 30, 8, 60, 22][p.id % 8] ?? 0,
  active: true,
}));

export const sampleOrders = [
  { code: "VR-1048", customer: "Maria Souza", date: "22/10 18:40", items: 9, total: 128.4, payment: "pix", status: "recebido" },
  { code: "VR-1047", customer: "João Lima", date: "22/10 17:12", items: 4, total: 46.9, payment: "cartao", status: "separando" },
  { code: "VR-1046", customer: "Ana Ferreira", date: "22/10 15:05", items: 12, total: 203.15, payment: "pix", status: "entrega" },
  { code: "VR-1045", customer: "Carlos Rocha", date: "21/10 19:30", items: 6, total: 74.3, payment: "dinheiro", status: "entregue" },
  { code: "VR-1044", customer: "Juliana Alves", date: "21/10 11:48", items: 3, total: 31.47, payment: "pix", status: "entregue" },
];
