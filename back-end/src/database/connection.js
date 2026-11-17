const Database = require("better-sqlite3");

if (!process.env.DB_PATH) {
  throw new Error("DB_PATH não definido. Carregue o .env");
}

const db = new Database(process.env.DB_PATH, { fileMustExist: true });
db.pragma("foreign_keys = ON");

module.exports = db;
