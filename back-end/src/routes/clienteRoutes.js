const express = require("express");
const clienteController = require("../controllers/clienteController");

const router = express.Router();

router.post("/", clienteController.cadastrar);

module.exports = router;
