const produtoModel = require("../models/produtoModel");

async function listarProdutos(filtros) {
  return produtoModel.listar(filtros);
}

async function detalharProduto(id) {
  return produtoModel.buscarPorId(id);
}

module.exports = { listarProdutos, detalharProduto };
