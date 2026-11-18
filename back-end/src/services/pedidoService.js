const pedidoModel = require("../models/pedidoModel");
const cepService = require("./cepService");
const mercadoPago = require("./mercadoPagoService");

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

async function gerarPreferencia(pedido) {
  if (preferenciasEmCriacao.has(pedido.id)) return preferenciasEmCriacao.get(pedido.id);
  const tarefa = obterPreferencia(pedido);
  preferenciasEmCriacao.set(pedido.id, tarefa);
  try {
    return await tarefa;
  } finally {
    preferenciasEmCriacao.delete(pedido.id);
  }
}

async function obterPreferencia(pedido) {
  const salva = await pedidoModel.buscarPreferencia(pedido.id);
  if (salva) return salva;

  const referencia = await pedidoModel.referenciaPagamento(pedido.id);
  if (!referencia) return undefined;
  const preferencia = await mercadoPago.criarPreferencia(pedido, referencia);
  return pedidoModel.salvarPreferencia(pedido.id, preferencia);
}

module.exports = { criarPedido, detalharPedido: pedidoModel.buscarPedido, listarPedidos: pedidoModel.listarPedidos, gerarPreferencia };
