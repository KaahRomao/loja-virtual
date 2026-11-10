const express = require("express");
const pedidoController = require("../controllers/pedidoController");
const autenticar = require("../middlewares/autenticar");
const router = express.Router();

router.post("/", autenticar, pedidoController.criar);
router.get("/:id", autenticar, pedidoController.detalhar);
router.post("/:id/pagamento", autenticar, pedidoController.pagar);

module.exports = router;
