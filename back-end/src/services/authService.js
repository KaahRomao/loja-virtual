const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const clienteModel = require("../models/clienteModel");

async function login({ email, senha }) {
  const cliente = await clienteModel.buscarPorEmail(email);

  const senhaConfere = cliente
    ? await bcrypt.compare(senha, cliente.senha)
    : false;

  if (!cliente || cliente.status !== 1 || !senhaConfere) {
    const erro = new Error("Email ou senha inválidos");
    erro.codigo = "CREDENCIAIS_INVALIDAS";
    throw erro;
  }

  const token = jwt.sign({ id: cliente.id }, process.env.JWT_SECRET, {
    expiresIn: "2h",
  });

  return {
    token,
    cliente: {
      id: cliente.id,
      nome_cliente: cliente.nome_cliente,
      email: cliente.email,
    },
  };
}

module.exports = { login };
