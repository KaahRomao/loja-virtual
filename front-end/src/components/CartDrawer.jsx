import React, { useState } from "react";

export function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) {
  const [cep, setCep] = useState("");
  const [cepInfo, setCepInfo] = useState(null);
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const frete = cepInfo ? cepInfo.frete : 0;
  const total = subtotal + frete;

  const handleBuscarCep = async () => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      setCepError("Digite um CEP válido com 8 dígitos.");
      return;
    }

    setLoadingCep(true);
    setCepError("");

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (data.erro) {
        setCepError("CEP não encontrado.");
        setCepInfo(null);
      } else {
        const isSP = data.uf === "SP";
        setCepInfo({
          logradouro: data.logradouro || "Rua informada",
          bairro: data.bairro || "Bairro",
          cidade: data.localidade,
          uf: data.uf,
          frete: isSP ? 9.9 : 19.9,
          prazo: isSP ? 2 : 5,
        });
      }
    } catch (err) {
      setCepError("Erro ao consultar o CEP.");
    } finally {
      setLoadingCep(false);
    }
  };

  const handleFinalizarPedido = () => {
    setOrderSuccess(true);
    setTimeout(() => {
      onClearCart();
      setOrderSuccess(false);
      onClose();
    }, 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Cabeçalho do Carrinho */}
          <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-emerald-800 text-white">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛒</span>
              <h2 className="font-['Fredoka'] text-xl font-semibold">
                Meu Carrinho
              </h2>
              <span className="bg-amber-400 text-emerald-950 font-bold text-xs px-2 py-0.5 rounded-full">
                {cartItems.reduce((a, b) => a + b.quantity, 0)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-emerald-100 hover:text-white text-2xl font-bold cursor-pointer"
            >
              ×
            </button>
          </div>

          {/* Conteúdo Central */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {orderSuccess ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
                  ✓
                </div>
                <h3 className="text-2xl font-bold font-['Fredoka'] text-emerald-950">
                  Pedido realizado!
                </h3>
                <p className="text-sm text-gray-600">
                  Obrigado por comprar no VORA Supermarket.
                </p>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <span className="text-5xl block text-gray-300">🛒</span>
                <p className="text-gray-500 text-sm">
                  Seu carrinho está vazio.
                </p>
                <button
                  onClick={onClose}
                  className="text-emerald-700 font-bold text-sm hover:underline cursor-pointer"
                >
                  Explorar produtos →
                </button>
              </div>
            ) : (
              <>
                {/* Lista de Itens */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <h4 className="font-['Fredoka'] text-sm font-semibold text-emerald-950">
                            {item.name}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {item.unit}
                          </span>
                          <div className="text-sm font-bold text-emerald-800">
                            R${" "}
                            {(item.price * item.quantity)
                              .toFixed(2)
                              .replace(".", ",")}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                          <button
                            onClick={() =>
                              onUpdateQuantity(item.id, item.quantity - 1)
                            }
                            className="px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100 rounded-l-lg font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-bold text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              onUpdateQuantity(item.id, item.quantity + 1)
                            }
                            className="px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100 rounded-r-lg font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-gray-400 hover:text-red-500 text-sm p-1 cursor-pointer"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Calculadora de CEP */}
                <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-2 mt-4">
                  <label
                    htmlFor="cepDrawer"
                    className="block text-xs font-bold text-emerald-900"
                  >
                    Calcular entrega (ViaCEP)
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="cepDrawer"
                      type="text"
                      placeholder="00000-000"
                      value={cep}
                      onChange={(e) =>
                        setCep(e.target.value.replace(/\D/g, "").slice(0, 8))
                      }
                      className="flex-1 bg-white border border-emerald-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-700"
                    />
                    <button
                      onClick={handleBuscarCep}
                      disabled={loadingCep}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 text-xs font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {loadingCep ? "..." : "Calcular"}
                    </button>
                  </div>
                  {cepError && (
                    <p className="text-[11px] text-red-600">{cepError}</p>
                  )}
                  {cepInfo && (
                    <div className="text-xs text-emerald-900 bg-white p-2.5 rounded-lg border border-emerald-200 space-y-1">
                      <p className="font-semibold">
                        {cepInfo.logradouro} - {cepInfo.cidade}/{cepInfo.uf}
                      </p>
                      <div className="flex justify-between text-gray-600">
                        <span>Chega em até {cepInfo.prazo} dias úteis</span>
                        <span className="font-bold text-emerald-800">
                          R$ {cepInfo.frete.toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Rodapé com Totais e Botão */}
          {cartItems.length > 0 && !orderSuccess && (
            <div className="p-5 border-t border-gray-200 bg-gray-50 space-y-3">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
              </div>
              {cepInfo && (
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Frete</span>
                  <span>R$ {frete.toFixed(2).replace(".", ",")}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-base pt-2 border-t border-gray-200">
                <span className="font-semibold font-['Fredoka'] text-emerald-950">
                  Total
                </span>
                <strong className="text-2xl font-bold font-['Fredoka'] text-emerald-950">
                  R$ {total.toFixed(2).replace(".", ",")}
                </strong>
              </div>

              <button
                onClick={handleFinalizarPedido}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold font-['Fredoka'] py-3 rounded-xl transition-colors shadow-sm text-center block cursor-pointer"
              >
                Finalizar Compra →
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
