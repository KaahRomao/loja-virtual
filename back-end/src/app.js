const express = require("express");
const produtoRoutes = require("./routes/produtoRoutes");
const clienteRoutes = require("./routes/clienteRoutes");
const authRoutes = require("./routes/authRoutes");
const autenticar = require("./middlewares/autenticar");
const pedidoRoutes = require("./routes/pedidoRoutes");
const cors = require("cors");
const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ mensagem: "API da VORA no ar" });
});

app.use("/produtos", produtoRoutes);
app.use("/clientes", clienteRoutes);
app.use("/login", authRoutes);
app.use("/pedidos", pedidoRoutes);

module.exports = app;
