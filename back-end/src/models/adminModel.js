const db = require("../database/connection");
const { listar: listarCategorias } = require("./categoriaModel");
const { listarDoPedido } = require("./pagamentoModel");
const { idSituacao } = require("./situacaoModel");

const CAMPOS_PRODUTO = [
  "nome_produto",
  "descricao",
  "img_url",
  "preco",
  "preco_anterior",
  "unidade",
  "estoque",
  "id_categoria",
];

const PRODUTO_SELECT = `SELECT p.id, p.nome_produto, p.descricao, p.img_url, p.preco, p.preco_anterior, p.unidade, p.estoque,
  p.id_categoria, c.nome_categoria, c.status AS categoria_ativa, s.nome_situacao AS situacao
  FROM produto p
  JOIN categoria c ON c.id = p.id_categoria
  JOIN situacao s ON s.id = p.id_situacao`;

async function buscarAdminPorEmail(email) {
  const r = await db.execute({
    sql: "SELECT id, nome, email, senha, status FROM administrador WHERE email = ? COLLATE NOCASE ORDER BY email = ? DESC, id LIMIT 1",
    args: [email, email],
  });
  return r.rows[0];
}

// ---------- produtos ----------
async function listarProdutos() {
  const r = await db.execute(`${PRODUTO_SELECT} ORDER BY p.id`);
  return r.rows;
}

async function buscarProduto(id, executor = db) {
  const r = await executor.execute({
    sql: `${PRODUTO_SELECT} WHERE p.id = ?`,
    args: [id],
  });
  return r.rows[0];
}

async function criarProduto(p, executor = db) {
  const situacaoId = await idSituacao(p.situacao ?? "Ativo", executor);
  const r = await executor.execute({
    sql: `INSERT INTO produto (nome_produto, descricao, img_url, preco, preco_anterior, unidade, estoque, id_categoria, id_situacao)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      p.nome_produto,
      p.descricao,
      p.img_url ?? "",
      p.preco,
      p.preco_anterior ?? null,
      p.unidade ?? "",
      p.estoque,
      p.id_categoria,
      situacaoId,
    ],
  });
  return Number(r.lastInsertRowid);
}

async function atualizarProduto(id, campos, situacao, executor = db) {
  const sets = [];
  const args = [];
  for (const c of CAMPOS_PRODUTO) {
    if (campos[c] !== undefined) {
      sets.push(`${c} = ?`);
      args.push(campos[c]);
    }
  }
  if (situacao) {
    sets.push("id_situacao = ?");
    args.push(await idSituacao(situacao, executor));
  }
  if (sets.length === 0) return;
  args.push(id);
  await executor.execute({
    sql: `UPDATE produto SET ${sets.join(", ")} WHERE id = ?`,
    args,
  });
}

async function arquivarProduto(produto, executor) {
  const inativo = await idSituacao("Inativo", executor);
  // A vitrine considera estes cinco campos ao reunir fichas equivalentes.
  const { rows } = await executor.execute({
    sql: `UPDATE produto SET id_situacao = ?
          WHERE id_categoria = ? AND nome_produto COLLATE BINARY = ?
            AND descricao COLLATE BINARY = ? AND unidade = ? AND img_url = ?
          RETURNING id`,
    args: [inativo, produto.id_categoria, produto.nome_produto, produto.descricao, produto.unidade, produto.img_url],
  });
  return rows.map(({ id }) => id);
}

// ---------- categorias ----------
async function buscarCategoria(id, executor = db) {
  const r = await executor.execute({
    sql: "SELECT id, nome_categoria, id_categoria_pai, status FROM categoria WHERE id = ?",
    args: [id],
  });
  return r.rows[0];
}

async function criarCategoria({ nome_categoria, id_categoria_pai }, executor = db) {
  const r = await executor.execute({
    sql: "INSERT INTO categoria (nome_categoria, id_categoria_pai) VALUES (?, ?)",
    args: [nome_categoria, id_categoria_pai ?? null],
  });
  return Number(r.lastInsertRowid);
}

async function atualizarCategoria(id, { nome_categoria, status }, executor = db) {
  const sets = [];
  const args = [];
  if (nome_categoria !== undefined) {
    sets.push("nome_categoria = ?");
    args.push(nome_categoria);
  }
  if (status !== undefined) {
    sets.push("status = ?");
    args.push(status);
  }
  if (sets.length === 0) return;
  args.push(id);
  await executor.execute({
    sql: `UPDATE categoria SET ${sets.join(", ")} WHERE id = ?`,
    args,
  });
}

async function temDependentesAtivos(id, executor) {
  const { rows } = await executor.execute({
    sql: `SELECT 1 FROM categoria WHERE id_categoria_pai = ? AND status = 1
          UNION ALL
          SELECT 1 FROM produto p JOIN situacao s ON s.id = p.id_situacao
            WHERE p.id_categoria = ? AND s.nome_situacao = 'Ativo'
          LIMIT 1`,
    args: [id, id],
  });
  return rows.length > 0;
}

// ---------- pedidos ----------
const APROVACOES = "(SELECT COUNT(*) FROM pagamento pg WHERE pg.id_pedido = p.id AND pg.data_aprovacao IS NOT NULL)";
const ALERTA_PAGAMENTO = `CASE
  WHEN s.nome_situacao = 'Cancelado' AND ${APROVACOES} > 0 THEN 'APROVACAO_APOS_CANCELAMENTO'
  WHEN ${APROVACOES} > 1 THEN 'MULTIPLAS_APROVACOES'
  END AS alerta_pagamento`;

async function listarPedidos() {
  const r = await db.execute(`
    SELECT p.id, p.valor_total, p.data_criado, s.nome_situacao AS situacao,
           c.nome_cliente, c.email, ${ALERTA_PAGAMENTO},
           (SELECT SUM(quantidade) FROM produto_pedido WHERE id_pedido = p.id) AS itens,
           (SELECT forma_pagamento FROM pagamento pg WHERE pg.id_pedido = p.id
            ORDER BY (pg.data_aprovacao IS NOT NULL) DESC, pg.id DESC LIMIT 1) AS forma_pagamento
    FROM pedido p
    JOIN situacao s ON s.id = p.id_situacao
    JOIN cliente c ON c.id = p.id_cliente
    ORDER BY p.id DESC`);
  return r.rows;
}

async function buscarPedido(id) {
  const rp = await db.execute({
    sql: `SELECT p.id, p.endereco_entrega, p.cep_entrega, p.valor_frete, p.prazo_entrega,
                 p.valor_total, p.data_criado, s.nome_situacao AS situacao,
                 c.nome_cliente, c.email, ${ALERTA_PAGAMENTO}
          FROM pedido p
          JOIN situacao s ON s.id = p.id_situacao
          JOIN cliente c ON c.id = p.id_cliente
          WHERE p.id = ?`,
    args: [id],
  });
  const pedido = rp.rows[0];
  if (!pedido) return undefined;

  const ri = await db.execute({
    sql: `SELECT pp.id_produto, pr.nome_produto, pp.quantidade, pp.valor_unitario
          FROM produto_pedido pp JOIN produto pr ON pr.id = pp.id_produto
          WHERE pp.id_pedido = ?`,
    args: [id],
  });
  return { ...pedido, itens: ri.rows, pagamentos: await listarDoPedido(id) };
}

async function resumoPedidos() {
  const r = await db.execute(`
    SELECT s.nome_situacao AS situacao, COUNT(*) AS quantidade,
           COALESCE(SUM(p.valor_total), 0) AS total
    FROM pedido p JOIN situacao s ON s.id = p.id_situacao
    GROUP BY s.nome_situacao`);
  return r.rows;
}

module.exports = {
  buscarAdminPorEmail,
  listarProdutos,
  buscarProduto,
  criarProduto,
  atualizarProduto,
  arquivarProduto,
  listarCategorias,
  buscarCategoria,
  criarCategoria,
  atualizarCategoria,
  temDependentesAtivos,
  listarPedidos,
  buscarPedido,
  resumoPedidos,
};
