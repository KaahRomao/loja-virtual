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

module.exports = { buscarProdutoAtivo, gravar };
