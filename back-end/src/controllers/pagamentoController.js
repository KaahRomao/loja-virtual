const { createHmac, timingSafeEqual } = require("node:crypto");
const pagamentoService = require("../services/pagamentoService");

function assinaturaValida(req, id, segredo) {
  const assinatura = req.get("x-signature");
  const reqId = req.get("x-request-id");
  if (!assinatura || !reqId) return false;

  const partes = Object.fromEntries(assinatura.split(",").map((p) => p.trim().split("=")));
  if (!/^\d+$/.test(partes.ts ?? "") || !/^[a-f\d]{64}$/i.test(partes.v1 ?? "")) return false;

  const manifesto = `id:${id};request-id:${reqId};ts:${partes.ts};`;
  const hash = createHmac("sha256", segredo).update(manifesto).digest();
  return timingSafeEqual(hash, Buffer.from(partes.v1, "hex"));
}

async function webhook(req, res) {
  const tipo = req.body?.type ?? req.query.type;
  if (tipo !== "payment") return res.sendStatus(200);
  const segredo = process.env.MP_WEBHOOK_SECRET?.trim();
  if (!segredo) {
    console.error("Webhook do Mercado Pago: segredo de assinatura ausente");
    return res.sendStatus(503);
  }
  const id = req.query["data.id"];
  if (typeof id !== "string" || !/^\d+$/.test(id) || !assinaturaValida(req, id, segredo)) {
    return res.sendStatus(401);
  }

  try {
    await pagamentoService.processarPagamento(id);
    return res.sendStatus(200);
  } catch (erro) {
    console.error("Falha ao processar webhook do Mercado Pago:", erro.codigo ?? erro.code ?? erro.name);
    return res.sendStatus(502);
  }
}

async function sincronizar(req, res, next) {
  try {
    const { payment_id: id, pedido_id } = req.body ?? {};
    if (id !== undefined && !/^\d+$/.test(String(id))) {
      return res.status(400).json({ erro: "payment_id inválido" });
    }
    if (pedido_id !== undefined && (!Number.isSafeInteger(pedido_id) || pedido_id <= 0)) {
      return res.status(400).json({ erro: "pedido_id inválido" });
    }
    if (id === undefined && pedido_id === undefined) {
      return res.status(400).json({ erro: "Informe pedido_id ou payment_id" });
    }

    const resultado = await pagamentoService.processarPagamento(id, req.clienteId, pedido_id);
    if (!resultado) return res.status(404).json({ erro: "Pedido não encontrado" });
    return res.status(200).json(resultado);
  } catch (erro) {
    if (erro.codigo === "MP_NAO_CONFIGURADO") return res.status(503).json({ erro: erro.message });
    if (erro.codigo === "MP_INDISPONIVEL") return res.status(502).json({ erro: erro.message });
    return next(erro);
  }
}

module.exports = { webhook, sincronizar };
