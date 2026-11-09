const express = require("express");
const produtoRoutes = require("./routes/produtoRoutes");
const clienteRoutes = require("./routes/clienteRoutes");
const authRoutes = require("./routes/authRoutes");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ mensagem: "API da VORA no ar" });
});

app.use("/produtos", produtoRoutes);
app.use("/clientes", clienteRoutes);
app.use("/login", authRoutes);

module.exports = app;
