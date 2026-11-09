const db = require("../database/connection");

const SITUACAO_PRODUTO_ATIVO = "Ativo";
const SITUACAO_PEDIDO_INICIAL = "Pendente";

function idSituacao(nome) {
  const linha = db
    .prepare("SELECT id FROM situacao WHERE nome_situacao = ?")
    .get(nome);

  if (!linha) {
    throw new Error(`Situação "${nome}" não existe na tabela situacao`);
  }
  return linha.id;
}

function buscarProdutoAtivo(id) {
  return db
    .prepare(
      "SELECT id, nome_produto, preco, estoque FROM produto WHERE id = ? AND id_situacao = ?",
    )
    .get(id, idSituacao(SITUACAO_PRODUTO_ATIVO));
}

const gravar = db.transaction((pedido, itens) => {
  const resultado = db
    .prepare(
      `INSERT INTO pedido
        (endereco_entrega, cep_entrega, valor_frete, prazo_entrega, valor_total, id_cliente, id_situacao)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      pedido.endereco_entrega,
      pedido.cep_entrega,
      pedido.valor_frete,
      pedido.prazo_entrega,
      pedido.valor_total,
      pedido.id_cliente,
      idSituacao(SITUACAO_PEDIDO_INICIAL),
    );

  const idPedido = resultado.lastInsertRowid;
  const inserirItem = db.prepare(
    "INSERT INTO produto_pedido (id_pedido, id_produto, quantidade, valor_unitario) VALUES (?, ?, ?, ?)",
  );

  for (const item of itens) {
    inserirItem.run(
      idPedido,
      item.id_produto,
      item.quantidade,
      item.valor_unitario,
    );
  }

  return idPedido;
});

function buscarPedido(id, idCliente) {
  const pedido = db
    .prepare(
      `SELECT p.id, p.endereco_entrega, p.cep_entrega, p.valor_frete,
              p.prazo_entrega, p.valor_total, p.data_criado,
              s.nome_situacao AS situacao
       FROM pedido p
       JOIN situacao s ON s.id = p.id_situacao
       WHERE p.id = ? AND p.id_cliente = ?`,
    )
    .get(id, idCliente);

  if (!pedido) return undefined;

  const itens = db
    .prepare(
      `SELECT pp.id_produto, pr.nome_produto, pp.quantidade, pp.valor_unitario
       FROM produto_pedido pp
       JOIN produto pr ON pr.id = pp.id_produto
       WHERE pp.id_pedido = ?`,
    )
    .all(id);

  return { ...pedido, itens };
}

module.exports = { buscarProdutoAtivo, gravar, buscarPedido };
