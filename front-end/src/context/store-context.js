import { createContext } from "react";

// O "canal" por onde o estado da loja chega aos componentes.
// Quem fornece o valor é o StoreProvider; quem lê usa o hook useStore.
export const StoreContext = createContext(null);
