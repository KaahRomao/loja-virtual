const db = require("../database/connection");

const SELECT = `SELECT p.id, p.nome_produto, p.descricao, p.img_url, p.preco,
  p.preco_anterior, p.unidade, p.estoque, p.id_categoria, c.nome_categoria
  FROM produto p JOIN categoria c ON c.id = p.id_categoria
  JOIN situacao s ON s.id = p.id_situacao
  WHERE s.nome_situacao = 'Ativo' AND c.status = 1`;

async function listar({ categoria, busca }) {
  let sql = SELECT;
  const args = [];
  if (categoria) {
    sql = `WITH RECURSIVE descendentes(id) AS (
      SELECT id FROM categoria WHERE id = ? AND status = 1
      UNION
      SELECT filha.id FROM categoria filha
        JOIN descendentes pai ON filha.id_categoria_pai = pai.id
        WHERE filha.status = 1
    ) ` + sql + " AND p.id_categoria IN (SELECT id FROM descendentes)";
    args.push(categoria);
  }
  if (busca) {
    sql += " AND p.nome_produto LIKE ?";
    args.push(`%${busca}%`);
  }
  const { rows } = await db.execute({ sql: sql + " ORDER BY p.id", args });
  const unicos = new Map();
  for (const produto of rows) {
    const chave = JSON.stringify([
      produto.id_categoria, produto.nome_produto, produto.descricao, produto.unidade, produto.img_url,
    ]);
    const principal = unicos.get(chave);
    if (principal) principal.ids_equivalentes.push(produto.id);
    else unicos.set(chave, { ...produto, ids_equivalentes: [] });
  }
  return [...unicos.values()];
}

async function buscarPorId(id) {
  const { rows } = await db.execute({ sql: SELECT + " AND p.id = ?", args: [id] });
  return rows[0];
}

module.exports = { listar, buscarPorId };
