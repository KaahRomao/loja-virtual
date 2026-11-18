import { useRef, useState } from "react";
import { CreditCard, ArrowLeft } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useStore } from "../hooks/useStore";
import { formatPrice, formatZip } from "../data/products";
import { CheckoutSteps, OrderSummary, EmptyCart } from "../components/CheckoutParts";
import Button from "../components/ui/Button";
import { formCard, formError, pillLink } from "../components/ui/styles";
import { readSession, request, writeSession } from "../services/api";

export default function CheckoutPayment() {
  const { cartItems, address, total, user, clearCart, refreshProducts, logout } = useStore();
  const navigate = useNavigate();
  const tentativa = useRef(null);
  const enviando = useRef(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (cartItems.length && (!address.name || address.freight === null)) {
    return <Navigate to="/checkout/endereco" replace />;
  }

  async function confirmar() {
    if (enviando.current) return;
    enviando.current = true;
    setBusy(true);
    setError("");
    const endereco = [address.name, `${address.street}, ${address.number}`, address.complement,
      address.neighborhood, `${address.city}/${address.uf}`].filter(Boolean).join(" · ");
    const dados = {
      itens: cartItems.map((item) => ({ id_produto: item.id, quantidade: item.qty })),
      endereco_entrega: endereco,
      cep_entrega: address.zip,
    };

    const key = `checkout_${user.id}`;
    const fingerprint = JSON.stringify(dados);
    const anterior = tentativa.current ?? readSession(key);
    if (anterior?.fingerprint === fingerprint) tentativa.current = anterior;
    else tentativa.current = { fingerprint, id: globalThis.crypto.randomUUID() };
    writeSession(key, tentativa.current);

    try {
      const pedido = await request("/pedidos", {
        method: "POST", token: user.token, body: { ...dados, chave_checkout: tentativa.current.id },
      });
      writeSession(`pedido_${user.id}`, pedido.id);
      writeSession(key, null);
      clearCart();
      refreshProducts();
      navigate(`/pedido/${pedido.id}`, { replace: true });
    } catch (erro) {
      if (erro.status === 401) {
        logout({ preserveAddress: true });
        navigate("/entrar", { replace: true, state: { returnTo: "/checkout/pagamento" } });
      } else setError(erro.message);
    } finally {
      enviando.current = false;
      setBusy(false);
    }
  }

  return (
    <section className="container-shell min-h-[620px] pt-[30px] pb-[90px]">
      <CheckoutSteps step={2} />
      <h1 className="mt-[18px] mb-[22px] font-display text-[34px] font-bold text-deep">Pagamento</h1>
      {cartItems.length === 0 ? <EmptyCart /> : (
        <div className="grid grid-cols-[minmax(0,1fr)_340px] items-start gap-7 tablet:grid-cols-[1fr]">
          <div className={formCard}>
            <div className="flex gap-3 rounded-[14px] border-2 border-primary bg-accent p-4">
              <CreditCard className="shrink-0 text-primary" />
              <div><b>Mercado Pago</b><p className="text-sm">Você concluirá o pagamento no Checkout Pro do Mercado Pago.</p></div>
            </div>
            <div className="grid gap-1 rounded-[14px] bg-muted p-3.5 text-[14px]">
              <b>Entregar para {address.name}</b>
              <span>{address.street}, {address.number} · CEP {formatZip(address.zip)}</span>
              <span>{address.city}/{address.uf} · até {address.deliveryDays} dias úteis</span>
            </div>
            {error && <p className={formError} role="alert">{error}</p>}
            <div className="flex flex-wrap gap-3">
              <Link className={pillLink("outline", "md")} to="/checkout/endereco"><ArrowLeft size={16} /> Voltar</Link>
              <Button size="lg" onClick={confirmar} disabled={busy}>
                {busy ? "Registrando pedido…" : `Confirmar pedido · ${formatPrice(total + address.freight / 100)}`}
              </Button>
            </div>
          </div>
          <OrderSummary />
        </div>
      )}
    </section>
  );
}
