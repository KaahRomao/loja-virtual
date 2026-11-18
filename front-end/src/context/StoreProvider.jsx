import { useEffect, useState } from "react";
import { listarProdutos, readPreference, readSession, request, writePreference, writeSession } from "../services/api";
import { StoreContext } from "./store-context";

function sessaoInicial(tipo) {
  const sessao = readSession(tipo);
  return sessao?.expira > Date.now() ? sessao : null;
}

export function StoreProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revision, setRevision] = useState(0);
  const [cart, setCart] = useState(() => readPreference("carrinho") ?? {});
  const [cartOpen, setCartOpen] = useState(false);
  const [favorites, setFavorites] = useState(() => readPreference("favoritos") ?? []);
  const [address, setAddress] = useState({
    name: "", zip: "", street: "", number: "", complement: "",
    neighborhood: "", city: "", uf: "", freight: null, deliveryDays: null,
  });
  const [client, setClient] = useState(() => sessaoInicial("cliente"));
  const [admin, setAdmin] = useState(() => sessaoInicial("admin"));

  function refreshProducts() {
    setLoading(true);
    setError(null);
    setRevision((v) => v + 1);
  }

  useEffect(() => {
    const controller = new AbortController();
    listarProdutos(controller.signal)
      .then(setProducts)
      .catch((erro) => { if (!controller.signal.aborted) setError(erro.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [revision]);

  useEffect(() => { writePreference("carrinho", cart); }, [cart]);
  useEffect(() => { writePreference("favoritos", favorites); }, [favorites]);
  useEffect(() => {
    const timers = [[client, setClient, "cliente"], [admin, setAdmin, "admin"]]
      .filter(([sessao]) => sessao)
      .map(([sessao, set, tipo]) => setTimeout(() => {
        writeSession(tipo, null);
        set(null);
      }, Math.max(0, sessao.expira - Date.now())));
    return () => timers.forEach(clearTimeout);
  }, [client, admin]);

  async function login(tipo, email, senha) {
    const adminLogin = tipo === "admin";
    const dados = await request(adminLogin ? "/admin/login" : "/login", {
      method: "POST", body: { email, senha },
    });
    const conta = adminLogin ? dados.admin : dados.cliente;
    const sessao = {
      ...conta,
      name: conta.nome_cliente ?? conta.nome,
      token: dados.token,
      expira: Date.now() + 2 * 60 * 60 * 1000,
    };
    writeSession(tipo, sessao);
    (adminLogin ? setAdmin : setClient)(sessao);
  }

  function logout(tipo, { preserveAddress = false } = {}) {
    writeSession(tipo, null);
    if (tipo === "admin") {
      setAdmin(null);
    } else {
      setClient(null);
      if (!preserveAddress) setAddress({
        name: "", zip: "", street: "", number: "", complement: "",
        neighborhood: "", city: "", uf: "", freight: null, deliveryDays: null,
      });
    }
  }

  const cartItems = products
    .filter((p) => cart[p.id] > 0)
    .map((p) => ({ ...p, qty: cart[p.id] }));
  const categoryNames = Object.fromEntries(products.map((p) => [p.category, p.categoryName]));
  const totalItems = cartItems.reduce((s, p) => s + p.qty, 0);
  const total = cartItems.reduce((s, p) => s + Math.round(p.price * 100) * p.qty, 0) / 100;

  const value = {
    products, loading, error, refreshProducts, categoryNames, categorySlugs: Object.keys(categoryNames),
    cart, cartItems, totalItems, total, cartOpen, setCartOpen, favorites,
    address, setAddress, user: client, admin, login, logout,
    setQuantity: (id, delta) => {
      const stock = products.find((p) => p.id === id)?.stock ?? 0;
      setCart((prev) => {
        const next = { ...prev };
        const quantity = Math.max(0, (next[id] || 0) + delta);
        if (quantity === 0) delete next[id];
        else next[id] = delta > 0 ? Math.max(prev[id] || 0, Math.min(quantity, stock)) : quantity;
        return next;
      });
    },
    removeItem: (id) => setCart((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    }),
    clearCart: () => {
      writePreference("carrinho", {});
      setCart({});
    },
    toggleFavorite: (id) => setFavorites((f) =>
      f.includes(id) ? f.filter((x) => x !== id) : [...f, id]
    ),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
