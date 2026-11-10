const mercadoPagoService = require("./mercadoPagoService");
const pagamentoModel = require("../models/pagamentoModel");

async function processarPagamento(idPagamento) {
  const pg = await mercadoPagoService.buscarPagamento(idPagamento);

  let aprovado;
  if (pg.status === "approved") {
    aprovado = true;
  } else if (pg.status === "rejected" || pg.status === "cancelled") {
    aprovado = false;
  } else {
    return { processado: false, motivo: `status ${pg.status}` };
  }

  if (!Number.isInteger(pg.id_pedido)) {
    return { processado: false, motivo: "pagamento sem pedido" };
  }

  const pedido = pagamentoModel.buscarPedidoBasico(pg.id_pedido);
  if (!pedido) {
    return { processado: false, motivo: "pedido inexistente" };
  }

  if (pagamentoModel.pagamentoExiste(pg.id)) {
    return { processado: false, motivo: "já registrado" };
  }

  if (aprovado) {
    if (pedido.situacao !== "Pendente") {
      return { processado: false, motivo: "pedido não está pendente" };
    }
    if (Math.round(pg.valor * 100) !== pedido.valor_total) {
      return { processado: false, motivo: "valor divergente" };
    }
  }

  pagamentoModel.registrar({
    idTransacao: pg.id,
    forma: pg.forma,
    idPedido: pedido.id,
    aprovado,
  });

  return { processado: true, aprovado };
}

module.exports = { processarPagamento };
