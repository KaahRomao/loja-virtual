const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");

function cliente() {
  return new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
}

async function criarPreferencia(pedido) {
  const items = pedido.itens.map((item) => ({
    id: String(item.id_produto),
    title: item.nome_produto,
    quantity: item.quantidade,
    unit_price: item.valor_unitario / 100,
    currency_id: "BRL",
  }));

  items.push({
    id: "frete",
    title: "Frete",
    quantity: 1,
    unit_price: pedido.valor_frete / 100,
    currency_id: "BRL",
  });

  const resposta = await new Preference(cliente()).create({
    body: {
      items,
      external_reference: String(pedido.id),
      notification_url: `${process.env.API_URL}/pagamentos/webhook`,
      back_urls: {
        success: `${process.env.FRONT_URL}/pedido/${pedido.id}`,
        failure: `${process.env.FRONT_URL}/pedido/${pedido.id}`,
        pending: `${process.env.FRONT_URL}/pedido/${pedido.id}`,
      },
    },
  });

  return { id: resposta.id, link: resposta.init_point };
}

async function buscarPagamento(idPagamento) {
  const pagamento = await new Payment(cliente()).get({ id: idPagamento });
  return {
    id: pagamento.id,
    status: pagamento.status,
    id_pedido: Number(pagamento.external_reference),
    valor: pagamento.transaction_amount,
  };
}

module.exports = { criarPreferencia, buscarPagamento };
