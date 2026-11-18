// Camada de acesso à API do back-end. Todas as chamadas passam por request().
export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const TOKEN_KEY = "vora_token";

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const saveToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* sem localStorage: o login vale só até recarregar a página */
  }
};

// Erro com a mensagem que o back-end devolve em { erro } e o status HTTP.
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function request(
  path,
  { method = "GET", body, auth = false } = {},
) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let resposta;
  try {
    resposta = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      "Não foi possível falar com o servidor. Tente de novo.",
      0,
    );
  }

  const dados = await resposta.json().catch(() => null);
  if (!resposta.ok) {
    throw new ApiError(dados?.erro ?? "Erro inesperado", resposta.status);
  }
  return dados;
}

export const slugify = (texto) =>
  texto
    .normalize("NFD")
<<<<<<< HEAD
    .replace(/[\u0300-\u036f]/g, "")
=======
    .replace(/[̀-ͯ]/g, "")
>>>>>>> vercel
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// Converte o produto do back-end (centavos, nomes do banco) para o formato que o front usa.
export function adaptarProduto(p) {
  return {
    id: p.id,
    name: p.nome_produto,
    unit: "",
    price: p.preco / 100,
    description: p.descricao,
    imageUrl: p.img_url,
    category: slugify(p.nome_categoria),
    categoryName: p.nome_categoria,
    stock: p.estoque,
  };
}

export async function listarProdutos() {
  const lista = await request("/produtos");
  return lista.map(adaptarProduto);
}
