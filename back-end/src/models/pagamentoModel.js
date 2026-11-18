const db = require("../database/connection");
const { idSituacao } = require("./situacaoModel");

async function referenciaDoCliente(idPedido, idCliente) {
  const { rows } = await db.execute({
    sql: "SELECT referencia_pagamento FROM pedido WHERE id = ? AND id_cliente = ?",
    args: [idPedido, idCliente],
  });
  return rows[0];
}

async function listarDoPedido(id, executor = db) {
  const { rows } = await executor.execute({
    sql: `SELECT pg.id_transacao_externa, pg.forma_pagamento, s.nome_situacao AS situacao,
                 pg.data_aprovacao
          FROM pagamento pg JOIN situacao s ON s.id = pg.id_situacao
          WHERE pg.id_pedido = ? ORDER BY pg.id DESC`,
    args: [id],
  });
  return rows;
}

function registrar(pg, situacao, idCliente) {
  return db.transaction(async (tx) => {
    const { rows: [pedido] } = await tx.execute({
      sql: "SELECT id, id_cliente, valor_total FROM pedido WHERE referencia_pagamento = ?",
      args: [pg.referencia],
    });
    if (!pedido || (idCliente !== undefined && idCliente !== pedido.id_cliente)) {
      return { processado: false, motivo: "pedido inexistente" };
    }
    if (pg.moeda !== "BRL" || Math.round(pg.valor * 100) !== pedido.valor_total) {
      return { processado: false, motivo: "valor ou moeda divergente" };
    }

    const idStatusPagamento = await idSituacao(situacao, tx);
    const { rowsAffected } = await tx.execute({
      sql: `INSERT INTO pagamento
              (id_transacao_externa, forma_pagamento, id_pedido, id_situacao, data_aprovacao, data_criado)
            VALUES (?, ?, ?, ?,
                    CASE WHEN ? = 'Aprovado' THEN DATETIME('now') END, DATETIME('now'))
            ON CONFLICT(id_transacao_externa) DO UPDATE SET
              forma_pagamento = excluded.forma_pagamento, id_situacao = excluded.id_situacao,
              data_aprovacao = excluded.data_aprovacao
            WHERE pagamento.id_pedido = excluded.id_pedido
              AND pagamento.id_situacao <> excluded.id_situacao
              AND pagamento.data_aprovacao IS NULL
              AND ? <> 'Pendente'`,
      args: [String(pg.id), pg.forma, pedido.id, idStatusPagamento, situacao, situacao],
    });

    if (situacao === "Aprovado" && rowsAffected) {
      const idPago = await idSituacao("Pago", tx);
      const idPendente = await idSituacao("Pendente", tx);
      await tx.execute({
        sql: "UPDATE pedido SET id_situacao = ? WHERE id = ? AND id_situacao = ?",
        args: [idPago, pedido.id, idPendente],
      });
    }
    return { processado: Boolean(rowsAffected), situacao };
  });
}

module.exports = { referenciaDoCliente, listarDoPedido, registrar };
