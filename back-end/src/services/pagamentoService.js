const mercadoPago = require("./mercadoPagoService");
const pagamentoModel = require("../models/pagamentoModel");

const situacoes = new Map([
  ["approved", "Aprovado"], ["rejected", "Recusado"], ["cancelled", "Recusado"],
  ["pending", "Pendente"], ["in_process", "Pendente"], ["authorized", "Pendente"],
]);

function registrar(pg, idCliente) {
  const situacao = situacoes.get(pg.status);
  if (!situacao || !pg.id || !pg.referencia) {
    return { processado: false, motivo: "pagamento sem status reconhecido ou sem referência" };
  }
  return pagamentoModel.registrar(pg, situacao, idCliente);
}

async function processarPagamento(id, idCliente, idPedido) {
  if (idPedido === undefined) return registrar(await mercadoPago.buscarPagamento(id), idCliente);

  const pedido = await pagamentoModel.referenciaDoCliente(idPedido, idCliente);
  if (!pedido) return null;
  if (!pedido.referencia_pagamento) return { processado: false };

  if (id) {
    const pg = await mercadoPago.buscarPagamento(id);
    if (pg.referencia !== pedido.referencia_pagamento) return { processado: false };
    return registrar(pg, idCliente);
  }
  const pagamentos = await mercadoPago.buscarPorReferencia(pedido.referencia_pagamento);
  const vinculados = pagamentos.filter((pg) => pg.referencia === pedido.referencia_pagamento);
  const resultados = [];
  for (const pg of vinculados) resultados.push(await registrar(pg, idCliente));
  return {
    processado: resultados.some((resultado) => resultado.processado),
    pagamento_em_curso: vinculados.some((pg) => ["Pendente", "Aprovado"].includes(situacoes.get(pg.status))),
  };
}

module.exports = { processarPagamento };
