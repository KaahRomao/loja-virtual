const db = require("../database/connection");

const SO_ATIVOS =
  "id_situacao = (SELECT id FROM situacao WHERE nome_situacao = 'Ativo')";

const COLUNAS =
  "id, nome_produto, descricao, img_url, preco, estoque, id_categoria";

async function listar({ categoria, busca } = {}) {
  let sql = `SELECT ${COLUNAS} FROM produto WHERE ${SO_ATIVOS}`;
  const args = [];

  if (categoria) {
    sql += " AND id_categoria = ?";
    args.push(categoria);
  }
  if (busca) {
    sql += " AND nome_produto LIKE ?";
    args.push(`%${busca}%`);
  }

  const resultado = await db.execute({ sql, args });
  return resultado.rows;
}

async function buscarPorId(id) {
  const resultado = await db.execute({
    sql: `SELECT * FROM produto WHERE id = ? AND ${SO_ATIVOS}`,
    args: [id],
  });
  return resultado.rows[0];
}

module.exports = { listar, buscarPorId };
