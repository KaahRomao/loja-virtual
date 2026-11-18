const produtoService = require("../services/produtoService");

async function listar(req, res, next) {
  try {
    const { categoria, busca } = req.query;
    if ((categoria !== undefined && (typeof categoria !== "string" || !/^[1-9]\d*$/.test(categoria))) ||
        (busca !== undefined && (typeof busca !== "string" || busca.length > 150))) {
      return res.status(400).json({ erro: "Filtro de produtos inválido" });
    }
    const produtos = await produtoService.listarProdutos({ categoria, busca });
    res.status(200).json(produtos);
  } catch (erro) {
    return next(erro);
  }
}

async function detalhar(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({ erro: "ID inválido" });
    }

    const produto = await produtoService.detalharProduto(id);

    if (!produto) {
      return res.status(404).json({ erro: "Produto não encontrado" });
    }

    res.status(200).json(produto);
  } catch (erro) {
    return next(erro);
  }
}

module.exports = { listar, detalhar };
