export const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");

export function readSession(key) {
  try {
    return JSON.parse(sessionStorage.getItem(`vora_${key}`));
  } catch {
    return null;
  }
}

export function writeSession(key, value) {
  try {
    if (value == null) sessionStorage.removeItem(`vora_${key}`);
    else sessionStorage.setItem(`vora_${key}`, JSON.stringify(value));
  } catch {
    // O estado em memória permanece disponível nesta página.
  }
}

export function readPreference(key) {
  try {
    return JSON.parse(localStorage.getItem(`vora_${key}`)) ?? readSession(key);
  } catch {
    return readSession(key);
  }
}

export function writePreference(key, value) {
  try {
    localStorage.setItem(`vora_${key}`, JSON.stringify(value));
    writeSession(key, null);
  } catch {
    writeSession(key, value);
  }
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function request(path, { method = "GET", body, token, signal } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let resposta;
  try {
    resposta = await fetch(`${API_URL}${path}`, {
      method, headers, signal,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (erro) {
    if (erro.name === "AbortError") throw erro;
    throw new ApiError("Não foi possível falar com a API. Confira a conexão e tente novamente.", 0);
  }

  const dados = await resposta.json().catch(() => null);
  if (!resposta.ok) throw new ApiError(dados?.erro ?? "Erro inesperado no servidor.", resposta.status);
  if (dados === null) throw new ApiError("A API devolveu uma resposta inválida.", resposta.status);
  return dados;
}

export const slugify = (texto) =>
  texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function adaptarProduto(p) {
  return {
    id: p.id,
    aliases: p.ids_equivalentes ?? [],
    name: p.nome_produto,
    unit: p.unidade || "",
    price: p.preco / 100,
    oldPrice: p.preco_anterior == null ? null : p.preco_anterior / 100,
    description: p.descricao,
    imageUrl: p.img_url,
    category: slugify(p.nome_categoria),
    categoryName: p.nome_categoria,
    categoryId: p.id_categoria,
    stock: p.estoque,
    active: p.situacao === undefined || p.situacao === "Ativo",
  };
}

export async function listarProdutos(signal) {
  const lista = await request("/produtos", { signal });
  return lista.map(adaptarProduto);
}

export async function listarCategorias(signal) {
  const categorias = await request("/categorias", { signal });
  const slugs = new Set();
  return categorias.map(({ id, nome_categoria: name, id_categoria_pai: parentId }) => {
    let slug = slugify(name) || "categoria-" + id;
    while (slugs.has(slug)) slug += "-" + id;
    slugs.add(slug);
    return { id, name, parentId, slug };
  });
}

export function consultarCep(cep) {
  return request(`/cep/${cep.replace(/\D/g, "")}`);
}

export function dadosDoCep(cotacao) {
  return {
    zip: cotacao.cep.replace(/\D/g, ""),
    street: cotacao.logradouro,
    neighborhood: cotacao.bairro,
    city: cotacao.cidade,
    uf: cotacao.uf,
    freight: cotacao.valor_frete,
    deliveryDays: cotacao.prazo_entrega,
  };
}
