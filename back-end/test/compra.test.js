const { test } = require("node:test");
const assert = require("node:assert/strict");
const { mkdtempSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join } = require("node:path");
const { once } = require("node:events");
const { DatabaseSync } = require("node:sqlite");
const { createHmac, randomUUID } = require("node:crypto");
const { inspect } = require("node:util");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Payment, Preference } = require("mercadopago");

test("API local com SQLite e respostas de teste das integrações", async (t) => {
  const pasta = mkdtempSync(join(tmpdir(), "vora-teste-"));
  process.env.DB_PATH = join(pasta, "vora.sqlite");
  if (process.env.VORA_TEST_LIBSQL === "1") {
    process.env.RENDER = "true";
    process.env.TURSO_DATABASE_URL = `file:${process.env.DB_PATH}`;
  } else {
    delete process.env.RENDER;
    delete process.env.TURSO_DATABASE_URL;
  }
  delete process.env.TURSO_AUTH_TOKEN;
  process.env.JWT_SECRET = randomUUID();
  process.env.MP_TEST_ACCESS_TOKEN = "fixture";
  process.env.MP_WEBHOOK_SECRET = randomUUID();
  process.env.MP_RETURN_URL = "https://loja.example.invalid";
  process.env.MP_WEBHOOK_URL = "https://api.example.invalid/pagamentos/webhook";

  const db = require("../src/database/connection");
  await db.execute({
    sql: "INSERT INTO administrador(nome,email,senha) VALUES (?,?,?)",
    args: ["Admin teste", "admin@example.invalid", await bcrypt.hash("senha-teste", 4)],
  });

  const enviar = globalThis.fetch;
  t.mock.method(globalThis, "fetch", (url, ...options) => {
    if (!String(url).startsWith("https://viacep.com.br/")) return enviar(url, ...options);
    if (String(url).includes("11111111")) return Promise.reject(new Error("offline"));
    if (String(url).includes("22222222")) return Promise.resolve(Response.json({ uf: "SP" }));
    const dados = String(url).includes("99999999")
      ? { erro: true }
      : { cep: "01001-000", logradouro: "Praça da Sé", bairro: "Sé", localidade: "São Paulo", uf: "SP" };
    return Promise.resolve(Response.json(dados));
  });

  let preferencia;
  let preferenciaVencida = false;
  let chamadas = 0;
  const pagamentos = [];
  t.mock.method(Preference.prototype, "create", async ({ body }) => {
    chamadas++;
    preferencia = body;
    return { id: "preferencia-teste", init_point: "https://checkout.example.invalid/teste" };
  });
  t.mock.method(Preference.prototype, "get", async () => ({
    external_reference: preferencia.external_reference,
    expires: preferenciaVencida,
    expiration_date_to: new Date(Date.now() - 60000).toISOString(),
  }));
  t.mock.method(Payment.prototype, "get", async ({ id }) => pagamentos.find((pg) => String(pg.id) === String(id)));
  t.mock.method(Payment.prototype, "search", async () => ({ results: [...pagamentos].reverse() }));

  const srv = require("../src/app").listen(0, "127.0.0.1");
  await once(srv, "listening");
  t.after(async () => {
    await new Promise((resolve) => srv.close(resolve));
    rmSync(pasta, { recursive: true, force: true });
  });

  async function chamar(path, status, { method = "GET", body, token, headers = {} } = {}) {
    const r = await fetch(`http://127.0.0.1:${srv.address().port}${path}`, {
      method,
      headers: {
        ...headers,
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const dados = await r.json().catch(() => null);
    assert.equal(r.status, status, `${method} ${path} ${JSON.stringify(dados)}`);
    return dados;
  }

  const post = (path, status, body, token) => chamar(path, status, { method: "POST", body, token });
  const cliente = { nome_cliente: "Cliente Teste", email: "cliente@example.invalid", senha: "senha-teste" };
  assert.deepEqual(await chamar("/health", 200), { status: "ok" });
  assert.deepEqual(await chamar("/produtos/%E0%A4%A", 400), { erro: "Endereço da requisição inválido" });
  await post("/clientes", 400, {});
  await post("/clientes", 400, { ...cliente, senha: "a".repeat(73) });
  await post("/clientes", 201, cliente);
  await post("/clientes", 409, cliente);
  await post("/login", 401, { ...cliente, senha: "errada" });
  const { token, role } = await post("/login", 200, { ...cliente, email: cliente.email.toUpperCase() });
  assert.equal(role, "cliente");

  const credenciaisAdmin = { email: "admin@example.invalid", senha: "senha-teste" };
  const admin = await post("/login", 200, credenciaisAdmin);
  assert.equal(admin.role, "admin");
  for (const [jwtDeAcesso, papel] of [[token, "cliente"], [admin.token, "admin"]]) {
    const { exp, iat, tipo } = jwt.decode(jwtDeAcesso);
    assert.equal(tipo, papel);
    assert.equal(exp - iat, 7200);
  }
  assert.equal((await post("/admin/login", 200, credenciaisAdmin)).admin.id, admin.admin.id);
  await post("/clientes", 409, { ...cliente, email: credenciaisAdmin.email.toUpperCase() });
  await chamar("/admin/produtos", 401, { token });
  await post("/pedidos", 401, {}, admin.token);

  const catalogo = await chamar("/produtos", 200);
  assert.equal(catalogo.length, 16);
  const categoriaVazia = await post("/admin/categorias", 201, { nome_categoria: "Categoria sem produtos" }, admin.token);
  assert.ok((await chamar("/categorias", 200)).some((categoria) => categoria.id === categoriaVazia.id));
  assert.deepEqual(await chamar(`/produtos?categoria=${categoriaVazia.id}`, 200), []);
  await chamar(`/admin/categorias/${categoriaVazia.id}`, 200, {
    method: "PUT", body: { status: 0 }, token: admin.token,
  });
  assert.ok(!(await chamar("/categorias", 200)).some((categoria) => categoria.id === categoriaVazia.id));
  const [banana] = await chamar("/produtos?busca=Banana", 200);
  assert.equal(banana.nome_produto, "Banana Prata 1kg");
  assert.equal(banana.preco, 599);
  assert.equal(banana.preco_anterior, 699);
  const { lastInsertRowid } = await db.execute(`
    INSERT INTO produto (nome_produto, descricao, img_url, preco, estoque, id_categoria, id_situacao)
    SELECT nome_produto, descricao, img_url, preco, estoque + 1, id_categoria, id_situacao FROM produto WHERE id = 1
  `);
  const oferta = await chamar("/produtos?busca=Banana", 200);
  assert.equal(oferta.length, 1);
  assert.deepEqual(oferta[0].ids_equivalentes, [Number(lastInsertRowid)]);
  assert.ok((await chamar("/produtos?categoria=1", 200)).some((p) => p.id === banana.id));
  await chamar("/produtos/999", 404);
  assert.equal((await chamar("/cep/01001000", 200)).valor_frete, 1500);
  await chamar("/cep/abc", 400);
  await chamar("/cep/a01001000", 400);
  await chamar("/cep/99999999", 404);
  await chamar("/cep/11111111", 502);
  await chamar("/cep/22222222", 502);

  const compra = {
    cep_entrega: "01001-000", endereco_entrega: "Praça da Sé, 1", chave_checkout: randomUUID(),
    itens: [{ id_produto: banana.id, quantidade: 1 }],
  };
  await post("/pedidos", 409, {
    ...compra, itens: [{ id_produto: banana.id, quantidade: banana.estoque + 1 }],
  }, token);
  const [pedido, repetido] = await Promise.all([
    post("/pedidos", 201, compra, token), post("/pedidos", 201, compra, token),
  ]);
  assert.equal(pedido.id, repetido.id);
  assert.deepEqual((await chamar("/pedidos", 200, { token })).map((p) => p.id), [pedido.id]);
  const conflito = await post("/pedidos", 409, { ...compra, endereco_entrega: "Praça da Sé, 2" }, token);
  assert.match(conflito.erro, /chave do checkout/);
  assert.equal(pedido.valor_total, banana.preco + 1500);
  assert.equal((await chamar(`/produtos/${banana.id}`, 200)).estoque, banana.estoque - 1);

  const outro = { ...cliente, email: "outro@example.invalid" };
  await post("/clientes", 201, outro);
  const sessaoOutro = await post("/login", 200, outro);
  assert.deepEqual(await chamar("/pedidos", 200, { token: sessaoOutro.token }), []);
  await chamar(`/pedidos/${pedido.id}`, 404, { token: sessaoOutro.token });
  await post("/pagamentos/sincronizar", 404, { pedido_id: pedido.id }, sessaoOutro.token);

  const caminhoPagamento = `/pedidos/${pedido.id}/pagamento`;
  const links = await Promise.all([post(caminhoPagamento, 200, {}, token), post(caminhoPagamento, 200, {}, token)]);
  assert.deepEqual(links[0], links[1]);
  assert.equal(chamadas, 1);
  assert.equal(preferencia.back_urls.success, `https://loja.example.invalid/pedido/${pedido.id}`);
  assert.equal(preferencia.notification_url, process.env.MP_WEBHOOK_URL);
  const cancelarCliente = (id, status, sessao = token) => post(`/pedidos/${id}/cancelar`, status, {}, sessao);
  const cancelar = (id, status) => chamar(`/admin/pedidos/${id}/situacao`, status, {
    method: "PATCH", body: { situacao: "Cancelado" }, token: admin.token,
  });
  await cancelar(pedido.id, 409);
  await cancelarCliente(pedido.id, 409);
  await cancelarCliente(pedido.id, 404, sessaoOutro.token);
  assert.equal((await chamar(`/produtos/${banana.id}`, 200)).estoque, banana.estoque - 1);
  const pagamento = {
    id: 1, external_reference: preferencia.external_reference,
    currency_id: "BRL", transaction_amount: pedido.valor_total / 100, payment_type_id: "credit_card",
  };
  await post("/pagamentos/webhook?data.id=1", 401, { type: "payment" });
  for (const [status, gravado] of [["pending", "Pendente"], ["rejected", "Recusado"], ["approved", "Aprovado"]]) {
    pagamentos.push({ ...pagamento, id: status === "approved" ? 2 : 1, status });
    if (status === "pending") {
      await post(caminhoPagamento, 409, {}, token);
      assert.equal(chamadas, 1);
    }
    if (status === "approved") {
      const ts = String(Date.now());
      const reqId = randomUUID();
      const hash = createHmac("sha256", process.env.MP_WEBHOOK_SECRET)
        .update(`id:2;request-id:${reqId};ts:${ts};`).digest("hex");
      const webhook = {
        method: "POST", body: { type: "payment" },
        headers: { "x-signature": `ts=${ts},v1=${hash}`, "x-request-id": reqId },
      };
      await chamar("/pagamentos/webhook?data.id=2", 200, webhook);
      await chamar("/pagamentos/webhook?data.id=2", 200, webhook);
    } else {
      await post("/pagamentos/sincronizar", 200, { pedido_id: pedido.id }, token);
    }
    const detalhe = await chamar(`/pedidos/${pedido.id}`, 200, { token });
    assert.equal(detalhe.pagamentos[0].situacao, gravado);
    assert.equal(detalhe.situacao, status === "approved" ? "Pago" : "Pendente");
  }
  pagamentos.push({ ...pagamento, id: 4, status: "approved" });
  await post("/pagamentos/sincronizar", 200, { pedido_id: pedido.id }, token);
  assert.equal((await chamar(`/admin/pedidos/${pedido.id}`, 200, { token: admin.token })).alerta_pagamento, "MULTIPLAS_APROVACOES");
  await cancelarCliente(pedido.id, 409);
  await chamar(`/admin/pedidos/${pedido.id}/situacao`, 200, {
    method: "PATCH", body: { situacao: "Enviado" }, token: admin.token,
  });
  await cancelarCliente(pedido.id, 409);

  const semCheckout = await post("/pedidos", 201, { ...compra, chave_checkout: randomUUID() }, token);
  await post(`/pedidos/${semCheckout.id}/cancelar`, 401, {});
  await cancelarCliente(semCheckout.id, 404, sessaoOutro.token);
  assert.equal((await cancelarCliente(semCheckout.id, 200)).situacao, "Cancelado");
  await cancelarCliente(semCheckout.id, 409);
  await cancelar(semCheckout.id, 409);
  assert.equal((await chamar(`/produtos/${banana.id}`, 200)).estoque, banana.estoque - 1);

  const cancelavel = await post("/pedidos", 201, { ...compra, chave_checkout: randomUUID() }, token);
  await post(`/pedidos/${cancelavel.id}/pagamento`, 200, {}, token);
  preferenciaVencida = true;
  assert.equal((await cancelar(cancelavel.id, 200)).situacao, "Cancelado");
  assert.equal((await chamar(`/produtos/${banana.id}`, 200)).estoque, banana.estoque - 1);
  pagamentos.push({ ...pagamento, id: 3, status: "approved", external_reference: preferencia.external_reference });
  await post("/pagamentos/sincronizar", 200, { pedido_id: cancelavel.id }, token);
  const relato = await chamar(`/admin/pedidos/${cancelavel.id}`, 200, { token: admin.token });
  assert.equal(relato.situacao, "Cancelado");
  assert.equal(relato.alerta_pagamento, "APROVACAO_APOS_CANCELAMENTO");
  assert.equal(relato.pagamentos[0].situacao, "Aprovado");

  const produto = await post("/admin/produtos", 201, {
    nome_produto: "Produto teste", descricao: "Cadastro na auditoria", preco: 599, preco_anterior: 699,
    estoque: 0, id_categoria: banana.id_categoria,
  }, admin.token);
  await post("/pedidos", 409, {
    ...compra, chave_checkout: randomUUID(), itens: [{ id_produto: produto.id, quantidade: 1 }],
  }, token);

  const persisted = new DatabaseSync(process.env.DB_PATH, { readOnly: true });
  assert.equal(persisted.prepare("SELECT count(*) AS n FROM pagamento").get().n, 4);
  assert.equal(persisted.prepare("PRAGMA quick_check").get().quick_check, "ok");
  persisted.close();

  await t.test("erros internos preservam o código sem divulgar detalhes", async (caso) => {
    const sentinela = "detalhe-sintetico-da-integracao";
    const erros = [];
    caso.mock.method(console, "error", (...args) => erros.push(inspect(args)));
    const produtoService = require("../src/services/produtoService");
    caso.mock.method(produtoService, "listarProdutos", async () => {
      throw Object.assign(new Error(sentinela), { code: "FALHA_TESTE", cause: { token: sentinela } });
    });
    assert.deepEqual(await chamar("/produtos", 500), { erro: "Erro interno do servidor" });
    assert.match(erros.join("\n"), /FALHA_TESTE/);
    assert.ok(erros.every((linha) => !linha.includes(sentinela)));
  });
});
