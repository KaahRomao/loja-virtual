import React, { useState, useMemo } from "react";
import { ProductCard } from "./components/ProductCard";
import { CartDrawer } from "./components/CartDrawer";

export default function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("todos");
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);

  // Produtos Mockados fiéis ao site Lovable
  const offerProducts = [
    {
      id: 1,
      name: "Arroz branco",
      category: "COMIDA",
      unit: "Pacote 5 kg",
      price: 22.9,
      oldPrice: 27.9,
      isOffer: true,
      image:
        "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80",
    },
    {
      id: 2,
      name: "Feijão carioca",
      category: "COMIDA",
      unit: "Pacote 1 kg",
      price: 7.49,
      oldPrice: 9.9,
      isOffer: true,
      image:
        "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=500&q=80",
    },
    {
      id: 3,
      name: "Carne moída",
      category: "COMIDA",
      unit: "Bandeja 500 g",
      price: 18.9,
      oldPrice: 22.9,
      isOffer: true,
      image:
        "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=500&q=80",
    },
    {
      id: 4,
      name: "Biscoito recheado",
      category: "SNACKS",
      unit: "Pacote 120 g",
      price: 3.99,
      oldPrice: 4.99,
      isOffer: true,
      image:
        "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&q=80",
    },
  ];

  const favoriteProducts = [
    {
      id: 5,
      name: "Macarrão espaguete",
      category: "COMIDA",
      unit: "Pacote 500 g",
      price: 4.79,
      isOffer: false,
      image:
        "https://images.unsplash.com/photo-1621996346565-e3d5d6281286?w=500&q=80",
    },
    {
      id: 6,
      name: "Ovos frescos",
      category: "COMIDA",
      unit: "Caixa com 6 un.",
      price: 6.99,
      isOffer: false,
      image:
        "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=500&q=80",
    },
    {
      id: 7,
      name: "Milho de pipoca",
      category: "SNACKS",
      unit: "Pacote 500 g",
      price: 5.99,
      isOffer: false,
      image:
        "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=500&q=80",
    },
    {
      id: 8,
      name: "Detergente neutro",
      category: "LIMPEZA",
      unit: "Frasco 500 ml",
      price: 2.99,
      isOffer: false,
      image:
        "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=500&q=80",
    },
  ];

  const allProducts = [...offerProducts, ...favoriteProducts];

  // Adicionar ao carrinho
  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  // Atualizar quantidade
  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  // Remover item
  const handleRemoveItem = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // Alternar favorito
  const handleToggleFavorite = (productId) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  // Filtro de Busca e Categoria
  const filteredOffers = useMemo(() => {
    return offerProducts.filter((p) => {
      const matchCategory =
        activeCategory === "todos" ||
        p.category.toLowerCase() === activeCategory.toLowerCase();
      const matchSearch = p.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [searchTerm, activeCategory]);

  const filteredFavorites = useMemo(() => {
    return favoriteProducts.filter((p) => {
      const matchCategory =
        activeCategory === "todos" ||
        p.category.toLowerCase() === activeCategory.toLowerCase();
      const matchSearch = p.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [searchTerm, activeCategory]);

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-white font-['Nunito'] text-gray-800 flex flex-col items-center">
      {/* 1. Barra de Anúncio Superior */}
      <div className="w-full bg-emerald-800 text-white text-xs py-2 px-6 sm:px-20 flex justify-between items-center">
        <div>
          <span>Economia de verdade para a sua família. </span>
          <strong className="font-extrabold">
            Qualidade que cabe no bolso!
          </strong>
        </div>
        <div className="hidden md:flex items-center gap-2 text-emerald-200">
          <span>Suas compras, do seu jeito</span>
        </div>
      </div>

      {/* 2. Cabeçalho Principal */}
      <header className="w-full bg-white border-b border-gray-200 px-6 sm:px-20 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo VORA */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              setActiveCategory("todos");
              setSearchTerm("");
            }}
          >
            <span className="text-3xl font-black font-['Fredoka'] text-emerald-800 tracking-wider">
              VORA
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
              supermarket
            </span>
          </div>

          {/* Campo de Busca */}
          <div className="w-full max-w-xl flex items-center bg-gray-50 rounded-lg border border-gray-200 overflow-hidden px-4 py-2 focus-within:border-emerald-600 transition-colors">
            <input
              type="text"
              placeholder="O que você está procurando?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm text-gray-700 focus:outline-none"
            />
            <button className="text-gray-400 hover:text-emerald-700 transition-colors ml-2">
              🔍
            </button>
          </div>

          {/* Ações do Usuário e Botão do Carrinho */}
          <div className="flex items-center gap-6 text-xs text-gray-600">
            <div className="hidden sm:block">
              <span className="block text-gray-400">Entrega para</span>
              <strong
                className="text-emerald-950 font-bold cursor-pointer hover:underline"
                onClick={() => setIsCartOpen(true)}
              >
                Informar CEP
              </strong>
            </div>

            <div className="hidden sm:block">
              <span className="block text-gray-400">Bem-vindo!</span>
              <strong className="text-emerald-950 font-bold cursor-pointer hover:underline">
                Entrar ou cadastrar
              </strong>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              🛒 Carrinho
              {totalCartCount > 0 && (
                <span className="bg-amber-400 text-emerald-950 text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 3. Navegação por Categorias */}
      <nav className="w-full border-b border-gray-200 px-6 sm:px-20 py-3 text-xs font-bold text-gray-700">
        <div className="max-w-7xl mx-auto flex items-center gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveCategory("todos")}
            className={`transition-colors cursor-pointer ${activeCategory === "todos" ? "text-emerald-700 font-extrabold" : "hover:text-emerald-700"}`}
          >
            Início
          </button>
          <button
            onClick={() => setActiveCategory("todos")}
            className="hover:text-emerald-700 transition-colors cursor-pointer"
          >
            Todos os produtos
          </button>
          <button
            onClick={() => setActiveCategory("comida")}
            className={`transition-colors cursor-pointer ${activeCategory === "comida" ? "text-emerald-700 font-extrabold" : "hover:text-emerald-700"}`}
          >
            Comida
          </button>
          <button
            onClick={() => setActiveCategory("snacks")}
            className={`transition-colors cursor-pointer ${activeCategory === "snacks" ? "text-emerald-700 font-extrabold" : "hover:text-emerald-700"}`}
          >
            Snacks
          </button>
          <button
            onClick={() => setActiveCategory("limpeza")}
            className={`transition-colors cursor-pointer ${activeCategory === "limpeza" ? "text-emerald-700 font-extrabold" : "hover:text-emerald-700"}`}
          >
            Limpeza
          </button>
          <a
            href="#ofertas"
            className="text-emerald-700 flex items-center gap-1 hover:text-emerald-800"
          >
            ◇ Ofertas
          </a>
        </div>
      </nav>

      {/* 4. Hero Section */}
      <section className="w-full bg-emerald-50/60 py-16 px-6 sm:px-20 border-b border-emerald-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="max-w-xl space-y-4 text-center md:text-left">
            <span className="bg-white border border-emerald-200 text-emerald-800 text-xs font-black px-4 py-1.5 rounded-full inline-block uppercase">
              ◇ O MERCADO DA SUA FAMÍLIA
            </span>
            <h1 className="text-4xl sm:text-5xl font-semibold font-['Fredoka'] text-emerald-950 leading-tight">
              Tudo que você precisa.
            </h1>
            <h2 className="text-4xl sm:text-5xl font-semibold font-['Fredoka'] text-emerald-700 leading-tight">
              Do jeitinho que cabe no bolso.
            </h2>
            <p className="text-gray-600 text-base font-normal">
              Produtos para o seu dia a dia, com qualidade de verdade e preço
              que faz bem.
            </p>
            <a
              href="#ofertas"
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-base font-semibold font-['Fredoka'] px-8 py-3.5 rounded-xl transition-all shadow-sm inline-block"
            >
              Comprar agora →
            </a>
          </div>

          <div className="w-full max-w-md h-72 bg-emerald-100 rounded-2xl flex items-center justify-center border border-emerald-200 shadow-inner overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80"
              alt="VORA Supermarket Banner"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 5. Vantagens */}
      <section className="w-full max-w-7xl mx-auto py-8 px-6 sm:px-20 border-b border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-4 justify-center md:justify-start">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-800 font-bold">
            $
          </div>
          <div>
            <h4 className="text-emerald-950 text-base font-semibold font-['Fredoka']">
              Preço que ajuda
            </h4>
            <p className="text-gray-500 text-xs">Economia em cada compra</p>
          </div>
        </div>

        <div className="flex items-center gap-4 justify-center md:justify-start">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-800 font-bold">
            ✓
          </div>
          <div>
            <h4 className="text-emerald-950 text-base font-semibold font-['Fredoka']">
              Qualidade de verdade
            </h4>
            <p className="text-gray-500 text-xs">Escolhas para sua família</p>
          </div>
        </div>

        <div className="flex items-center gap-4 justify-center md:justify-start">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-800 font-bold">
            📦
          </div>
          <div>
            <h4 className="text-emerald-950 text-base font-semibold font-['Fredoka']">
              Tudo em um lugar
            </h4>
            <p className="text-gray-500 text-xs">Do básico ao especial</p>
          </div>
        </div>
      </section>

      {/* 6. Ofertas pra Aproveitar */}
      {filteredOffers.length > 0 && (
        <section
          className="w-full max-w-7xl mx-auto py-16 px-6 sm:px-20"
          id="ofertas"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-2">
            <div>
              <span className="text-emerald-700 text-xs font-black uppercase tracking-wider block">
                SELEÇÃO VORA
              </span>
              <h2 className="text-3xl font-semibold font-['Fredoka'] text-emerald-950 mt-1 flex items-center gap-2">
                Ofertas pra aproveitar <span className="text-amber-500">✦</span>
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Economize no que não pode faltar em casa.
              </p>
            </div>
            <a
              href="#ofertas"
              className="text-emerald-700 font-bold text-sm hover:underline"
            >
              Ver ofertas da semana →
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
            {filteredOffers.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                isFavorite={favorites.includes(product.id)}
                onToggleFavorite={handleToggleFavorite}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </section>
      )}

      {/* 7. Atalhos por Categoria */}
      <section className="w-full bg-gray-50 py-16 px-6 sm:px-20 border-y border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center md:text-left">
            <span className="text-emerald-700 text-xs font-black uppercase tracking-wider block">
              ENCONTRE RAPIDINHO
            </span>
            <h2 className="text-3xl font-semibold font-['Fredoka'] text-emerald-950 mt-1">
              O que vai pra sua lista hoje?
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Escolha uma categoria e encontre tudo mais fácil.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={() => setActiveCategory("comida")}
              className="bg-emerald-100/50 p-6 rounded-xl border border-emerald-200 flex flex-col justify-between h-36 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div>
                <h3 className="text-emerald-950 text-2xl font-semibold font-['Fredoka']">
                  Comida
                </h3>
                <p className="text-gray-600 text-xs mt-1">
                  O essencial da sua mesa
                </p>
              </div>
              <span className="text-emerald-800 font-bold self-end text-lg">
                →
              </span>
            </div>

            <div
              onClick={() => setActiveCategory("snacks")}
              className="bg-amber-50 p-6 rounded-xl border border-amber-200 flex flex-col justify-between h-36 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div>
                <h3 className="text-emerald-950 text-2xl font-semibold font-['Fredoka']">
                  Snacks
                </h3>
                <p className="text-gray-600 text-xs mt-1">
                  Gostosuras para a pausa
                </p>
              </div>
              <span className="text-emerald-800 font-bold self-end text-lg">
                →
              </span>
            </div>

            <div
              onClick={() => setActiveCategory("limpeza")}
              className="bg-teal-50 p-6 rounded-xl border border-teal-200 flex flex-col justify-between h-36 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div>
                <h3 className="text-emerald-950 text-2xl font-semibold font-['Fredoka']">
                  Limpeza
                </h3>
                <p className="text-gray-600 text-xs mt-1">
                  Casa limpa, vida leve
                </p>
              </div>
              <span className="text-emerald-800 font-bold self-end text-lg">
                →
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Favoritos da Família */}
      {filteredFavorites.length > 0 && (
        <section className="w-full max-w-7xl mx-auto py-16 px-6 sm:px-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-2">
            <div>
              <span className="text-emerald-700 text-xs font-black uppercase tracking-wider block">
                PRA FACILITAR SEU DIA
              </span>
              <h2 className="text-3xl font-semibold font-['Fredoka'] text-emerald-950 mt-1">
                Favoritos da família
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                O básico de sempre, pertinho de você.
              </p>
            </div>
            <button
              onClick={() => setActiveCategory("todos")}
              className="text-emerald-700 font-bold text-sm hover:underline cursor-pointer"
            >
              Ver catálogo completo →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
            {filteredFavorites.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                isFavorite={favorites.includes(product.id)}
                onToggleFavorite={handleToggleFavorite}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </section>
      )}

      {/* 9. Chamada Final */}
      <section className="w-full bg-emerald-900 text-white py-14 px-6 sm:px-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div>
            <span className="text-amber-400 text-xs font-black uppercase tracking-wider block">
              VORA SUPERMARKET
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold font-['Fredoka'] mt-1">
              Sua lista fica mais leve por aqui.
            </h2>
            <p className="text-emerald-100 text-sm mt-2">
              Mais praticidade para comprar tudo que sua casa precisa.
            </p>
          </div>
          <button
            onClick={() => setActiveCategory("todos")}
            className="bg-white text-emerald-900 font-semibold font-['Fredoka'] px-8 py-3 rounded-xl hover:bg-emerald-50 transition-colors cursor-pointer"
          >
            Explorar produtos →
          </button>
        </div>
      </section>

      {/* 10. Rodapé */}
      <footer className="w-full bg-emerald-950 text-white py-12 px-6 sm:px-20 border-t border-emerald-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-emerald-900/60">
          <div>
            <h3 className="font-['Fredoka'] text-2xl font-bold text-emerald-400 mb-2">
              VORA
            </h3>
            <p className="text-gray-300 text-xs leading-relaxed">
              Tudo que você precisa.
              <br />
              Do básico ao especial, com economia e carinho.
            </p>
          </div>

          <div>
            <h4 className="font-['Fredoka'] text-base font-semibold mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-gray-300 text-xs">
              <li
                className="hover:text-white cursor-pointer"
                onClick={() => setActiveCategory("comida")}
              >
                Comida
              </li>
              <li
                className="hover:text-white cursor-pointer"
                onClick={() => setActiveCategory("snacks")}
              >
                Snacks
              </li>
              <li
                className="hover:text-white cursor-pointer"
                onClick={() => setActiveCategory("limpeza")}
              >
                Limpeza
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-['Fredoka'] text-base font-semibold mb-3">
              Sua compra
            </h4>
            <ul className="space-y-2 text-gray-300 text-xs">
              <li
                className="hover:text-white cursor-pointer"
                onClick={() => setIsCartOpen(true)}
              >
                Meu carrinho
              </li>
              <li
                className="hover:text-white cursor-pointer"
                onClick={() => setActiveCategory("todos")}
              >
                Todos os produtos
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-['Fredoka'] text-base font-semibold mb-3">
              VORA supermarket
            </h4>
            <p className="text-gray-300 text-xs leading-relaxed mb-3">
              Mais economia e qualidade para o dia a dia da sua família.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row justify-between items-center text-gray-400 text-xs gap-2">
          <span>
            © {new Date().getFullYear()} VORA supermarket. Tudo que você
            precisa.
          </span>
          <span>Feito para facilitar sua vida ♡</span>
        </div>
      </footer>

      {/* Slide-over Carrinho Lateral */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => setCart([])}
      />
    </div>
  );
}
