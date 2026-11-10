const express = require("express");
const router = express.Router();
const autenticar = require("../middlewares/autenticar");
const pagamentoController = require("../controllers/pagamentoController");

router.post("/webhook", pagamentoController.webhook);
router.post("/sincronizar", autenticar, pagamentoController.sincronizar);

module.exports = router;
