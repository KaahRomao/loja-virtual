const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const adminModel = require("../models/adminModel");

function erroDeNegocio(codigo, mensagem) {
  const erro = new Error(mensagem);
  erro.codigo = codigo;
  return erro;
}

const TRANSICOES = {
  Pendente: ["Cancelado"],
  Pago: ["Enviado"],
  Enviado: ["Entregue"],
  Entregue: [],
  Cancelado: [],
};

async function login({ email, senha }) {
  const admin = await adminModel.buscarAdminPorEmail(email);
  const confere = admin ? await bcrypt.compare(senha, admin.senha) : false;

  if (!admin || admin.status !== 1 || !confere) {
    throw erroDeNegocio("CREDENCIAIS_INVALIDAS", "Email ou senha inválidos");
  }

  const token = jwt.sign(
    { id: admin.id, tipo: "admin" },
    process.env.JWT_SECRET,
    {
      expiresIn: "2h",
    },
  );
  return {
    token,
    admin: { id: admin.id, nome: admin.nome, email: admin.email },
  };
}

async function exigirCategoria(id) {
  if (!(await adminModel.buscarCategoria(id))) {
    throw erroDeNegocio("CATEGORIA_INVALIDA", `Categoria ${id} não existe`);
  }
}

async function criarProduto(dados) {
  await exigirCategoria(dados.id_categoria);
  const id = await adminModel.criarProduto(dados);
  return adminModel.buscarProduto(id);
}

async function atualizarProduto(id, dados) {
  if (!(await adminModel.buscarProduto(id))) {
    throw erroDeNegocio("PRODUTO_NAO_ENCONTRADO", "Produto não encontrado");
  }
  if (dados.id_categoria !== undefined)
    await exigirCategoria(dados.id_categoria);
  await adminModel.atualizarProduto(id, dados, dados.situacao);
  return adminModel.buscarProduto(id);
}

async function criarCategoria(dados) {
  if (dados.id_categoria_pai != null)
    await exigirCategoria(dados.id_categoria_pai);
  const id = await adminModel.criarCategoria(dados);
  return adminModel.buscarCategoria(id);
}

async function atualizarCategoria(id, dados) {
  if (!(await adminModel.buscarCategoria(id))) {
    throw erroDeNegocio("CATEGORIA_NAO_ENCONTRADA", "Categoria não encontrada");
  }
  await adminModel.atualizarCategoria(id, dados);
  return adminModel.buscarCategoria(id);
}

async function alterarSituacaoPedido(id, nova) {
  const pedido = await adminModel.buscarPedido(id);
  if (!pedido)
    throw erroDeNegocio("PEDIDO_NAO_ENCONTRADO", "Pedido não encontrado");

  if (!(TRANSICOES[pedido.situacao] ?? []).includes(nova)) {
    throw erroDeNegocio(
      "TRANSICAO_INVALIDA",
      `Pedido ${pedido.situacao} não pode ir para ${nova}`,
    );
  }
  await adminModel.alterarSituacaoPedido(id, pedido.situacao, nova);
  return adminModel.buscarPedido(id);
}

module.exports = {
  login,
  criarProduto,
  atualizarProduto,
  criarCategoria,
  atualizarCategoria,
  alterarSituacaoPedido,
  listarProdutos: adminModel.listarProdutos,
  buscarProduto: adminModel.buscarProduto,
  listarCategorias: adminModel.listarCategorias,
  listarPedidos: adminModel.listarPedidos,
  buscarPedido: adminModel.buscarPedido,
  resumoPedidos: adminModel.resumoPedidos,
};
