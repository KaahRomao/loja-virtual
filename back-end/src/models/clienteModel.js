const db = require("../database/connection");

function buscarPorEmail(email) {
  return db
    .prepare(
      "SELECT id, nome_cliente, email, senha, status FROM cliente WHERE email = ?",
    )
    .get(email);
}

function criar({ nome_cliente, email, senha }) {
  const resultado = db
    .prepare(
      "INSERT INTO cliente (nome_cliente, email, senha) VALUES (?, ?, ?)",
    )
    .run(nome_cliente, email, senha);

  return { id: resultado.lastInsertRowid, nome_cliente, email };
}

module.exports = { buscarPorEmail, criar };
