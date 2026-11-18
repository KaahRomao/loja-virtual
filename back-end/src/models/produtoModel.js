const db = require("../database/connection");

const SELECT = `SELECT p.id, p.nome_produto, p.descricao, p.img_url, p.preco,
  p.preco_anterior, p.unidade, p.estoque, p.id_categoria, c.nome_categoria
  FROM produto p JOIN categoria c ON c.id = p.id_categoria
  JOIN situacao s ON s.id = p.id_situacao
  WHERE s.nome_situacao = 'Ativo' AND c.status = 1`;

function listar({ categoria, busca }) {
  let sql = SELECT;
  const args = [];
  if (categoria) {
    sql += " AND (p.id_categoria = ? OR c.id_categoria_pai = ?)";
    args.push(categoria, categoria);
  }
  if (busca) {
    sql += " AND p.nome_produto LIKE ?";
    args.push(`%${busca}%`);
  }
  return db.execute({ sql: sql + " ORDER BY p.id", args }).rows;
}

function buscarPorId(id) {
  return db.execute({ sql: SELECT + " AND p.id = ?", args: [id] }).rows[0];
}

module.exports = { listar, buscarPorId };
