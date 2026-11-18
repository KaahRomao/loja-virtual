const express = require("express");
const produtoRoutes = require("./routes/produtoRoutes");
const clienteRoutes = require("./routes/clienteRoutes");
const authRoutes = require("./routes/authRoutes");
const pedidoRoutes = require("./routes/pedidoRoutes");
const cors = require("cors");
const cepRoutes = require("./routes/cepRoutes");
const pagamentoRoutes = require("./routes/pagamentoRoutes");
const adminRoutes = require("./routes/adminRoutes");
const db = require("./database/connection");
const app = express();

const origens = [
  "http://localhost:5173", "http://127.0.0.1:5173",
  "http://localhost:4173", "http://127.0.0.1:4173",
  process.env.FRONT_URL, process.env.MP_RETURN_URL,
].filter(Boolean).map((origem) => origem.replace(/\/$/, ""));
app.use(cors({ origin: origens }));

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ mensagem: "API da VORA no ar" });
});

app.get("/health", async (req, res) => {
  try {
    await db.execute("SELECT id FROM produto LIMIT 1");
    return res.json({ status: "ok" });
  } catch (erro) {
    console.error("Falha na verificação do SQLite:", erro.code ?? erro.message);
    return res.status(503).json({ status: "indisponivel" });
  }
});

app.use("/produtos", produtoRoutes);
app.use("/clientes", clienteRoutes);
app.use("/login", authRoutes);
app.use("/pedidos", pedidoRoutes);
app.use("/cep", cepRoutes);
app.use("/pagamentos", pagamentoRoutes);
app.use("/admin", adminRoutes);

app.use((req, res) => res.status(404).json({ erro: "Rota não encontrada" }));

app.use((erro, req, res, next) => {
  if (res.headersSent) return next(erro);
  if (erro.type === "entity.parse.failed") return res.status(400).json({ erro: "JSON inválido" });
  if (erro.type === "entity.too.large") return res.status(413).json({ erro: "Corpo da requisição muito grande" });
  console.error(erro);
  return res.status(500).json({ erro: "Erro interno do servidor" });
});

module.exports = app;
