const produtoModel = require("../models/produtoModel");

function listarProdutos(filtros) {
  return produtoModel.listar(filtros);
}

function detalharProduto(id) {
  return produtoModel.buscarPorId(id);
}

module.exports = { listarProdutos, detalharProduto };
