const db = require("../database/connection");

const SITUACAO_PRODUTO_ATIVO = "Ativo";
const SITUACAO_PEDIDO_INICIAL = "Pendente";

async function idSituacao(nome, executor = db) {
  const resultado = await executor.execute({
    sql: "SELECT id FROM situacao WHERE nome_situacao = ?",
    args: [nome],
  });
  const linha = resultado.rows[0];

  if (!linha) {
    throw new Error(`Situação "${nome}" não existe na tabela situacao`);
  }
  return linha.id;
}

async function buscarProdutoAtivo(id) {
  const situacaoId = await idSituacao(SITUACAO_PRODUTO_ATIVO);
  const resultado = await db.execute({
    sql: "SELECT id, nome_produto, preco, estoque FROM produto WHERE id = ? AND id_situacao = ?",
    args: [id, situacaoId],
  });
  return resultado.rows[0];
}

async function gravar(pedido, itens) {
  const tx = await db.transaction("write");

  try {
    const situacaoId = await idSituacao(SITUACAO_PEDIDO_INICIAL, tx);

    const resultado = await tx.execute({
      sql: `INSERT INTO pedido
              (endereco_entrega, cep_entrega, valor_frete, prazo_entrega, valor_total, id_cliente, id_situacao)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        pedido.endereco_entrega,
        pedido.cep_entrega,
        pedido.valor_frete,
        pedido.prazo_entrega,
        pedido.valor_total,
        pedido.id_cliente,
        situacaoId,
      ],
    });

    const idPedido = Number(resultado.lastInsertRowid);

    for (const item of itens) {
      await tx.execute({
        sql: "INSERT INTO produto_pedido (id_pedido, id_produto, quantidade, valor_unitario) VALUES (?, ?, ?, ?)",
        args: [idPedido, item.id_produto, item.quantidade, item.valor_unitario],
      });

      const resEstoque = await tx.execute({
        sql: "SELECT estoque FROM produto WHERE id = ?",
        args: [item.id_produto],
      });

      if (!resEstoque.rows[0] || Number(resEstoque.rows[0].estoque) < 0) {
        const erro = new Error(
          `Estoque insuficiente para o produto ${item.id_produto}`,
        );
        erro.codigo = "ESTOQUE_INSUFICIENTE";
        throw erro;
      }
    }

    await tx.commit();
    return idPedido;
  } catch (erro) {
    if (!tx.closed) {
      await tx.rollback();
    }
    throw erro;
  }
}

async function buscarPedido(id, idCliente) {
  const resPedido = await db.execute({
    sql: `SELECT p.id, p.endereco_entrega, p.cep_entrega, p.valor_frete,
                 p.prazo_entrega, p.valor_total, p.data_criado,
                 s.nome_situacao AS situacao
          FROM pedido p
          JOIN situacao s ON s.id = p.id_situacao
          WHERE p.id = ? AND p.id_cliente = ?`,
    args: [id, idCliente],
  });

  const pedido = resPedido.rows[0];
  if (!pedido) return undefined;

  const resItens = await db.execute({
    sql: `SELECT pp.id_produto, pr.nome_produto, pp.quantidade, pp.valor_unitario
          FROM produto_pedido pp
          JOIN produto pr ON pr.id = pp.id_produto
          WHERE pp.id_pedido = ?`,
    args: [id],
  });

  return { ...pedido, itens: resItens.rows };
}

module.exports = { buscarProdutoAtivo, gravar, buscarPedido };
