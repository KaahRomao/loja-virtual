const adminService = require("../services/adminService");

const STATUS_POR_CODIGO = {
  CREDENCIAIS_INVALIDAS: 401,
  PEDIDO_NAO_ENCONTRADO: 404,
  PRODUTO_NAO_ENCONTRADO: 404,
  CATEGORIA_NAO_ENCONTRADA: 404,
  CATEGORIA_INVALIDA: 400,
  TRANSICAO_INVALIDA: 409,
  CONFLITO: 409,
};

function tratar(fn) {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (erro) {
      const status = STATUS_POR_CODIGO[erro.codigo];
      if (status) return res.status(status).json({ erro: erro.message });
      console.error(erro);
      res.status(500).json({ erro: "Erro interno do servidor" });
    }
  };
}

function idDaRota(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ erro: "ID inválido" });
    return null;
  }
  return id;
}

const texto = (v) => typeof v === "string" && v.trim() !== "";
const inteiro = (v, min) => Number.isInteger(v) && v >= min;

const REGRAS_PRODUTO = {
  nome_produto: [texto, "nome_produto deve ser um texto"],
  descricao: [texto, "descricao deve ser um texto"],
  img_url: [texto, "img_url deve ser um texto"],
  preco: [(v) => inteiro(v, 0), "preco deve ser inteiro em centavos (>= 0)"],
  estoque: [(v) => inteiro(v, 0), "estoque deve ser inteiro (>= 0)"],
  id_categoria: [
    (v) => inteiro(v, 1),
    "id_categoria deve ser inteiro positivo",
  ],
};

function validarProduto(b, parcial) {
  const erros = [];
  for (const [campo, [ok, msg]] of Object.entries(REGRAS_PRODUTO)) {
    if (b[campo] === undefined) {
      if (!parcial) erros.push(`${campo} é obrigatório`);
    } else if (!ok(b[campo])) {
      erros.push(msg);
    }
  }
  if (b.situacao !== undefined && !["Ativo", "Inativo"].includes(b.situacao)) {
    erros.push("situacao deve ser Ativo ou Inativo");
  }
  return erros;
}

const login = tratar(async (req, res) => {
  const { email, senha } = req.body ?? {};
  if (!texto(email) || !texto(senha)) {
    return res.status(400).json({ erro: "email e senha são obrigatórios" });
  }
  res
    .status(200)
    .json(await adminService.login({ email: email.trim(), senha }));
});

const resumo = tratar(async (req, res) => {
  res.status(200).json(await adminService.resumoPedidos());
});

// ---------- produtos ----------
const listarProdutos = tratar(async (req, res) => {
  res.status(200).json(await adminService.listarProdutos());
});

const detalharProduto = tratar(async (req, res) => {
  const id = idDaRota(req, res);
  if (!id) return;
  const produto = await adminService.buscarProduto(id);
  if (!produto) return res.status(404).json({ erro: "Produto não encontrado" });
  res.status(200).json(produto);
});

const criarProduto = tratar(async (req, res) => {
  const erros = validarProduto(req.body ?? {}, false);
  if (erros.length) return res.status(400).json({ erro: erros.join("; ") });
  res.status(201).json(await adminService.criarProduto(req.body));
});

const atualizarProduto = tratar(async (req, res) => {
  const id = idDaRota(req, res);
  if (!id) return;
  const erros = validarProduto(req.body ?? {}, true);
  if (erros.length) return res.status(400).json({ erro: erros.join("; ") });
  res.status(200).json(await adminService.atualizarProduto(id, req.body ?? {}));
});

// ---------- categorias ----------
const listarCategorias = tratar(async (req, res) => {
  res.status(200).json(await adminService.listarCategorias());
});

const criarCategoria = tratar(async (req, res) => {
  const { nome_categoria, id_categoria_pai } = req.body ?? {};
  if (!texto(nome_categoria)) {
    return res.status(400).json({ erro: "nome_categoria é obrigatório" });
  }
  if (id_categoria_pai != null && !inteiro(id_categoria_pai, 1)) {
    return res.status(400).json({ erro: "id_categoria_pai inválido" });
  }
  res.status(201).json(
    await adminService.criarCategoria({
      nome_categoria: nome_categoria.trim(),
      id_categoria_pai,
    }),
  );
});

const atualizarCategoria = tratar(async (req, res) => {
  const id = idDaRota(req, res);
  if (!id) return;
  const { nome_categoria, status } = req.body ?? {};
  if (nome_categoria !== undefined && !texto(nome_categoria)) {
    return res.status(400).json({ erro: "nome_categoria inválido" });
  }
  if (status !== undefined && ![0, 1].includes(status)) {
    return res.status(400).json({ erro: "status deve ser 0 ou 1" });
  }
  res
    .status(200)
    .json(
      await adminService.atualizarCategoria(id, { nome_categoria, status }),
    );
});

// ---------- pedidos ----------
const listarPedidos = tratar(async (req, res) => {
  res.status(200).json(await adminService.listarPedidos());
});

const detalharPedido = tratar(async (req, res) => {
  const id = idDaRota(req, res);
  if (!id) return;
  const pedido = await adminService.buscarPedido(id);
  if (!pedido) return res.status(404).json({ erro: "Pedido não encontrado" });
  res.status(200).json(pedido);
});

const alterarSituacaoPedido = tratar(async (req, res) => {
  const id = idDaRota(req, res);
  if (!id) return;
  const { situacao } = req.body ?? {};
  if (!["Enviado", "Entregue", "Cancelado"].includes(situacao)) {
    return res
      .status(400)
      .json({ erro: "situacao deve ser Enviado, Entregue ou Cancelado" });
  }
  res.status(200).json(await adminService.alterarSituacaoPedido(id, situacao));
});

module.exports = {
  login,
  resumo,
  listarProdutos,
  detalharProduto,
  criarProduto,
  atualizarProduto,
  listarCategorias,
  criarCategoria,
  atualizarCategoria,
  listarPedidos,
  detalharPedido,
  alterarSituacaoPedido,
};
