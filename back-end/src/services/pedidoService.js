const pedidoModel = require("../models/pedidoModel");
const cepService = require("./cepService");
const mercadoPago = require("./mercadoPagoService");

const preferenciasEmCriacao = new Map();

async function criarPedido({ idCliente, itens, endereco_entrega, cep_entrega, chave_checkout }) {
  const dados = { endereco_entrega, cep_entrega, chave_checkout, id_cliente: idCliente };
  const quantidades = new Map();
  for (const item of itens) {
    quantidades.set(item.id_produto, (quantidades.get(item.id_produto) ?? 0) + item.quantidade);
  }
  const existente = pedidoModel.buscarReenvio(dados, quantidades);
  if (existente) return existente;

  const endereco = await cepService.consultarCep(cep_entrega);
  const frete = cepService.calcularFrete(endereco.uf);
  return pedidoModel.gravar({ ...dados, ...frete }, quantidades);
}

async function gerarPreferencia(pedido) {
  const salva = pedidoModel.buscarPreferencia(pedido.id);
  if (salva) return salva;
  if (preferenciasEmCriacao.has(pedido.id)) return preferenciasEmCriacao.get(pedido.id);

  const referencia = pedidoModel.referenciaPagamento(pedido.id);
  if (!referencia) return undefined;

  const tarefa = mercadoPago.criarPreferencia(pedido, referencia).then((preferencia) =>
    pedidoModel.salvarPreferencia(pedido.id, preferencia)
  );
  preferenciasEmCriacao.set(pedido.id, tarefa);
  try {
    return await tarefa;
  } finally {
    preferenciasEmCriacao.delete(pedido.id);
  }
}

module.exports = { criarPedido, detalharPedido: pedidoModel.buscarPedido, gerarPreferencia };
