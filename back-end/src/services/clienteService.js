const bcrypt = require("bcryptjs");
const clienteModel = require("../models/clienteModel");

async function cadastrar({ nome_cliente, email, senha }) {
  const existente = await clienteModel.buscarPorEmail(email);

  if (existente) {
    const erro = new Error("Email já cadastrado");
    erro.codigo = "EMAIL_JA_CADASTRADO";
    throw erro;
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  return clienteModel.criar({ nome_cliente, email, senha: senhaHash });
}

module.exports = { cadastrar };
