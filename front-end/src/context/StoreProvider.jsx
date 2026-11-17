import { useMemo, useState } from "react";
import { products, adminProducts, sampleOrders } from "../data/products";
import { StoreContext } from "./store-context";

// Estado da loja: carrinho, favoritos, checkout e painel (só nesta visita).
export function StoreProvider({ children }) {
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [categoryNames, setCategoryNames] = useState({ comida: "Comida", snacks: "Snacks", limpeza: "Limpeza" });
  const [address, setAddress] = useState({ name: "", zip: "", street: "", number: "", complement: "" });
  const [payment, setPayment] = useState("pix");
  const [lastOrder, setLastOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [adminSignedIn, setAdminSignedIn] = useState(false);
  const [rows, setRows] = useState(adminProducts);
  const [orders, setOrders] = useState(sampleOrders);

  const value = useMemo(() => {
    const totalItems = Object.values(cart).reduce((s, q) => s + q, 0);
    const total = Math.round(products.reduce((s, p) => s + p.price * (cart[p.id] || 0), 0) * 100) / 100;
    const cartItems = products.filter((p) => cart[p.id]).map((p) => ({ ...p, qty: cart[p.id] }));

    return {
      cart, cartItems, totalItems, total,
      cartOpen, setCartOpen,
      favorites, categoryNames, setCategoryNames,
      address, setAddress, payment, setPayment, lastOrder,
      user, setUser, adminSignedIn, setAdminSignedIn,
      rows, setRows, orders, setOrders,
      setQuantity: (id, delta) =>
        setCart((prev) => {
          const next = { ...prev };
          const q = Math.max(0, (next[id] || 0) + delta);
          if (q === 0) delete next[id];
          else next[id] = q;
          return next;
        }),
      removeItem: (id) => setCart((prev) => { const next = { ...prev }; delete next[id]; return next; }),
      clearCart: () => setCart({}),
      toggleFavorite: (id) => setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id])),
      placeOrder: () => {
        // Aqui você envia o pedido para o seu back-end.
        const order = {
          code: `VR-${1049 + orders.length - 5}`,
          customer: address.name || "Cliente",
          date: "Agora",
          items: totalItems,
          total,
          payment,
          status: "recebido",
        };
        setLastOrder(order);
        setOrders((o) => [order, ...o]);
        setCart({});
        return order;
      },
    };
  }, [cart, cartOpen, favorites, categoryNames, address, payment, lastOrder, user, adminSignedIn, rows, orders]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
