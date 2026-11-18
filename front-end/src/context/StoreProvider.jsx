import { useCallback, useEffect, useState } from "react";
import { listarCategorias, listarProdutos, readPreference, readSession, request, writePreference, writeSession } from "../services/api";
import { StoreContext } from "./store-context";

const enderecoVazio = {
  name: "", zip: "", street: "", number: "", complement: "",
  neighborhood: "", city: "", uf: "", freight: null, deliveryDays: null,
};

function sessaoInicial() {
  const atual = readSession("conta");
  if (atual?.expira > Date.now() && ["cliente", "admin"].includes(atual.role)) return atual;
  for (const role of ["cliente", "admin"]) {
    const anterior = readSession(role);
    if (anterior?.expira > Date.now()) return { ...anterior, role };
  }
  return null;
}

function gravarSessao(conta) {
  writeSession("conta", conta);
  writeSession("cliente", null);
  writeSession("admin", null);
}

function normalizarCarrinho(carrinho, equivalentes) {
  const resultado = {};
  for (const [id, quantidade] of Object.entries(carrinho)) {
    const principal = equivalentes.get(Number(id)) ?? id;
    resultado[principal] = (resultado[principal] ?? 0) + quantidade;
  }
  return resultado;
}

function normalizarFavoritos(favoritos, equivalentes) {
  return [...new Set(favoritos.map((id) => equivalentes.get(id) ?? id))];
}

function vincularCategorias(categorias) {
  const porId = new Map(categorias.map((categoria) => [categoria.id, categoria]));
  const membros = new Map(categorias.map(({ slug }) => [slug, new Set()]));
  for (const inicio of categorias) {
    const visitados = new Set();
    let categoria = inicio;
    while (categoria && !visitados.has(categoria.id)) {
      visitados.add(categoria.id);
      membros.get(categoria.slug).add(inicio.id);
      categoria = porId.get(categoria.parentId);
    }
  }
  return membros;
}

export function StoreProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revision, setRevision] = useState(0);
  const [savedCart, setCart] = useState(() => readPreference("carrinho") ?? {});
  const [cartOpen, setCartOpen] = useState(false);
  const [savedFavorites, setFavorites] = useState(() => readPreference("favoritos") ?? []);
  const [address, setAddress] = useState(enderecoVazio);
  const [account, setAccount] = useState(sessaoInicial);

  function refreshProducts() {
    setLoading(true);
    setError(null);
    setRevision((v) => v + 1);
  }

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([listarProdutos(controller.signal), listarCategorias(controller.signal)])
      .then(([produtos, categorias]) => {
        if (controller.signal.aborted) return;
        const slugsPorId = new Map(categorias.map(({ id, slug }) => [id, slug]));
        setCategories(categorias);
        setProducts(produtos.map((produto) => ({
          ...produto, category: slugsPorId.get(produto.categoryId) ?? produto.category,
        })));
      })
      .catch((erro) => { if (!controller.signal.aborted) setError(erro.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [revision]);

  useEffect(() => { writePreference("carrinho", savedCart); }, [savedCart]);
  useEffect(() => { writePreference("favoritos", savedFavorites); }, [savedFavorites]);
  useEffect(() => {
    gravarSessao(account);
    if (!account) return;
    const timer = setTimeout(() => {
      gravarSessao(null);
      setAccount(null);
    }, Math.max(0, account.expira - Date.now()));
    return () => clearTimeout(timer);
  }, [account]);

  async function login(email, senha) {
    const dados = await request("/login", {
      method: "POST", body: { email, senha },
    });
    const role = dados.role ?? (dados.cliente ? "cliente" : null);
    const conta = role === "admin" ? dados.admin : dados.cliente;
    if (!conta || !dados.token || !["cliente", "admin"].includes(role)) {
      throw new Error("O servidor devolveu uma sessão inválida.");
    }
    const sessao = {
      ...conta,
      role,
      name: conta.nome_cliente ?? conta.nome,
      token: dados.token,
      expira: Date.now() + 2 * 60 * 60 * 1000,
    };
    gravarSessao(sessao);
    setAccount(sessao);
    return sessao;
  }

  const logout = useCallback(({ preserveAddress = false } = {}) => {
    gravarSessao(null);
    setAccount(null);
    if (!preserveAddress) setAddress(enderecoVazio);
  }, []);

  const equivalentes = new Map(products.flatMap((product) => product.aliases.map((id) => [id, product.id])));
  const cart = normalizarCarrinho(savedCart, equivalentes);
  const favorites = normalizarFavoritos(savedFavorites, equivalentes);
  const cartItems = products
    .filter((p) => cart[p.id] > 0)
    .map((p) => ({ ...p, qty: cart[p.id] }));
  const categoryNames = Object.fromEntries(categories.map(({ slug, name }) => [slug, name]));
  const categoryMembers = vincularCategorias(categories);
  const totalItems = cartItems.reduce((s, p) => s + p.qty, 0);
  const total = cartItems.reduce((s, p) => s + Math.round(p.price * 100) * p.qty, 0) / 100;

  const value = {
    products, loading, error, refreshProducts, categoryNames, categorySlugs: Object.keys(categoryNames), categoryMembers,
    cart, cartItems, totalItems, total, cartOpen, setCartOpen, favorites,
    address, setAddress, account, user: account?.role === "cliente" ? account : null,
    admin: account?.role === "admin" ? account : null, login, logout,
    setQuantity: (id, delta) => {
      const stock = products.find((p) => p.id === id)?.stock ?? 0;
      setCart((prev) => {
        const next = normalizarCarrinho(prev, equivalentes);
        const quantity = Math.max(0, (next[id] || 0) + delta);
        if (quantity === 0) delete next[id];
        else next[id] = delta > 0 ? Math.max(prev[id] || 0, Math.min(quantity, stock)) : quantity;
        return next;
      });
    },
    removeItem: (id) => setCart((prev) => {
      const next = normalizarCarrinho(prev, equivalentes);
      delete next[id];
      return next;
    }),
    clearCart: () => {
      writePreference("carrinho", {});
      setCart({});
    },
    toggleFavorite: (id) => setFavorites((saved) => {
      const ids = normalizarFavoritos(saved, equivalentes);
      return ids.includes(id) ? ids.filter((other) => other !== id) : [...ids, id];
    }),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
