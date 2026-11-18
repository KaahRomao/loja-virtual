const bcrypt = require("bcryptjs");
const adminModel = require("../models/adminModel");
const pedidoModel = require("../models/pedidoModel");
const pedidoService = require("./pedidoService");
const { emitirToken } = require("./tokenService");
const db = require("../database/connection");

function erroDeNegocio(codigo, mensagem) {
  const erro = new Error(mensagem);
  erro.codigo = codigo;
  return erro;
}

const TRANSICOES = {
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

  return {
    token: emitirToken(admin.id, "admin"),
    role: "admin",
    admin: { id: admin.id, nome: admin.nome, email: admin.email },
  };
}

async function exigirCategoriaAtiva(id, tx) {
  const categoria = await adminModel.buscarCategoria(id, tx);
  if (!categoria) {
    throw erroDeNegocio("CATEGORIA_INVALIDA", `Categoria ${id} não existe`);
  }
  if (categoria.status !== 1) {
    throw erroDeNegocio("CONFLITO", "Restaure a categoria antes de publicar um item nela.");
  }
}

function validarOferta(preco, anterior) {
  if (anterior != null && anterior <= preco) {
    throw erroDeNegocio("PRECO_INVALIDO", "O preço anterior deve ser maior que o atual");
  }
}

async function criarProduto(dados) {
  validarOferta(dados.preco, dados.preco_anterior);
  return db.transaction(async (tx) => {
    await exigirCategoriaAtiva(dados.id_categoria, tx);
    const id = await adminModel.criarProduto(dados, tx);
    return adminModel.buscarProduto(id, tx);
  });
}

async function produtoExistente(id, tx) {
  const produto = await adminModel.buscarProduto(id, tx);
  if (!produto) throw erroDeNegocio("PRODUTO_NAO_ENCONTRADO", "Produto não encontrado");
  return produto;
}

function atualizarProduto(id, dados) {
  return db.transaction(async (tx) => {
    const produto = await produtoExistente(id, tx);
    const categoriaId = dados.id_categoria ?? produto.id_categoria;
    if (categoriaId !== produto.id_categoria || dados.situacao === "Ativo") {
      await exigirCategoriaAtiva(categoriaId, tx);
    }
    validarOferta(dados.preco ?? produto.preco, dados.preco_anterior === undefined ? produto.preco_anterior : dados.preco_anterior);
    await adminModel.atualizarProduto(id, dados, dados.situacao, tx);
    return adminModel.buscarProduto(id, tx);
  });
}

function excluirProduto(id) {
  return db.transaction(async (tx) => {
    const produto = await produtoExistente(id, tx);
    return { ids: await adminModel.arquivarProduto(produto, tx) };
  });
}

function criarCategoria(dados) {
  return db.transaction(async (tx) => {
    if (dados.id_categoria_pai != null) await exigirCategoriaAtiva(dados.id_categoria_pai, tx);
    const id = await adminModel.criarCategoria(dados, tx);
    return adminModel.buscarCategoria(id, tx);
  });
}

function atualizarCategoria(id, dados) {
  return db.transaction(async (tx) => {
    const categoria = await adminModel.buscarCategoria(id, tx);
    if (!categoria) throw erroDeNegocio("CATEGORIA_NAO_ENCONTRADA", "Categoria não encontrada");
    if (dados.status === 0 && categoria.status === 1 && await adminModel.temDependentesAtivos(id, tx)) {
      throw erroDeNegocio("CONFLITO", "Mova ou exclua os produtos e as subcategorias ativas antes de excluir esta categoria.");
    }
    if (dados.status === 1 && categoria.id_categoria_pai != null) {
      await exigirCategoriaAtiva(categoria.id_categoria_pai, tx);
    }
    await adminModel.atualizarCategoria(id, dados, tx);
    return adminModel.buscarCategoria(id, tx);
  });
}

async function alterarSituacaoPedido(id, nova) {
  if (nova === "Cancelado") {
    await pedidoService.cancelarPedido(id);
    return adminModel.buscarPedido(id);
  }
  const pedido = await adminModel.buscarPedido(id);
  if (!pedido)
    throw erroDeNegocio("PEDIDO_NAO_ENCONTRADO", "Pedido não encontrado");

  if (!(TRANSICOES[pedido.situacao] ?? []).includes(nova)) {
    throw erroDeNegocio(
      "TRANSICAO_INVALIDA",
      `Pedido ${pedido.situacao} não pode ir para ${nova}`,
    );
  }
  await pedidoModel.alterarSituacaoPedido(id, pedido.situacao, nova);
  return adminModel.buscarPedido(id);
}

module.exports = {
  login,
  criarProduto,
  atualizarProduto,
  excluirProduto,
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
