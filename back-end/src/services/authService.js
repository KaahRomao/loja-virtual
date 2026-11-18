const bcrypt = require("bcryptjs");
const clienteModel = require("../models/clienteModel");
const adminService = require("./adminService");
const { emitirToken } = require("./tokenService");

async function login({ email, senha }) {
  const cliente = await clienteModel.buscarPorEmail(email);

  const senhaConfere = cliente
    ? await bcrypt.compare(senha, cliente.senha)
    : false;

  if (!cliente || cliente.status !== 1 || !senhaConfere) return adminService.login({ email, senha });

  return {
    token: emitirToken(cliente.id, "cliente"),
    role: "cliente",
    cliente: {
      id: cliente.id,
      nome_cliente: cliente.nome_cliente,
      email: cliente.email,
    },
  };
}

module.exports = { login };
