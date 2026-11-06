const express = require("express");
const produtoController = require("../controllers/produtoController");

const router = express.Router();

router.get("/", produtoController.listar);
router.get("/:id", produtoController.detalhar);

module.exports = router;
