const db = require("../database/connection");
const SO_ATIVOS =
  "id_situacao = (SELECT id FROM situacao WHERE nome_situacao = 'Ativo')";

const COLUNAS =
  "id, nome_produto, descricao, img_url, preco, estoque, id_categoria";

function listar({ categoria, busca }) {
  let sql = `SELECT ${COLUNAS} FROM produto WHERE ${SO_ATIVOS}`;
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
  return db
    .prepare(`SELECT * FROM produto WHERE id = ? AND ${SO_ATIVOS}`)
    .get(id);
}

module.exports = { listar, buscarPorId };
