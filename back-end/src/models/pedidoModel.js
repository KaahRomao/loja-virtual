const { randomUUID } = require("node:crypto");
const db = require("../database/connection");
const { listarDoPedido } = require("./pagamentoModel");
const { idSituacao } = require("./situacaoModel");

async function buscarProdutoAtivo(id, executor) {
  const { rows } = await executor.execute({
    sql: `SELECT p.id, p.nome_produto, p.preco, p.estoque FROM produto p
          JOIN categoria c ON c.id = p.id_categoria
          JOIN situacao s ON s.id = p.id_situacao
          WHERE p.id = ? AND s.nome_situacao = 'Ativo' AND c.status = 1`,
    args: [id],
  });
  return rows[0];
}

async function buscarReenvio(dados, quantidades, executor = db) {
  if (!dados.chave_checkout) return undefined;
  const { rows: [pedido] } = await executor.execute({
    sql: "SELECT id FROM pedido WHERE id_cliente = ? AND chave_checkout = ?",
    args: [dados.id_cliente, dados.chave_checkout],
  });
  if (!pedido) return undefined;

  const salvo = await buscarPedido(pedido.id, dados.id_cliente, executor);
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
  return db.transaction(async (tx) => {
    const existente = await buscarReenvio(pedido, quantidades, tx);
    if (existente) return existente;

    let valorTotal = pedido.valor_frete;
    const itens = [];
    for (const [id, quantidade] of quantidades) {
      const produto = await buscarProdutoAtivo(id, tx);
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

    const idPendente = await idSituacao("Pendente", tx);
    const { lastInsertRowid } = await tx.execute({
      sql: `INSERT INTO pedido
              (endereco_entrega, cep_entrega, valor_frete, prazo_entrega, valor_total,
               id_cliente, id_situacao, chave_checkout, data_criado)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, DATETIME('now'))`,
      args: [
        pedido.endereco_entrega, pedido.cep_entrega, pedido.valor_frete,
        pedido.prazo_entrega, valorTotal, pedido.id_cliente, idPendente, pedido.chave_checkout ?? null,
      ],
    });
    const id = Number(lastInsertRowid);
    for (const item of itens) {
      await tx.execute({
        sql: "INSERT INTO produto_pedido (id_pedido, id_produto, quantidade, valor_unitario) VALUES (?, ?, ?, ?)",
        args: [id, item.id, item.quantidade, item.preco],
      });
    }

    return buscarPedido(id, pedido.id_cliente, tx);
  });
}

async function buscarPedido(id, idCliente, executor = db) {
  const { rows: [pedido] } = await executor.execute({
    sql: `SELECT p.id, p.endereco_entrega, p.cep_entrega, p.valor_frete,
                 p.prazo_entrega, p.valor_total, p.data_criado, s.nome_situacao AS situacao
          FROM pedido p JOIN situacao s ON s.id = p.id_situacao
          WHERE p.id = ? AND p.id_cliente = ?`,
    args: [id, idCliente],
  });
  if (!pedido) return undefined;

  const { rows: itens } = await executor.execute({
    sql: `SELECT pp.id_produto, pr.nome_produto, pp.quantidade, pp.valor_unitario
          FROM produto_pedido pp JOIN produto pr ON pr.id = pp.id_produto
          WHERE pp.id_pedido = ?`,
    args: [id],
  });
  return { ...pedido, itens, pagamentos: await listarDoPedido(id, executor) };
}

async function listarPedidos(idCliente) {
  const { rows } = await db.execute({
    sql: `SELECT p.id, p.valor_total, p.data_criado, s.nome_situacao AS situacao
          FROM pedido p JOIN situacao s ON s.id = p.id_situacao
          WHERE p.id_cliente = ? ORDER BY p.id DESC`,
    args: [idCliente],
  });
  return rows;
}

async function referenciaPagamento(id) {
  const idPendente = await idSituacao("Pendente");
  const { rows } = await db.execute({
    sql: `UPDATE pedido SET referencia_pagamento = COALESCE(referencia_pagamento, ?)
          WHERE id = ? AND id_situacao = ?
          RETURNING referencia_pagamento`,
    args: [`vora-${randomUUID()}`, id, idPendente],
  });
  return rows[0]?.referencia_pagamento;
}

async function buscarPreferencia(id) {
  const idPendente = await idSituacao("Pendente");
  const { rows } = await db.execute({
    sql: `SELECT preferencia_id AS id, preferencia_url AS link FROM pedido WHERE id = ?
          AND preferencia_id IS NOT NULL
          AND id_situacao = ?`,
    args: [id, idPendente],
  });
  return rows[0];
}

async function salvarPreferencia(id, preferencia) {
  const idPendente = await idSituacao("Pendente");
  await db.execute({
    sql: `UPDATE pedido SET preferencia_id = ?, preferencia_url = ?
          WHERE id = ? AND preferencia_id IS NULL
          AND id_situacao = ?`,
    args: [preferencia.id, preferencia.link, id, idPendente],
  });
  return buscarPreferencia(id);
}

async function buscarCheckout(id, executor = db) {
  const { rows: [checkout] } = await executor.execute({
    sql: `SELECT p.id_cliente, p.preferencia_id, p.referencia_pagamento, s.nome_situacao AS situacao
          FROM pedido p JOIN situacao s ON s.id = p.id_situacao WHERE p.id = ?`,
    args: [id],
  });
  return checkout;
}

function conflito(mensagem) {
  return Object.assign(new Error(mensagem), { codigo: "CONFLITO" });
}

function alterarSituacaoPedido(id, de, para, preferenciaVerificada = null) {
  return db.transaction(async (tx) => {
    const idDe = await idSituacao(de, tx);
    const idPara = await idSituacao(para, tx);
    if (para === "Cancelado") {
      const checkout = await buscarCheckout(id, tx);
      const pagamentos = await listarDoPedido(id, tx);
      const pagamentoEmCurso = pagamentos.some((pg) => ["Pendente", "Aprovado"].includes(pg.situacao));
      if (!checkout || checkout.preferencia_id !== preferenciaVerificada || pagamentoEmCurso) {
        throw conflito("O checkout ou o pagamento precisa ser conferido antes de cancelar.");
      }
    }

    const resultado = await tx.execute({
      sql: "UPDATE pedido SET id_situacao = ? WHERE id = ? AND id_situacao = ?",
      args: [idPara, id, idDe],
    });
    if (!resultado.rowsAffected) throw conflito("O pedido mudou de situação. Atualize e tente de novo.");

    if (para === "Cancelado") {
      const { rows: itens } = await tx.execute({
        sql: "SELECT quantidade, id_produto FROM produto_pedido WHERE id_pedido = ?",
        args: [id],
      });
      for (const item of itens) {
        await tx.execute({
          sql: "UPDATE produto SET estoque = estoque + ? WHERE id = ?",
          args: [item.quantidade, item.id_produto],
        });
      }
    }
  });
}

module.exports = {
  buscarReenvio, gravar, buscarPedido, listarPedidos, referenciaPagamento,
  buscarPreferencia, salvarPreferencia, buscarCheckout, alterarSituacaoPedido,
};
