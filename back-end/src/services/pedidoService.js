const pedidoModel = require("../models/pedidoModel");
const cepService = require("./cepService");
const mercadoPago = require("./mercadoPagoService");
const pagamentos = require("./pagamentoService");

const preferenciasEmCriacao = new Map();

async function criarPedido({ idCliente, itens, endereco_entrega, cep_entrega, chave_checkout }) {
  const dados = { endereco_entrega, cep_entrega, chave_checkout, id_cliente: idCliente };
  const quantidades = new Map();
  for (const item of itens) {
    const quantidade = (quantidades.get(item.id_produto) ?? 0) + item.quantidade;
    if (!Number.isSafeInteger(quantidade)) {
      const erro = new Error("Quantidade total do produto acima do limite permitido");
      erro.codigo = "TOTAL_INVALIDO";
      throw erro;
    }
    quantidades.set(item.id_produto, quantidade);
  }
  const existente = await pedidoModel.buscarReenvio(dados, quantidades);
  if (existente) return existente;

  const endereco = await cepService.consultarCep(cep_entrega);
  const frete = cepService.calcularFrete(endereco.uf);
  return pedidoModel.gravar({ ...dados, ...frete }, quantidades);
}

async function gerarPreferencia(pedido, idCliente) {
  if (preferenciasEmCriacao.has(pedido.id)) return preferenciasEmCriacao.get(pedido.id);
  const tarefa = obterPreferencia(pedido, idCliente);
  preferenciasEmCriacao.set(pedido.id, tarefa);
  try {
    return await tarefa;
  } finally {
    preferenciasEmCriacao.delete(pedido.id);
  }
}

async function obterPreferencia(pedido, idCliente) {
  const salva = await pedidoModel.buscarPreferencia(pedido.id);
  if (salva) {
    const atual = await pagamentos.processarPagamento(undefined, idCliente, pedido.id);
    if (atual?.pagamento_em_curso) {
      throw Object.assign(new Error("Já há um pagamento aprovado ou em processamento para este pedido."), { codigo: "PAGAMENTO_EM_CURSO" });
    }
    return pedidoModel.buscarPreferencia(pedido.id);
  }

  const referencia = await pedidoModel.referenciaPagamento(pedido.id);
  if (!referencia) return undefined;
  const preferencia = await mercadoPago.criarPreferencia(pedido, referencia);
  return pedidoModel.salvarPreferencia(pedido.id, preferencia);
}

async function cancelarPedido(id, idCliente) {
  const checkout = await pedidoModel.buscarCheckout(id);
  if (!checkout || (idCliente !== undefined && checkout.id_cliente !== idCliente)) {
    throw Object.assign(new Error("Pedido não encontrado"), { codigo: "PEDIDO_NAO_ENCONTRADO" });
  }
  if (checkout.situacao !== "Pendente") {
    throw Object.assign(new Error("Somente pedidos pendentes podem ser cancelados."), { codigo: "TRANSICAO_INVALIDA" });
  }
  if (checkout.preferencia_id) {
    const expirada = await mercadoPago.preferenciaExpirada(checkout.preferencia_id, checkout.referencia_pagamento);
    if (!expirada) {
      throw Object.assign(new Error("O link de pagamento ainda está ativo. O pedido só pode ser cancelado depois que o link expirar."), { codigo: "CONFLITO" });
    }
    const resultado = await pagamentos.processarPagamento(undefined, checkout.id_cliente, id);
    if (resultado?.pagamento_em_curso) {
      throw Object.assign(new Error("Há um pagamento pendente ou aprovado para este pedido."), { codigo: "CONFLITO" });
    }
  }
  await pedidoModel.alterarSituacaoPedido(id, "Pendente", "Cancelado", checkout.preferencia_id);
  return pedidoModel.buscarPedido(id, checkout.id_cliente);
}

module.exports = {
  criarPedido, cancelarPedido, detalharPedido: pedidoModel.buscarPedido,
  listarPedidos: pedidoModel.listarPedidos, gerarPreferencia,
};
