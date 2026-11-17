// Uso (na pasta back-end): node --env-file=.env scripts/limpar-duplicados.js
// Remove produtos repetidos (mesmo nome), mantendo o de menor id.
// Nunca apaga produto que já aparece em algum pedido.
const db = require("../src/database/connection");

const duplicados = db
  .prepare(
    `SELECT p.id, p.nome_produto
     FROM produto p
     WHERE p.id > (SELECT MIN(q.id) FROM produto q WHERE q.nome_produto = p.nome_produto)
       AND p.id NOT IN (SELECT id_produto FROM produto_pedido)`,
  )
  .all();

const apagar = db.prepare("DELETE FROM produto WHERE id = ?");
const executar = db.transaction((lista) => {
  for (const p of lista) apagar.run(p.id);
});

executar(duplicados);
console.log(`Removidos ${duplicados.length} produtos duplicados.`);
console.log(
  "Produtos restantes:",
  db.prepare("SELECT COUNT(*) AS n FROM produto").get().n,
);
