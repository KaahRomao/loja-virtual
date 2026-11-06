const express = require("express");
const produtoRoutes = require("./routes/produtoRoutes");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ mensagem: "API da VORA no ar" });
});

app.use("/produtos", produtoRoutes);

module.exports = app;
