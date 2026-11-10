const Database = require("better-sqlite3");

const db = new Database(process.env.DB_PATH);
db.pragma("foreign_keys = ON");

if (!process.env.DB_PATH) {
  throw new Error("DB_PATH não definido. Carregue o .env");
}

module.exports = db;
