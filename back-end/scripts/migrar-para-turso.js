const Database = require("better-sqlite3");
const { createClient } = require("@libsql/client");

const origem = process.argv[2];
if (!origem) {
  console.error("Uso: node --env-file=.env scripts/migrar-para-turso.js caminho.sqlite");
  process.exit(1);
}

const local = new Database(origem, { readonly: true, fileMustExist: true });
const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function migrar() {
  const objetos = local
    .prepare(
      "SELECT type, name, sql FROM sqlite_master WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%'"
    )
    .all();

  const tabelas = objetos.filter((o) => o.type === "table");
  const indices = objetos.filter((o) => o.type === "index");
  const gatilhos = objetos.filter((o) => o.type === "trigger");

  const pais = new Map();
  for (const t of tabelas) {
    const lista = local
      .prepare(`PRAGMA foreign_key_list("${t.name}")`)
      .all()
      .map((f) => f.table)
      .filter((nome) => nome !== t.name);
    pais.set(t.name, lista);
  }

  const ordem = [];
  const visitadas = new Set();

  function visitar(nome) {
    if (visitadas.has(nome)) return;
    visitadas.add(nome);
    for (const pai of pais.get(nome) ?? []) visitar(pai);
    ordem.push(nome);
  }

  tabelas.forEach((t) => visitar(t.name));

  const sqlDaTabela = new Map(tabelas.map((t) => [t.name, t.sql]));
  await turso.batch(ordem.map((nome) => sqlDaTabela.get(nome)), "write");
  if (indices.length) await turso.batch(indices.map((i) => i.sql), "write");

  for (const nome of ordem) {
    const linhas = local.prepare(`SELECT * FROM "${nome}"`).all();
    if (linhas.length === 0) continue;

    const colunas = Object.keys(linhas[0]);
    const sql = `INSERT INTO "${nome}" (${colunas.map((c) => `"${c}"`).join(", ")}) VALUES (${colunas.map(() => "?").join(", ")})`;

    for (let i = 0; i < linhas.length; i += 100) {
      const lote = linhas
        .slice(i, i + 100)
        .map((linha) => ({ sql, args: colunas.map((c) => linha[c]) }));
      await turso.batch(lote, "write");
    }
    console.log(`${nome}: ${linhas.length} linhas`);
  }

  for (const g of gatilhos) {
    await turso.execute(g.sql);
    console.log(`trigger criado: ${g.name}`);
  }
}

migrar().catch((erro) => {
  console.error("falhou:", erro.message);
  process.exit(1);
});
