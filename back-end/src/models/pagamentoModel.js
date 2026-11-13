const db = require("../database/connection");

async function buscarPedidoBasico(id) {
  const resultado = await db.execute({
    sql: `SELECT p.id, p.valor_total, s.nome_situacao AS situacao
          FROM pedido p
          JOIN situacao s ON s.id = p.id_situacao
          WHERE p.id = ?`,
    args: [id],
  });
  return resultado.rows[0];
}

async function pagamentoExiste(idTransacao) {
  const resultado = await db.execute({
    sql: "SELECT 1 FROM pagamento WHERE id_transacao_externa = ?",
    args: [String(idTransacao)],
  });
  return resultado.rows[0] !== undefined;
}

async function registrar({ idTransacao, forma, idPedido, aprovado }) {
  const agora = new Date().toISOString().replace("T", " ").slice(0, 19);

  const comandos = [
    {
      sql: `INSERT INTO pagamento
              (id_transacao_externa, forma_pagamento, id_pedido,
               data_aprovacao, id_situacao, data_criado)
            VALUES
              (?, ?, ?, ?, (SELECT id FROM situacao WHERE nome_situacao = ?), ?)`,
      args: [
        String(idTransacao),
        forma,
        idPedido,
        aprovado ? agora : null,
        aprovado ? "Aprovado" : "Recusado",
        agora,
      ],
    },
  ];

  if (aprovado) {
    comandos.push({
      sql: `UPDATE pedido
            SET id_situacao = (SELECT id FROM situacao WHERE nome_situacao = 'Pago')
            WHERE id = ?`,
      args: [idPedido],
    });
  }

  await db.batch(comandos, "write");
}

module.exports = { buscarPedidoBasico, pagamentoExiste, registrar };
