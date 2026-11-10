const db = require("../database/connection");

function buscarPedidoBasico(id) {
  return db
    .prepare(
      `SELECT p.id, p.valor_total, s.nome_situacao AS situacao
       FROM pedido p
       JOIN situacao s ON s.id = p.id_situacao
       WHERE p.id = ?`,
    )
    .get(id);
}

function pagamentoExiste(idTransacao) {
  const linha = db
    .prepare("SELECT 1 FROM pagamento WHERE id_transacao_externa = ?")
    .get(String(idTransacao));
  return linha !== undefined;
}

const registrar = db.transaction(
  ({ idTransacao, forma, idPedido, aprovado }) => {
    const agora = new Date().toISOString();

    db.prepare(
      `INSERT INTO pagamento
         (id_transacao_externa, forma_pagamento, id_pedido,
          data_aprovacao, id_situacao, data_criado)
       VALUES
         (?, ?, ?, ?, (SELECT id FROM situacao WHERE nome_situacao = ?), ?)`,
    ).run(
      String(idTransacao),
      forma,
      idPedido,
      aprovado ? agora : null,
      aprovado ? "Aprovado" : "Recusado",
      agora,
    );

    if (aprovado) {
      db.prepare(
        `UPDATE pedido
         SET id_situacao = (SELECT id FROM situacao WHERE nome_situacao = 'Pago')
         WHERE id = ?`,
      ).run(idPedido);
    }
  },
);

module.exports = { buscarPedidoBasico, pagamentoExiste, registrar };
