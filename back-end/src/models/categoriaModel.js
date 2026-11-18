const db = require("../database/connection");

async function listar(apenasAtivas = false) {
  const filtro = apenasAtivas ? " WHERE status = 1" : "";
  const { rows } = await db.execute(
    "SELECT id, nome_categoria, id_categoria_pai, status FROM categoria" + filtro + " ORDER BY id",
  );
  return rows;
}

module.exports = { listar };
