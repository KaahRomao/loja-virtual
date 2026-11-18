const pedidoService = require("../services/pedidoService");

async function criar(req, res) {
  try {
    const { itens, endereco_entrega, cep_entrega, chave_checkout } = req.body ?? {};

    if (!Array.isArray(itens) || itens.length === 0) {
      return res
        .status(400)
        .json({ erro: "itens deve ser uma lista com pelo menos 1 item" });
    }

    const itensValidos = itens.every(
      (i) =>
        Number.isSafeInteger(i?.id_produto) &&
        i.id_produto > 0 &&
        Number.isSafeInteger(i?.quantidade) &&
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

    if (chave_checkout !== undefined &&
        (typeof chave_checkout !== "string" ||
         !/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(chave_checkout))) {
      return res.status(400).json({ erro: "Chave do checkout inválida" });
    }

    const pedido = await pedidoService.criarPedido({
      chave_checkout,
      idCliente: req.clienteId,
      itens,
      endereco_entrega: endereco_entrega.trim(),
      cep_entrega: cep_entrega.trim(),
    });

    res.status(201).json(pedido);
  } catch (erro) {
    if (erro.codigo === "PRODUTO_INDISPONIVEL" || erro.codigo === "TOTAL_INVALIDO") {
      return res.status(400).json({ erro: erro.message });
    }
    if (erro.codigo === "ESTOQUE_INSUFICIENTE" || erro.codigo === "CHAVE_CHECKOUT_CONFLITANTE") {
      return res.status(409).json({ erro: erro.message });
    }
    if (erro.codigo === "CEP_INVALIDO") {
      return res.status(400).json({ erro: erro.message });
    }
    if (erro.codigo === "CEP_NAO_ENCONTRADO") {
      return res.status(404).json({ erro: erro.message });
    }
    if (erro.codigo === "CEP_SERVICO_INDISPONIVEL") {
      return res.status(502).json({ erro: erro.message });
    }
    console.error(erro);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
}

async function detalhar(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({ erro: "ID do pedido inválido" });
    }

    const pedido = await pedidoService.detalharPedido(id, req.clienteId);

    if (!pedido) {
      return res.status(404).json({ erro: "Pedido não encontrado" });
    }

    return res.status(200).json(pedido);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: "Erro interno do servidor" });
  }
}

async function pagar(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({ erro: "ID do pedido inválido" });
    }

    const pedido = await pedidoService.detalharPedido(id, req.clienteId);
    if (!pedido) {
      return res.status(404).json({ erro: "Pedido não encontrado" });
    }
    if (pedido.situacao !== "Pendente") {
      return res.status(409).json({ erro: "Pedido não está pendente" });
    }

    const preferencia = await pedidoService.gerarPreferencia(pedido, req.clienteId);
    if (!preferencia) return res.status(409).json({ erro: "Pedido não está pendente" });
    return res.status(200).json({ ...preferencia, retorno_configurado: Boolean(process.env.MP_RETURN_URL) });
  } catch (erro) {
    if (erro.codigo === "PAGAMENTO_EM_CURSO") {
      return res.status(409).json({ erro: erro.message });
    }
    if (erro.codigo === "MP_NAO_CONFIGURADO") {
      return res.status(503).json({ erro: erro.message });
    }
    if (erro.codigo === "MP_INDISPONIVEL") {
      return res.status(502).json({ erro: erro.message });
    }
    console.error(erro);
    return res.status(500).json({ erro: "Erro interno do servidor" });
  }
}

async function listar(req, res, next) {
  try {
    res.json(await pedidoService.listarPedidos(req.clienteId));
  } catch (erro) {
    next(erro);
  }
}

async function cancelar(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ erro: "ID do pedido inválido" });
  }
  try {
    return res.json(await pedidoService.cancelarPedido(id, req.clienteId));
  } catch (erro) {
    const status = {
      PEDIDO_NAO_ENCONTRADO: 404, CONFLITO: 409, TRANSICAO_INVALIDA: 409,
      MP_INDISPONIVEL: 502, MP_NAO_CONFIGURADO: 503,
    }[erro.codigo];
    if (status) return res.status(status).json({ erro: erro.message });
    return next(erro);
  }
}

module.exports = { criar, detalhar, listar, pagar, cancelar };
