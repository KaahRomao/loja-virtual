const { DatabaseSync } = require("node:sqlite");
const { existsSync, mkdirSync, readFileSync } = require("node:fs");
const { dirname, isAbsolute, resolve, join } = require("node:path");

const render = process.env.RENDER === "true";
const urlTurso = render && process.env.TURSO_DATABASE_URL?.trim();
const clienteTurso = urlTurso
  ? require("@libsql/client").createClient({ url: urlTurso, authToken: process.env.TURSO_AUTH_TOKEN })
  : null;

if (clienteTurso && !urlTurso.startsWith("file:") && !process.env.TURSO_AUTH_TOKEN?.trim()) {
  throw new Error("Configure TURSO_AUTH_TOKEN no serviço do Render.");
}

let sqlite;
if (!clienteTurso) {
  const configurado = process.env.DB_PATH?.trim();
  if (render && (!configurado || !isAbsolute(configurado) || !existsSync(dirname(configurado)))) {
    throw new Error("Configure o Turso ou informe DB_PATH no disco persistente do Render.");
  }

  const caminho = configurado === ":memory:"
    ? configurado
    : resolve(__dirname, "../..", configurado || "data/vora.sqlite");

  if (!render && caminho !== ":memory:") mkdirSync(dirname(caminho), { recursive: true });
  sqlite = new DatabaseSync(caminho);
  sqlite.exec("PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");
}

function executarLocal(comando) {
  const { sql, args = [] } = typeof comando === "string" ? { sql: comando } : comando;
  const stmt = sqlite.prepare(sql);
  if (stmt.columns().length) return { rows: stmt.all(...args) };
  const { changes, lastInsertRowid } = stmt.run(...args);
  return { rows: [], rowsAffected: changes, lastInsertRowid };
}

let filaLocal = Promise.resolve();
function enfileirar(executar) {
  const resultado = filaLocal.then(executar);
  filaLocal = resultado.catch(() => {});
  return resultado;
}

function transacaoBruta(executar) {
  if (clienteTurso) return transacaoTurso(executar);

  return enfileirar(async () => {
    sqlite.exec("BEGIN IMMEDIATE");
    try {
      const resultado = await executar({
        execute: executarLocal,
        executeMultiple: (sql) => sqlite.exec(sql),
      });
      sqlite.exec("COMMIT");
      return resultado;
    } catch (erro) {
      if (sqlite.isTransaction) sqlite.exec("ROLLBACK");
      throw erro;
    }
  });
}

async function transacaoTurso(executar) {
  const tx = await clienteTurso.transaction("write");
  try {
    const resultado = await executar(tx);
    await tx.commit();
    return resultado;
  } catch (erro) {
    if (!tx.closed) await tx.rollback();
    throw erro;
  } finally {
    tx.close();
  }
}

const scripts = join(__dirname, "sql");
let inicializacao;
function inicializar() {
  inicializacao ??= transacaoBruta(async (tx) => {
    const { rows } = await tx.execute("SELECT 1 FROM sqlite_schema WHERE type = 'table' AND name NOT LIKE 'sqlite_%' LIMIT 1");
    if (!rows.length) {
      await tx.executeMultiple(readFileSync(join(scripts, "create.sql"), "utf8"));
      await tx.executeMultiple(readFileSync(join(scripts, "insert.sql"), "utf8"));
    }

    // Completa esquemas anteriores sem substituir registros ou recarregar o catálogo.
    for (const [tabela, campos] of Object.entries({
      cliente: { telefone: "TEXT" },
      produto: { unidade: "TEXT NOT NULL DEFAULT ''", preco_anterior: "INTEGER" },
      pedido: { chave_checkout: "TEXT", preferencia_id: "TEXT", preferencia_url: "TEXT", referencia_pagamento: "TEXT" },
    })) {
      const { rows: info } = await tx.execute(`PRAGMA table_info(${tabela})`);
      const colunas = new Set(info.map((c) => c.name));
      for (const [nome, tipo] of Object.entries(campos)) {
        if (!colunas.has(nome)) await tx.execute(`ALTER TABLE ${tabela} ADD COLUMN ${nome} ${tipo}`);
      }
    }

    await tx.execute("CREATE UNIQUE INDEX IF NOT EXISTS pedido_checkout ON pedido(id_cliente, chave_checkout)");
    await tx.execute("CREATE UNIQUE INDEX IF NOT EXISTS pedido_referencia ON pedido(referencia_pagamento)");
    await tx.execute(`CREATE TRIGGER IF NOT EXISTS trg_produto_pedido_baixa_estoque
      AFTER INSERT ON produto_pedido
      BEGIN
        UPDATE produto SET estoque = estoque - NEW.quantidade WHERE id = NEW.id_produto;
      END`);
  });
  return inicializacao;
}

async function execute(comando) {
  await inicializar();
  return clienteTurso ? clienteTurso.execute(comando) : enfileirar(() => executarLocal(comando));
}

async function transaction(executar) {
  await inicializar();
  return transacaoBruta(executar);
}

module.exports = { execute, transaction, inicializar };
