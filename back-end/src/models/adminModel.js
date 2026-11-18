const db = require("../database/connection");
const { listarDoPedido } = require("./pagamentoModel");

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
  p.id_categoria, c.nome_categoria, s.nome_situacao AS situacao
  FROM produto p
  JOIN categoria c ON c.id = p.id_categoria
  JOIN situacao s ON s.id = p.id_situacao`;

function idSituacao(nome) {
  const r = db.execute({
    sql: "SELECT id FROM situacao WHERE nome_situacao = ?",
    args: [nome],
  });
  if (!r.rows[0]) throw new Error(`Situação "${nome}" não existe`);
  return r.rows[0].id;
}

async function buscarAdminPorEmail(email) {
  const r = await db.execute({
    sql: "SELECT id, nome, email, senha, status FROM administrador WHERE email = ?",
    args: [email],
  });
  return r.rows[0];
}

// ---------- produtos ----------
async function listarProdutos() {
  const r = await db.execute(`${PRODUTO_SELECT} ORDER BY p.id`);
  return r.rows;
}

async function buscarProduto(id) {
  const r = await db.execute({
    sql: `${PRODUTO_SELECT} WHERE p.id = ?`,
    args: [id],
  });
  return r.rows[0];
}

async function criarProduto(p) {
  const situacaoId = idSituacao(p.situacao ?? "Ativo");
  const r = await db.execute({
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

async function atualizarProduto(id, campos, situacao) {
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
    args.push(idSituacao(situacao));
  }
  if (sets.length === 0) return;
  args.push(id);
  await db.execute({
    sql: `UPDATE produto SET ${sets.join(", ")} WHERE id = ?`,
    args,
  });
}

// ---------- categorias ----------
async function listarCategorias() {
  const r = await db.execute(
    "SELECT id, nome_categoria, id_categoria_pai, status FROM categoria ORDER BY id",
  );
  return r.rows;
}

async function buscarCategoria(id) {
  const r = await db.execute({
    sql: "SELECT id, nome_categoria, id_categoria_pai, status FROM categoria WHERE id = ?",
    args: [id],
  });
  return r.rows[0];
}

async function criarCategoria({ nome_categoria, id_categoria_pai }) {
  const r = await db.execute({
    sql: "INSERT INTO categoria (nome_categoria, id_categoria_pai) VALUES (?, ?)",
    args: [nome_categoria, id_categoria_pai ?? null],
  });
  return Number(r.lastInsertRowid);
}

async function atualizarCategoria(id, { nome_categoria, status }) {
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
  await db.execute({
    sql: `UPDATE categoria SET ${sets.join(", ")} WHERE id = ?`,
    args,
  });
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
  return { ...pedido, itens: ri.rows, pagamentos: listarDoPedido(id) };
}

function buscarCheckout(id) {
  return db.execute({
    sql: "SELECT id_cliente, preferencia_id, referencia_pagamento FROM pedido WHERE id = ?",
    args: [id],
  }).rows[0];
}

// Troca a situação só se o pedido ainda estiver em "de". Cancelar devolve o estoque.
function alterarSituacaoPedido(id, de, para, preferenciaVerificada = null) {
  db.transaction(() => {
    const idDe = idSituacao(de);
    const idPara = idSituacao(para);

    if (para === "Cancelado") {
      const checkout = buscarCheckout(id);
      const pagamentoEmCurso = listarDoPedido(id).some((pg) =>
        pg.situacao === "Pendente" || pg.situacao === "Aprovado"
      );
      if (!checkout || checkout.preferencia_id !== preferenciaVerificada || pagamentoEmCurso) {
        const erro = new Error("Não foi possível cancelar. O checkout ou o pagamento precisa ser conferido.");
        erro.codigo = "CONFLITO";
        throw erro;
      }
    }

    const r = db.execute({
      sql: "UPDATE pedido SET id_situacao = ? WHERE id = ? AND id_situacao = ?",
      args: [idPara, id, idDe],
    });
    if (r.rowsAffected === 0) {
      const erro = new Error(
        "O pedido mudou de situação, atualize e tente de novo",
      );
      erro.codigo = "CONFLITO";
      throw erro;
    }

    if (para === "Cancelado") {
      db.execute({
        sql: `UPDATE produto
              SET estoque = estoque + (SELECT pp.quantidade FROM produto_pedido pp
                                       WHERE pp.id_pedido = ? AND pp.id_produto = produto.id)
              WHERE id IN (SELECT id_produto FROM produto_pedido WHERE id_pedido = ?)`,
        args: [id, id],
      });
    }
  });
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
  listarCategorias,
  buscarCategoria,
  criarCategoria,
  atualizarCategoria,
  listarPedidos,
  buscarPedido,
  buscarCheckout,
  alterarSituacaoPedido,
  resumoPedidos,
};
