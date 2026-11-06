import React, { useState } from "react";
import { ProductCard } from "./components/ProductCard";

export default function App() {
  const [cartCount, setCartCount] = useState(0);

  const handleAddToCart = () => {
    setCartCount((prev) => prev + 1);
  };

  // Produtos de Exemplo (Ofertas)
  const offerProducts = [
    {
      id: 1,
      name: "Arroz branco",
      category: "COMIDA",
      unit: "Pacote 5 kg",
      price: 22.9,
      oldPrice: 27.9,
      isOffer: true,
    },
    {
      id: 2,
      name: "Feijão carioca",
      category: "COMIDA",
      unit: "Pacote 1 kg",
      price: 7.49,
      oldPrice: 9.9,
      isOffer: true,
    },
    {
      id: 3,
      name: "Carne moída",
      category: "COMIDA",
      unit: "Bandeja 500 g",
      price: 18.9,
      oldPrice: 22.9,
      isOffer: true,
    },
    {
      id: 4,
      name: "Biscoito recheado",
      category: "SNACKS",
      unit: "Pacote 120 g",
      price: 3.99,
      oldPrice: 4.99,
      isOffer: true,
    },
  ];

  // Produtos de Exemplo (Favoritos)
  const favoriteProducts = [
    {
      id: 5,
      name: "Macarrão espaguete",
      category: "COMIDA",
      unit: "Pacote 500 g",
      price: 4.79,
      isOffer: false,
    },
    {
      id: 6,
      name: "Ovos",
      category: "COMIDA",
      unit: "Caixa com 6 un.",
      price: 6.99,
      isOffer: false,
    },
    {
      id: 7,
      name: "Milho de pipoca",
      category: "SNACKS",
      unit: "Pacote 500 g",
      price: 5.99,
      isOffer: false,
    },
    {
      id: 8,
      name: "Detergente neutro",
      category: "LIMPEZA",
      unit: "Frasco 500 ml",
      price: 2.99,
      isOffer: false,
    },
  ];

  return (
    <div className="w-full min-h-screen bg-white font-['Nunito'] text-gray-800">
      {/* 1. Barra de Anúncio Superior */}
      <div className="w-full h-9 bg-emerald-800 flex items-center justify-between px-6 md:px-20 text-white text-xs">
        <div>
          Economia de verdade para a sua família.{" "}
          <strong className="font-extrabold">
            Qualidade que cabe no bolso!
          </strong>
        </div>
        <div className="hidden md:flex items-center gap-1.5">
          <span>Suas compras, do seu jeito</span>
        </div>
      </div>

      {/* 2. Cabeçalho Principal */}
      <header className="w-full bg-white border-b border-gray-300 px-6 md:px-20 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-3xl font-black font-['Fredoka'] text-emerald-800 tracking-wider">
            VORA
          </span>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
            supermarket
          </span>
        </div>

        {/* Campo de Busca */}
        <div className="w-full md:w-[600px] h-12 bg-neutral-100 rounded-md border border-gray-300 flex items-center overflow-hidden">
          <input
            type="text"
            placeholder="O que você está procurando?"
            className="w-full h-full bg-transparent px-4 text-sm text-gray-700 outline-none"
          />
          <button className="w-12 h-12 bg-teal-700 flex items-center justify-center text-white text-lg hover:bg-teal-800 transition-colors">
            🔍
          </button>
        </div>

        {/* Ações do Usuário */}
        <div className="flex items-center gap-6 text-xs text-gray-600">
          <div>
            <span className="block text-gray-500">Entrega para</span>
            <strong className="text-teal-950 font-extrabold cursor-pointer">
              Informar CEP
            </strong>
          </div>

          <div>
            <span className="block text-gray-500">Bem-vindo!</span>
            <strong className="text-teal-950 font-extrabold cursor-pointer">
              Entrar ou cadastrar
            </strong>
          </div>

          <button className="h-9 px-4 bg-teal-700 rounded-md text-white font-extrabold text-sm flex items-center gap-2 hover:bg-teal-800 transition-colors relative cursor-pointer">
            🛒 Carrinho
            {cartCount > 0 && (
              <span className="bg-amber-500 text-teal-950 text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* 3. Navegação das Categorias */}
      <nav className="w-full border-b border-gray-300 px-6 md:px-20 py-3 text-xs font-extrabold text-teal-950 flex gap-6 overflow-x-auto">
        <a href="#inicio" className="hover:text-emerald-700">
          Início
        </a>
        <a href="#todos" className="hover:text-emerald-700">
          Todos os produtos
        </a>
        <a href="#comida" className="hover:text-emerald-700">
          Comida
        </a>
        <a href="#snacks" className="hover:text-emerald-700">
          Snacks
        </a>
        <a href="#limpeza" className="hover:text-emerald-700">
          Limpeza
        </a>
        <a
          href="#ofertas"
          className="text-emerald-700 flex items-center gap-1 hover:text-emerald-800"
        >
          ◇ Ofertas
        </a>
      </nav>

      {/* 4. Banner Hero */}
      <section className="w-full bg-neutral-200 py-16 px-6 md:px-20 flex flex-col justify-center">
        <div className="max-w-xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full text-emerald-700 text-xs font-black uppercase">
            <span>◇</span> O MERCADO DA SUA FAMÍLIA
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold font-['Fredoka'] text-emerald-900 leading-tight">
            Tudo que você precisa.
          </h1>
          <h2 className="text-4xl md:text-5xl font-semibold font-['Fredoka'] text-emerald-700 leading-tight">
            Do jeitinho que cabe no bolso.
          </h2>
          <p className="text-emerald-950 text-base">
            Produtos para o seu dia a dia, com qualidade de verdade e preço que
            faz bem.
          </p>
          <button className="h-14 px-8 bg-emerald-700 rounded-full text-white font-semibold font-['Fredoka'] text-base hover:bg-emerald-800 transition-colors cursor-pointer">
            Comprar agora →
          </button>
        </div>
      </section>

      {/* 5. Vantagens (Diferenciais) */}
      <section className="w-full py-8 border-b border-gray-300 px-6 md:px-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-4">
          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">
            $
          </div>
          <div>
            <strong className="block text-emerald-950 text-base font-medium font-['Fredoka']">
              Preço que ajuda
            </strong>
            <span className="text-gray-600 text-xs">
              Economia em cada compra
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center md:justify-start gap-4">
          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">
            ✓
          </div>
          <div>
            <strong className="block text-emerald-950 text-base font-medium font-['Fredoka']">
              Qualidade de verdade
            </strong>
            <span className="text-gray-600 text-xs">
              Escolhas para sua família
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center md:justify-start gap-4">
          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">
            📦
          </div>
          <div>
            <strong className="block text-emerald-950 text-base font-medium font-['Fredoka']">
              Tudo em um lugar
            </strong>
            <span className="text-gray-600 text-xs">Do básico ao especial</span>
          </div>
        </div>
      </section>

      {/* 6. Seção de Ofertas */}
      <section className="w-full py-12 px-6 md:px-20" id="ofertas">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-2">
          <div>
            <span className="text-emerald-700 text-xs font-black uppercase tracking-wider block">
              SELEÇÃO VORA
            </span>
            <h2 className="text-3xl font-semibold font-['Fredoka'] text-emerald-900 mt-1 flex items-center gap-2">
              Ofertas pra aproveitar <span className="text-amber-500">✦</span>
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Economize no que não pode faltar em casa.
            </p>
          </div>
          <button className="text-emerald-700 font-extrabold text-sm hover:underline self-start md:self-auto">
            Ver ofertas da semana →
          </button>
        </div>

        <div className="flex flex-wrap gap-6 justify-center md:justify-start">
          {offerProducts.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </section>

      {/* 7. Grade de Categorias Rápida */}
      <section className="w-full bg-neutral-100 py-12 px-6 md:px-20">
        <div className="mb-8">
          <span className="text-emerald-700 text-xs font-black uppercase tracking-wider block">
            ENCONTRE RAPIDINHO
          </span>
          <h2 className="text-3xl font-semibold font-['Fredoka'] text-emerald-900 mt-1">
            O que vai pra sua lista hoje?
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Escolha uma categoria e encontre tudo mais fácil.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-teal-100 p-6 rounded-md flex flex-col justify-between h-36 relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
            <div>
              <h3 className="text-emerald-900 text-2xl font-normal font-['Fredoka']">
                Comida
              </h3>
              <p className="text-neutral-600 text-xs mt-2">
                O essencial da sua mesa
              </p>
            </div>
            <span className="text-emerald-700 font-bold self-end text-sm">
              →
            </span>
          </div>

          <div className="bg-orange-50 p-6 rounded-md flex flex-col justify-between h-36 relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
            <div>
              <h3 className="text-emerald-900 text-2xl font-normal font-['Fredoka']">
                Snacks
              </h3>
              <p className="text-neutral-600 text-xs mt-2">
                Gostosuras para a pausa
              </p>
            </div>
            <span className="text-emerald-700 font-bold self-end text-sm">
              →
            </span>
          </div>

          <div className="bg-emerald-100 p-6 rounded-md flex flex-col justify-between h-36 relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
            <div>
              <h3 className="text-emerald-900 text-2xl font-normal font-['Fredoka']">
                Limpeza
              </h3>
              <p className="text-neutral-600 text-xs mt-2">
                Casa limpa, vida leve
              </p>
            </div>
            <span className="text-emerald-700 font-bold self-end text-sm">
              →
            </span>
          </div>
        </div>
      </section>

      {/* 8. Seção Favoritos da Família */}
      <section className="w-full py-12 px-6 md:px-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-2">
          <div>
            <span className="text-emerald-700 text-xs font-black uppercase tracking-wider block">
              PRA FACILITAR SEU DIA
            </span>
            <h2 className="text-3xl font-semibold font-['Fredoka'] text-emerald-900 mt-1">
              Favoritos da família
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              O básico de sempre, pertinho de você.
            </p>
          </div>
          <button className="text-emerald-700 font-extrabold text-sm hover:underline self-start md:self-auto">
            Ver catálogo completo →
          </button>
        </div>

        <div className="flex flex-wrap gap-6 justify-center md:justify-start">
          {favoriteProducts.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </section>

      {/* 9. Banner Chamada de Encerramento */}
      <section className="w-full bg-emerald-900 py-12 px-6 md:px-20 flex flex-col md:flex-row items-center justify-between text-white gap-6">
        <div>
          <span className="text-amber-500 text-xs font-black uppercase tracking-wider block">
            VORA SUPERMARKET
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold font-['Fredoka'] mt-1">
            Sua lista fica mais leve por aqui.
          </h2>
          <p className="text-gray-200 text-sm mt-2">
            Mais praticidade para comprar tudo que sua casa precisa.
          </p>
        </div>
        <button className="h-11 px-8 bg-white text-emerald-700 font-semibold font-['Fredoka'] text-base rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
          Explorar produtos
        </button>
      </section>

      {/* 10. Rodapé */}
      <footer className="w-full bg-teal-950 text-white py-12 px-6 md:px-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-gray-800">
          {/* Coluna 1 */}
          <div>
            <h4 className="font-['Fredoka'] text-lg font-medium mb-3">VORA</h4>
            <p className="text-neutral-300 text-xs leading-relaxed">
              Tudo que você precisa.
              <br />
              Do básico ao especial, com economia e carinho.
            </p>
          </div>

          {/* Coluna 2 */}
          <div>
            <h4 className="font-['Fredoka'] text-base font-medium mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>
                <a href="#comida" className="hover:text-white">
                  Comida
                </a>
              </li>
              <li>
                <a href="#snacks" className="hover:text-white">
                  Snacks
                </a>
              </li>
              <li>
                <a href="#limpeza" className="hover:text-white">
                  Limpeza
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 3 */}
          <div>
            <h4 className="font-['Fredoka'] text-base font-medium mb-3">
              Sua compra
            </h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>
                <a href="#carrinho" className="hover:text-white">
                  Meu carrinho
                </a>
              </li>
              <li>
                <a href="#produtos" className="hover:text-white">
                  Todos os produtos
                </a>
              </li>
              <li>
                <a href="#conta" className="hover:text-white">
                  Minha conta
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 4 */}
          <div>
            <h4 className="font-['Fredoka'] text-base font-medium mb-3">
              VORA supermarket
            </h4>
            <p className="text-neutral-300 text-xs leading-relaxed mb-4">
              Mais economia e qualidade para o dia a dia da sua família.
            </p>
            <a
              href="#admin"
              className="text-gray-400 text-xs underline hover:text-white"
            >
              Área do administrador
            </a>
          </div>
        </div>

        <div className="pt-6 text-gray-400 text-xs flex flex-col md:flex-row justify-between items-center gap-2">
          <span>
            © {new Date().getFullYear()} VORA supermarket. Tudo que você
            precisa.
          </span>
          <span>Feito para facilitar sua vida ♡</span>
        </div>
      </footer>
    </div>
  );
}
