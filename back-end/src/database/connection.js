const { createClient } = require("@libsql/client");

// Verifica se as variáveis do Turso estão configuradas
if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.warn(
    "⚠️ Variáveis do Turso não configuradas. Usando banco local (se existir).",
  );
}

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

module.exports = db;
