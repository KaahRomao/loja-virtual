const bcrypt = require("bcryptjs");
const clienteModel = require("../models/clienteModel");
const adminModel = require("../models/adminModel");

async function cadastrar({ nome_cliente, email, senha, telefone }) {
  email = email.toLowerCase();
  const [existente, reservado] = await Promise.all([
    clienteModel.buscarPorEmail(email), adminModel.buscarAdminPorEmail(email),
  ]);

  if (existente || reservado) {
    const erro = new Error("Email já cadastrado");
    erro.codigo = "EMAIL_JA_CADASTRADO";
    throw erro;
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  return clienteModel.criar({ nome_cliente, email, senha: senhaHash, telefone });
}

module.exports = { cadastrar };
