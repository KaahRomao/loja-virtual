const { DatabaseSync } = require("node:sqlite");
const { existsSync, mkdirSync, readFileSync } = require("node:fs");
const { dirname, isAbsolute, resolve, join } = require("node:path");

const backend = resolve(__dirname, "../..");
const configurado = process.env.DB_PATH?.trim();
const render = process.env.RENDER === "true";
if (render && (!configurado || !isAbsolute(configurado) || !existsSync(dirname(configurado)))) {
  throw new Error("Configure DB_PATH com o caminho absoluto do SQLite em um diretório já montado no Render.");
}
const caminho = configurado === ":memory:"
  ? configurado
  : resolve(backend, configurado || "data/vora.sqlite");

if (!render && caminho !== ":memory:") mkdirSync(dirname(caminho), { recursive: true });
const sqlite = new DatabaseSync(caminho);
sqlite.exec("PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");

function execute(comando) {
  const { sql, args = [] } = typeof comando === "string" ? { sql: comando } : comando;
  const stmt = sqlite.prepare(sql);
  if (stmt.columns().length) return { rows: stmt.all(...args) };

  const { changes, lastInsertRowid } = stmt.run(...args);
  return { rows: [], rowsAffected: changes, lastInsertRowid };
}

function transaction(executar) {
  sqlite.exec("BEGIN IMMEDIATE");
  try {
    const resultado = executar();
    sqlite.exec("COMMIT");
    return resultado;
  } catch (erro) {
    if (sqlite.isTransaction) sqlite.exec("ROLLBACK");
    throw erro;
  }
}

const scripts = join(__dirname, "sql");
transaction(() => {
  if (!execute("SELECT 1 FROM sqlite_schema WHERE type = 'table' AND name NOT LIKE 'sqlite_%'").rows.length) {
    sqlite.exec(readFileSync(join(scripts, "create.sql"), "utf8"));
    sqlite.exec(readFileSync(join(scripts, "insert.sql"), "utf8"));
  }
  // Campos adicionados à versão local anterior, preservando pedidos e clientes.
  for (const [tabela, campos] of Object.entries({
    cliente: { telefone: "TEXT" },
    produto: { unidade: "TEXT NOT NULL DEFAULT ''", preco_anterior: "INTEGER" },
    pedido: { chave_checkout: "TEXT", preferencia_id: "TEXT", preferencia_url: "TEXT", referencia_pagamento: "TEXT" },
  })) {
    const colunas = new Set(execute(`PRAGMA table_info(${tabela})`).rows.map((c) => c.name));
    for (const [nome, tipo] of Object.entries(campos)) {
      if (!colunas.has(nome)) sqlite.exec(`ALTER TABLE ${tabela} ADD COLUMN ${nome} ${tipo}`);
    }
  }
  sqlite.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS pedido_checkout ON pedido(id_cliente, chave_checkout);
    CREATE UNIQUE INDEX IF NOT EXISTS pedido_referencia ON pedido(referencia_pagamento);
  `);
});

module.exports = { execute, transaction };
