const { join } = require("node:path");
require("dotenv").config({ path: join(__dirname, "../.env"), quiet: true });
const db = require("../src/database/connection");

const duplicados = `
  SELECT p.id FROM produto p
  WHERE p.id > (SELECT MIN(q.id) FROM produto q
    WHERE q.nome_produto = p.nome_produto AND q.descricao = p.descricao
      AND q.img_url = p.img_url AND q.preco = p.preco AND q.estoque = p.estoque
      AND q.id_categoria = p.id_categoria AND q.id_situacao = p.id_situacao
      AND q.unidade = p.unidade AND q.preco_anterior IS p.preco_anterior)
    AND NOT EXISTS (SELECT 1 FROM produto_pedido WHERE id_produto = p.id)
    AND NOT EXISTS (SELECT 1 FROM produto_carrinho WHERE id_produto = p.id)
`;

if (process.argv.includes("--aplicar")) {
  const { rowsAffected } = db.execute(`DELETE FROM produto WHERE id IN (${duplicados})`);
  console.log(`Duplicados removidos: ${rowsAffected}`);
} else {
  console.log(`Duplicados sem referência: ${db.execute(duplicados).rows.length}. Use --aplicar para remover.`);
}
