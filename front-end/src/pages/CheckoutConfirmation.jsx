import { useEffect, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import { useStore } from "../hooks/useStore";
import { formatPrice, formatZip } from "../data/products";
import { CheckoutSteps } from "../components/CheckoutParts";
import Button from "../components/ui/Button";
import { formCard, formError, pillLink } from "../components/ui/styles";
import { readSession, request } from "../services/api";

export default function CheckoutConfirmation() {
  const { id } = useParams();
  const { user, logout } = useStore();
  const location = useLocation();
  if (!user) {
    return (
      <section className="container-shell grid justify-items-start gap-4 py-16">
        <h1 className="font-display text-3xl font-bold">Acompanhar pedido</h1>
        <p>Entre na sua conta para ver a situação do pedido.</p>
        <Link className={pillLink("primary", "lg")} to="/entrar" state={{ returnTo: location.pathname + location.search }}>
          Entrar
        </Link>
      </section>
    );
  }
  const pedidoId = id ?? readSession(`pedido_${user.id}`);
  if (!pedidoId) {
    return <p className="container-shell py-16">Nenhum pedido para acompanhar nesta sessão.</p>;
  }
  return <Pedido key={`${user.id}-${pedidoId}`} id={pedidoId} token={user.token} expirar={() => logout("cliente")} />;
}

function Pedido({ id, token, expirar }) {
  const [params] = useSearchParams();
  const idPagamento = params.get("payment_id") ?? params.get("collection_id");
  const [pedido, setPedido] = useState(null);
  const [error, setError] = useState("");
  const [errorPagamento, setErrorPagamento] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [checkout, setCheckout] = useState(null);
  const [revision, setRevision] = useState(0);
  const caminho = `/pedidos/${id}`;

  useEffect(() => {
    const controller = new AbortController();
    async function consultar() {
      try {
        if (/^\d+$/.test(idPagamento ?? "")) {
          await request("/pagamentos/sincronizar", {
            method: "POST", token, body: { pedido_id: Number(id), payment_id: idPagamento },
            signal: controller.signal,
          }).catch((erro) => {
            if (!controller.signal.aborted) setErrorPagamento(erro.message);
          });
        }
        const dados = await request(caminho, { token, signal: controller.signal });
        setPedido(dados);
      } catch (erro) {
        if (!controller.signal.aborted) setError(erro.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    consultar();
    return () => controller.abort();
  }, [caminho, token, id, idPagamento, revision]);

  async function atualizar() {
    setBusy(true);
    setErrorPagamento("");
    try {
      if (pedido.situacao === "Pendente") {
        await request("/pagamentos/sincronizar", {
          method: "POST", token, body: { pedido_id: Number(id) },
        });
      }
      setPedido(await request(caminho, { token }));
    } catch (erro) {
      if (erro.status === 401) expirar();
      else setErrorPagamento(erro.message);
    } finally {
      setBusy(false);
    }
  }

  async function pagar() {
    setBusy(true);
    setErrorPagamento("");
    try {
      setCheckout(await request(`${caminho}/pagamento`, { method: "POST", token }));
    } catch (erro) {
      if (erro.status === 401) expirar();
      else setErrorPagamento(erro.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="container-shell py-16" role="status">Carregando pedido…</p>;
  if (error) {
    return (
      <section className="container-shell grid justify-items-start gap-3 py-16">
        <p className={formError} role="alert">{error}</p>
        <Button onClick={() => { setError(""); setLoading(true); setRevision((v) => v + 1); }}>Tentar novamente</Button>
        <Button variant="outline" onClick={expirar}>Voltar ao login</Button>
      </section>
    );
  }

  const pagamento = pedido.pagamentos.find((p) => p.situacao === "Aprovado") ?? pedido.pagamentos[0];
  return (
    <section className="container-shell min-h-[620px] pt-[30px] pb-[90px]">
      <CheckoutSteps step={pedido.situacao === "Pendente" ? 3 : 4} />
      <h1 className="mt-5 mb-4 font-display text-[34px] font-bold text-deep">Pedido #{pedido.id}</h1>
      <div className={`${formCard} max-w-xl`}>
        <p aria-live="polite"><b>Situação</b> · {pedido.situacao}</p>
        <p><b>Pagamento</b> · {pagamento?.situacao ?? "Aguardando pagamento"}</p>
        {pagamento && <p><b>Transação</b> · {pagamento.id_transacao_externa}</p>}
        <ul className="grid gap-2">
          {pedido.itens.map((item) => (
            <li className="flex justify-between gap-4" key={item.id_produto}>
              <span>{item.quantidade} × {item.nome_produto}</span>
              <b>{formatPrice(item.quantidade * item.valor_unitario / 100)}</b>
            </li>
          ))}
        </ul>
        <p><b>Frete</b> · {formatPrice(pedido.valor_frete / 100)} · até {pedido.prazo_entrega} dias úteis</p>
        <p><b>Total</b> · {formatPrice(pedido.valor_total / 100)}</p>
        <p><b>Entrega</b> · {pedido.endereco_entrega} · {formatZip(pedido.cep_entrega)}</p>
        {errorPagamento && <p className={formError} role="alert">{errorPagamento}</p>}
        <div className="flex flex-wrap gap-2">
          {pedido.situacao === "Pendente" && (checkout ? (
            <a className={pillLink("primary", "md")} href={checkout.link}
              target={checkout.retorno_configurado ? undefined : "_blank"} rel="noopener noreferrer">
              Abrir Checkout Pro
            </a>
          ) : <Button onClick={pagar} disabled={busy}>Preparar pagamento de teste</Button>)}
          <Button variant="outline" onClick={atualizar} disabled={busy}>{busy ? "Aguarde…" : "Atualizar situação"}</Button>
          <Link className={pillLink("outline", "md")} to="/catalogo">Voltar à loja</Link>
        </div>
        {checkout && !checkout.retorno_configurado && <p className="text-sm">Ao concluir o teste na outra aba, volte e selecione Atualizar situação.</p>}
      </div>
    </section>
  );
}
