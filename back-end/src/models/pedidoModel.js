const { randomUUID } = require("node:crypto");
const db = require("../database/connection");
const { listarDoPedido } = require("./pagamentoModel");

function buscarProdutoAtivo(id) {
  return db.execute({
    sql: `SELECT p.id, p.nome_produto, p.preco, p.estoque FROM produto p
          JOIN categoria c ON c.id = p.id_categoria
          JOIN situacao s ON s.id = p.id_situacao
          WHERE p.id = ? AND s.nome_situacao = 'Ativo' AND c.status = 1`,
    args: [id],
  }).rows[0];
}

function buscarReenvio(dados, quantidades) {
  if (!dados.chave_checkout) return undefined;
  const pedido = db.execute({
    sql: "SELECT id FROM pedido WHERE id_cliente = ? AND chave_checkout = ?",
    args: [dados.id_cliente, dados.chave_checkout],
  }).rows[0];
  if (!pedido) return undefined;

  const salvo = buscarPedido(pedido.id, dados.id_cliente);
  const mesmoPedido = salvo.cep_entrega.replace("-", "") === dados.cep_entrega.replace("-", "") &&
    salvo.endereco_entrega === dados.endereco_entrega &&
    salvo.itens.length === quantidades.size &&
    salvo.itens.every((item) => quantidades.get(item.id_produto) === item.quantidade);
  if (!mesmoPedido) {
    const erro = new Error("A chave do checkout já pertence a um pedido com outros dados");
    erro.codigo = "CHAVE_CHECKOUT_CONFLITANTE";
    throw erro;
  }
  return salvo;
}

function gravar(pedido, quantidades) {
  return db.transaction(() => {
    const existente = buscarReenvio(pedido, quantidades);
    if (existente) return existente;

    let valorTotal = pedido.valor_frete;
    const itens = [];
    for (const [id, quantidade] of quantidades) {
      const produto = buscarProdutoAtivo(id);
      if (!produto || produto.preco <= 0) {
        const erro = new Error(`Produto ${id} indisponível`);
        erro.codigo = "PRODUTO_INDISPONIVEL";
        throw erro;
      }
      if (produto.estoque < quantidade) {
        const erro = new Error(`Estoque insuficiente para "${produto.nome_produto}"`);
        erro.codigo = "ESTOQUE_INSUFICIENTE";
        throw erro;
      }
      valorTotal += produto.preco * quantidade;
      if (!Number.isSafeInteger(valorTotal)) {
        const erro = new Error("Valor total do pedido acima do limite permitido");
        erro.codigo = "TOTAL_INVALIDO";
        throw erro;
      }
      itens.push({ id, quantidade, preco: produto.preco });
    }

    const { lastInsertRowid } = db.execute({
      sql: `INSERT INTO pedido
              (endereco_entrega, cep_entrega, valor_frete, prazo_entrega, valor_total,
               id_cliente, id_situacao, chave_checkout, data_criado)
            VALUES (?, ?, ?, ?, ?, ?, (SELECT id FROM situacao WHERE nome_situacao = 'Pendente'), ?, DATETIME('now'))`,
      args: [
        pedido.endereco_entrega, pedido.cep_entrega, pedido.valor_frete,
        pedido.prazo_entrega, valorTotal, pedido.id_cliente, pedido.chave_checkout ?? null,
      ],
    });
    const id = Number(lastInsertRowid);
    for (const item of itens) {
      db.execute({
        sql: "INSERT INTO produto_pedido (id_pedido, id_produto, quantidade, valor_unitario) VALUES (?, ?, ?, ?)",
        args: [id, item.id, item.quantidade, item.preco],
      });
    }

    return buscarPedido(id, pedido.id_cliente);
  });
}

function buscarPedido(id, idCliente) {
  const { rows: [pedido] } = db.execute({
    sql: `SELECT p.id, p.endereco_entrega, p.cep_entrega, p.valor_frete,
                 p.prazo_entrega, p.valor_total, p.data_criado, s.nome_situacao AS situacao
          FROM pedido p JOIN situacao s ON s.id = p.id_situacao
          WHERE p.id = ? AND p.id_cliente = ?`,
    args: [id, idCliente],
  });
  if (!pedido) return undefined;

  const { rows: itens } = db.execute({
    sql: `SELECT pp.id_produto, pr.nome_produto, pp.quantidade, pp.valor_unitario
          FROM produto_pedido pp JOIN produto pr ON pr.id = pp.id_produto
          WHERE pp.id_pedido = ?`,
    args: [id],
  });
  return { ...pedido, itens, pagamentos: listarDoPedido(id) };
}

function referenciaPagamento(id) {
  return db.execute({
    sql: `UPDATE pedido SET referencia_pagamento = COALESCE(referencia_pagamento, ?)
          WHERE id = ? AND id_situacao = (SELECT id FROM situacao WHERE nome_situacao = 'Pendente')
          RETURNING referencia_pagamento`,
    args: [`vora-${randomUUID()}`, id],
  }).rows[0]?.referencia_pagamento;
}

function buscarPreferencia(id) {
  return db.execute({
    sql: `SELECT preferencia_id AS id, preferencia_url AS link FROM pedido WHERE id = ?
          AND preferencia_id IS NOT NULL
          AND id_situacao = (SELECT id FROM situacao WHERE nome_situacao = 'Pendente')`,
    args: [id],
  }).rows[0];
}

function salvarPreferencia(id, preferencia) {
  db.execute({
    sql: `UPDATE pedido SET preferencia_id = ?, preferencia_url = ?
          WHERE id = ? AND preferencia_id IS NULL
          AND id_situacao = (SELECT id FROM situacao WHERE nome_situacao = 'Pendente')`,
    args: [preferencia.id, preferencia.link, id],
  });
  return buscarPreferencia(id);
}

module.exports = { buscarReenvio, gravar, buscarPedido, referenciaPagamento, buscarPreferencia, salvarPreferencia };
