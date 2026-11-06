const db = require("../database/connection");

const COLUNAS =
  "id, nome_produto, descricao, img_url, preco, estoque, id_categoria";

function listar({ categoria, busca }) {
  let sql = `SELECT ${COLUNAS} FROM produto WHERE 1=1`;
  const params = [];

  if (categoria) {
    sql += " AND id_categoria = ?";
    params.push(categoria);
  }
  if (busca) {
    sql += " AND nome_produto LIKE ?";
    params.push(`%${busca}%`);
  }

  return db.prepare(sql).all(...params);
}

function buscarPorId(id) {
  return db.prepare(`SELECT ${COLUNAS} FROM produto WHERE id = ?`).get(id);
}

module.exports = { listar, buscarPorId };
