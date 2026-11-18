const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const clienteModel = require("../models/clienteModel");
const adminService = require("./adminService");

async function login({ email, senha }) {
  const cliente = await clienteModel.buscarPorEmail(email);

  const senhaConfere = cliente
    ? await bcrypt.compare(senha, cliente.senha)
    : false;

  if (!cliente || cliente.status !== 1 || !senhaConfere) return adminService.login({ email, senha });

  const token = jwt.sign(
    { id: cliente.id, tipo: "cliente" },
    process.env.JWT_SECRET,
    {
      expiresIn: "2h",
    },
  );

  return {
    token,
    role: "cliente",
    cliente: {
      id: cliente.id,
      nome_cliente: cliente.nome_cliente,
      email: cliente.email,
    },
  };
}

module.exports = { login };
