const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");

function erroMP(codigo, mensagem) {
  const erro = new Error(mensagem);
  erro.codigo = codigo;
  return erro;
}

function cliente() {
  const token = process.env.MP_TEST_ACCESS_TOKEN?.trim();
  if (!token) {
    throw erroMP("MP_NAO_CONFIGURADO", "Configure a credencial de teste do Mercado Pago no servidor");
  }
  return new MercadoPagoConfig({ accessToken: token, options: { timeout: 10000 } });
}

function urlPublica(valor) {
  if (!valor) return undefined;
  try {
    const url = new URL(valor);
    if (url.protocol === "https:" && url.hostname.includes(".") &&
        !url.hostname.endsWith(".localhost") && !/^\d+\.\d+\.\d+\.\d+$/.test(url.hostname)) return url;
  } catch {
    // A configuração é validada antes de enviar a preferência.
  }
  throw erroMP("MP_NAO_CONFIGURADO", "Informe uma URL HTTPS pública para o Mercado Pago");
}

async function criarPreferencia(pedido, referencia) {
  const sdk = new Preference(cliente());
  const items = pedido.itens.map((item) => ({
    id: String(item.id_produto),
    title: item.nome_produto,
    quantity: item.quantidade,
    unit_price: item.valor_unitario / 100,
    currency_id: "BRL",
  }));
  items.push({
    id: "frete", title: "Frete", quantity: 1, unit_price: pedido.valor_frete / 100, currency_id: "BRL",
  });

  const body = { items, external_reference: referencia };
  const baseRetorno = urlPublica(process.env.MP_RETURN_URL);
  if (baseRetorno) {
    const retorno = new URL(`/pedido/${pedido.id}`, baseRetorno).href;
    body.back_urls = { success: retorno, failure: retorno, pending: retorno };
    body.auto_return = "approved";
  }
  const webhook = urlPublica(process.env.MP_WEBHOOK_URL);
  if (webhook && process.env.MP_WEBHOOK_SECRET) body.notification_url = webhook.href;

  const resposta = await sdk.create({ body, requestOptions: { idempotencyKey: referencia } })
    .catch(() => { throw erroMP("MP_INDISPONIVEL", "Não foi possível abrir o Checkout Pro. Confira a configuração de teste e tente novamente."); });
  const link = resposta.init_point ?? resposta.sandbox_init_point;
  if (!resposta.id || !link) throw erroMP("MP_INDISPONIVEL", "O Mercado Pago não devolveu um link de pagamento");
  return { id: resposta.id, link };
}

function normalizar(pg) {
  return {
    id: pg.id,
    status: pg.status,
    forma: pg.payment_type_id ?? "desconhecida",
    referencia: pg.external_reference,
    valor: pg.transaction_amount,
    moeda: pg.currency_id,
  };
}

async function buscarPagamento(id) {
  const sdk = new Payment(cliente());
  const pagamento = await sdk.get({ id })
    .catch(() => { throw erroMP("MP_INDISPONIVEL", "Não foi possível consultar o pagamento"); });
  return normalizar(pagamento);
}

async function preferenciaExpirada(id, referencia) {
  const sdk = new Preference(cliente());
  const preferencia = await sdk.get({ preferenceId: id })
    .catch(() => { throw erroMP("MP_INDISPONIVEL", "Não foi possível verificar o link de pagamento"); });
  return preferencia.external_reference === referencia &&
    preferencia.expires === true &&
    Date.parse(preferencia.expiration_date_to) <= Date.now();
}

async function buscarPorReferencia(referencia) {
  const sdk = new Payment(cliente());
  const resposta = await sdk.search({
    options: { external_reference: referencia, sort: "date_created", criteria: "desc", limit: 50 },
  }).catch(() => { throw erroMP("MP_INDISPONIVEL", "Não foi possível consultar os pagamentos do pedido"); });
  return (resposta.results ?? []).toReversed().map(normalizar);
}

module.exports = { criarPreferencia, buscarPagamento, buscarPorReferencia, preferenciaExpirada };
