const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const adminModel = require("../models/adminModel");
const mercadoPago = require("./mercadoPagoService");
const pagamentos = require("./pagamentoService");

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

function validarOferta(preco, anterior) {
  if (anterior != null && anterior <= preco) {
    throw erroDeNegocio("PRECO_INVALIDO", "O preço anterior deve ser maior que o atual");
  }
}

async function criarProduto(dados) {
  validarOferta(dados.preco, dados.preco_anterior);
  await exigirCategoria(dados.id_categoria);
  const id = await adminModel.criarProduto(dados);
  return adminModel.buscarProduto(id);
}

async function atualizarProduto(id, dados) {
  const produto = await adminModel.buscarProduto(id);
  if (!produto) {
    throw erroDeNegocio("PRODUTO_NAO_ENCONTRADO", "Produto não encontrado");
  }
  if (dados.id_categoria !== undefined)
    await exigirCategoria(dados.id_categoria);
  validarOferta(dados.preco ?? produto.preco, dados.preco_anterior === undefined ? produto.preco_anterior : dados.preco_anterior);
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
  let preferenciaVerificada = null;
  if (nova === "Cancelado") {
    const checkout = await adminModel.buscarCheckout(id);
    if (checkout?.preferencia_id) {
      const expirada = await mercadoPago.preferenciaExpirada(checkout.preferencia_id, checkout.referencia_pagamento);
      if (!expirada) {
        throw erroDeNegocio("CONFLITO", "O link de pagamento ainda está ativo. Encerre a preferência antes de cancelar o pedido.");
      }
      const sincronizacao = await pagamentos.processarPagamento(undefined, checkout.id_cliente, id);
      if (sincronizacao?.pagamento_em_curso) {
        throw erroDeNegocio("CONFLITO", "Há um pagamento pendente ou aprovado para este pedido.");
      }
      preferenciaVerificada = checkout.preferencia_id;
    }
  }
  await adminModel.alterarSituacaoPedido(id, pedido.situacao, nova, preferenciaVerificada);
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
