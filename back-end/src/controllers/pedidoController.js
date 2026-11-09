const pedidoService = require("../services/pedidoService");

function criar(req, res) {
  try {
    const { itens, endereco_entrega, cep_entrega } = req.body ?? {};

    if (!Array.isArray(itens) || itens.length === 0) {
      return res
        .status(400)
        .json({ erro: "itens deve ser uma lista com pelo menos 1 item" });
    }

    const itensValidos = itens.every(
      (i) =>
        Number.isInteger(i?.id_produto) &&
        i.id_produto > 0 &&
        Number.isInteger(i?.quantidade) &&
        i.quantidade > 0,
    );
    if (!itensValidos) {
      return res.status(400).json({
        erro: "cada item precisa de id_produto e quantidade inteiros e positivos",
      });
    }

    if (typeof endereco_entrega !== "string" || !endereco_entrega.trim()) {
      return res.status(400).json({ erro: "endereco_entrega é obrigatório" });
    }

    if (
      typeof cep_entrega !== "string" ||
      !/^\d{5}-?\d{3}$/.test(cep_entrega.trim())
    ) {
      return res.status(400).json({ erro: "CEP inválido" });
    }

    const pedido = pedidoService.criarPedido({
      idCliente: req.clienteId,
      itens,
      endereco_entrega: endereco_entrega.trim(),
      cep_entrega: cep_entrega.trim(),
    });

    res.status(201).json(pedido);
  } catch (erro) {
    if (erro.codigo === "PRODUTO_INDISPONIVEL") {
      return res.status(400).json({ erro: erro.message });
    }
    if (erro.codigo === "ESTOQUE_INSUFICIENTE") {
      return res.status(409).json({ erro: erro.message });
    }
    console.error(erro);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
}

function detalhar(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ erro: "ID do pedido inválido" });
    }

    const pedido = pedidoService.detalharPedido(id, req.clienteId);

    if (!pedido) {
      return res.status(404).json({ erro: "Pedido não encontrado" });
    }

    return res.status(200).json(pedido);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: "Erro interno do servidor" });
  }
}

module.exports = { criar, detalhar };
