const db = require("../database/connection");

function referenciaDoCliente(idPedido, idCliente) {
  return db.execute({
    sql: "SELECT referencia_pagamento FROM pedido WHERE id = ? AND id_cliente = ?",
    args: [idPedido, idCliente],
  }).rows[0];
}

function listarDoPedido(id) {
  return db.execute({
    sql: `SELECT pg.id_transacao_externa, pg.forma_pagamento, s.nome_situacao AS situacao,
                 pg.data_aprovacao
          FROM pagamento pg JOIN situacao s ON s.id = pg.id_situacao
          WHERE pg.id_pedido = ? ORDER BY pg.id DESC`,
    args: [id],
  }).rows;
}

function registrar(pg, situacao, idCliente) {
  return db.transaction(() => {
    const pedido = db.execute({
      sql: "SELECT id, id_cliente, valor_total FROM pedido WHERE referencia_pagamento = ?",
      args: [pg.referencia],
    }).rows[0];
    if (!pedido || (idCliente !== undefined && idCliente !== pedido.id_cliente)) {
      return { processado: false, motivo: "pedido inexistente" };
    }
    if (pg.moeda !== "BRL" || Math.round(pg.valor * 100) !== pedido.valor_total) {
      return { processado: false, motivo: "valor ou moeda divergente" };
    }

    const { rowsAffected } = db.execute({
      sql: `INSERT INTO pagamento
              (id_transacao_externa, forma_pagamento, id_pedido, id_situacao, data_aprovacao, data_criado)
            VALUES (?, ?, ?, (SELECT id FROM situacao WHERE nome_situacao = ?),
                    CASE WHEN ? = 'Aprovado' THEN DATETIME('now') END, DATETIME('now'))
            ON CONFLICT(id_transacao_externa) DO UPDATE SET
              forma_pagamento = excluded.forma_pagamento, id_situacao = excluded.id_situacao,
              data_aprovacao = excluded.data_aprovacao
            WHERE pagamento.id_pedido = excluded.id_pedido
              AND pagamento.id_situacao <> excluded.id_situacao
              AND pagamento.data_aprovacao IS NULL
              AND (? <> 'Pendente' OR pagamento.id_situacao = (SELECT id FROM situacao WHERE nome_situacao = 'Pendente'))`,
      args: [String(pg.id), pg.forma, pedido.id, situacao, situacao, situacao],
    });

    if (situacao === "Aprovado" && rowsAffected) {
      db.execute({
        sql: `UPDATE pedido SET id_situacao = (SELECT id FROM situacao WHERE nome_situacao = 'Pago')
              WHERE id = ? AND id_situacao = (SELECT id FROM situacao WHERE nome_situacao = 'Pendente')`,
        args: [pedido.id],
      });
    }
    return { processado: Boolean(rowsAffected), situacao };
  });
}

module.exports = { referenciaDoCliente, listarDoPedido, registrar };
