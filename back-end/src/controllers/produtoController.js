const produtoService = require("../services/produtoService");

async function listar(req, res) {
  try {
    const { categoria, busca } = req.query;
    const produtos = await produtoService.listarProdutos({ categoria, busca });
    res.status(200).json(produtos);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
}

async function detalhar(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ erro: "ID inválido" });
    }

    const produto = await produtoService.detalharProduto(id);

    if (!produto) {
      return res.status(404).json({ erro: "Produto não encontrado" });
    }

    res.status(200).json(produto);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
}

module.exports = { listar, detalhar };
