const pagamentoService = require("../services/pagamentoService");

async function webhook(req, res) {
  try {
    const tipo = req.body?.type ?? req.query.type;
    const id = req.body?.data?.id ?? req.query["data.id"];

    if (tipo !== "payment" || !/^\d+$/.test(String(id))) {
      return res.sendStatus(200);
    }

    await pagamentoService.processarPagamento(id);
    return res.sendStatus(200);
  } catch (erro) {
    console.error(erro);
    return res.sendStatus(500);
  }
}

async function sincronizar(req, res) {
  try {
    const id = req.body?.payment_id;

    if (!/^\d+$/.test(String(id))) {
      return res.status(400).json({ erro: "payment_id inválido" });
    }

    const resultado = await pagamentoService.processarPagamento(id);
    return res.status(200).json(resultado);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: "Erro interno do servidor" });
  }
}

module.exports = { webhook, sincronizar };
