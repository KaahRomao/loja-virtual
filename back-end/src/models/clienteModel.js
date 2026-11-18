const db = require("../database/connection");

async function buscarPorEmail(email) {
  const resultado = await db.execute({
    sql: "SELECT id, nome_cliente, email, senha, status FROM cliente WHERE email = ?",
    args: [email],
  });
  return resultado.rows[0];
}

async function criar({ nome_cliente, email, senha }) {
  const resultado = await db.execute({
    sql: "INSERT INTO cliente (nome_cliente, email, senha) VALUES (?, ?, ?)",
    args: [nome_cliente, email, senha],
  });

  return {
    id: Number(resultado.lastInsertRowid),
    nome_cliente,
    email,
  };
}

module.exports = { buscarPorEmail, criar };
