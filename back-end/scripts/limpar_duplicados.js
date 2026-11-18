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

async function main() {
  if (process.argv.includes("--aplicar")) {
    const { rowsAffected } = await db.execute(`DELETE FROM produto WHERE id IN (${duplicados})`);
    console.log(`Duplicados removidos: ${rowsAffected}`);
  } else {
    const { rows } = await db.execute(duplicados);
    console.log(`Duplicados sem referência: ${rows.length}. Use --aplicar para remover.`);
  }
}

main().catch((erro) => {
  console.error(erro.message);
  process.exitCode = 1;
});
