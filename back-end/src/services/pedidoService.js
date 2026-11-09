const pedidoModel = require("../models/pedidoModel");

const FRETE_FIXO = 1500; // TODO etapa 7: calcular pelo CEP
const PRAZO_FIXO = 5; // TODO etapa 7: calcular pelo CEP

function erroDeNegocio(codigo, mensagem) {
  const erro = new Error(mensagem);
  erro.codigo = codigo;
  return erro;
}

function criarPedido({ idCliente, itens, endereco_entrega, cep_entrega }) {
  const quantidades = new Map();
  for (const item of itens) {
    const atual = quantidades.get(item.id_produto) ?? 0;
    quantidades.set(item.id_produto, atual + item.quantidade);
  }

  const itensPedido = [];
  let subtotal = 0;

  for (const [idProduto, quantidade] of quantidades) {
    const produto = pedidoModel.buscarProdutoAtivo(idProduto);

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

  const valorTotal = subtotal + FRETE_FIXO;

  const id = pedidoModel.gravar(
    {
      endereco_entrega,
      cep_entrega,
      valor_frete: FRETE_FIXO,
      prazo_entrega: PRAZO_FIXO,
      valor_total: valorTotal,
      id_cliente: idCliente,
    },
    itensPedido,
  );

  return {
    id,
    valor_frete: FRETE_FIXO,
    prazo_entrega: PRAZO_FIXO,
    valor_total: valorTotal,
    itens: itensPedido,
  };
}

function detalharPedido(id, idCliente) {
  return pedidoModel.buscarPedido(id, idCliente);
}

module.exports = { criarPedido, detalharPedido };
