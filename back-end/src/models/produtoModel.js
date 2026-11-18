async function listar({ categoria, busca }) {
  let sql = `SELECT ${COLUNAS} ${DE_ONDE} WHERE ${SO_ATIVOS}`;
  const args = [];
  if (categoria) {
    sql += " AND p.id_categoria = ?";
    args.push(categoria);
  }
  if (busca) {
    sql += " AND p.nome_produto LIKE ?";
    args.push(`%${busca}%`);
  }
  sql += " ORDER BY p.id";
  const { rows } = await db.execute({ sql, args });
  return rows;
}

async function buscarPorId(id) {
  const { rows } = await db.execute({
    sql: `SELECT ${COLUNAS} ${DE_ONDE} WHERE p.id = ? AND ${SO_ATIVOS}`,
    args: [id],
  });
  return rows[0];
}
