const pedidoModel = require("../models/pedidoModel");
const cepService = require("./cepService");

function erroDeNegocio(codigo, mensagem) {
  const erro = new Error(mensagem);
  erro.codigo = codigo;
  return erro;
}

async function criarPedido({
  idCliente,
  itens,
  endereco_entrega,
  cep_entrega,
}) {
  const endereco = await cepService.consultarCep(cep_entrega);
  const { valor_frete, prazo_entrega } = cepService.calcularFrete(endereco.uf);

  const quantidades = new Map();
  for (const item of itens) {
    const atual = quantidades.get(item.id_produto) ?? 0;
    quantidades.set(item.id_produto, atual + item.quantidade);
  }

  const itensPedido = [];
  let subtotal = 0;

  for (const [idProduto, quantidade] of quantidades) {
    const produto = await pedidoModel.buscarProdutoAtivo(idProduto);

    if (!produto) {
      throw erroDeNegocio(
        "PRODUTO_INDISPONIVEL",
        `Produto ${idProduto} não encontrado ou inativo`,
      );
    }

    if (produto.estoque < quantidade) {
      throw erroDeNegocio(
        "ESTOQUE_INSUFICIENTE",
        `Estoque insuficiente para "${produto.nome_produto}"`,
      );
    }

    itensPedido.push({
      id_produto: produto.id,
      nome_produto: produto.nome_produto,
      quantidade,
      valor_unitario: produto.preco,
    });
    subtotal += produto.preco * quantidade;
  }

  const valorTotal = subtotal + valor_frete;

  const id = await pedidoModel.gravar(
    {
      endereco_entrega,
      cep_entrega,
      valor_frete,
      prazo_entrega,
      valor_total: valorTotal,
      id_cliente: idCliente,
    },
    itensPedido,
  );

  return {
    id,
    valor_frete,
    prazo_entrega,
    valor_total: valorTotal,
    itens: itensPedido,
  };
}

async function detalharPedido(id, idCliente) {
  return pedidoModel.buscarPedido(id, idCliente);
}

module.exports = { criarPedido, detalharPedido };
