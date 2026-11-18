const db = require("../database/connection");

async function idSituacao(nome, executor = db) {
  const { rows: [situacao] } = await executor.execute({
    sql: "SELECT id FROM situacao WHERE nome_situacao = ?",
    args: [nome],
  });
  if (!situacao) throw new Error(`Situação "${nome}" não existe`);
  return situacao.id;
}

module.exports = { idSituacao };
