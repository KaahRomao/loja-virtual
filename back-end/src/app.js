const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ mensagem: "API da VORA no ar" });
});

module.exports = app;
