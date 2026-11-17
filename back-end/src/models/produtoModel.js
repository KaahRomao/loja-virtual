const db = require("../database/connection");
const SO_ATIVOS =
  "p.id_situacao = (SELECT id FROM situacao WHERE nome_situacao = 'Ativo')";

const COLUNAS = `p.id, p.nome_produto, p.descricao, p.img_url, p.preco,
  p.estoque, p.id_categoria, c.nome_categoria`;

const DE_ONDE = "FROM produto p JOIN categoria c ON c.id = p.id_categoria";

function listar({ categoria, busca }) {
  let sql = `SELECT ${COLUNAS} ${DE_ONDE} WHERE ${SO_ATIVOS}`;
  const params = [];

  if (categoria) {
    sql += " AND p.id_categoria = ?";
    params.push(categoria);
  }
  if (busca) {
    sql += " AND p.nome_produto LIKE ?";
    params.push(`%${busca}%`);
  }

  sql += " ORDER BY p.id";

  return db.prepare(sql).all(...params);
}

function buscarPorId(id) {
  return db
    .prepare(`SELECT ${COLUNAS} ${DE_ONDE} WHERE p.id = ? AND ${SO_ATIVOS}`)
    .get(id);
}

module.exports = { listar, buscarPorId };
