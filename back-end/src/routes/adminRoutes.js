const express = require("express");
const router = express.Router();
const autenticarAdmin = require("../middlewares/autenticarAdmin");
const c = require("../controllers/adminController");

router.post("/login", c.login);

router.use(autenticarAdmin);

router.get("/resumo", c.resumo);

router.get("/produtos", c.listarProdutos);
router.get("/produtos/:id", c.detalharProduto);
router.post("/produtos", c.criarProduto);
router.put("/produtos/:id", c.atualizarProduto);

router.get("/categorias", c.listarCategorias);
router.post("/categorias", c.criarCategoria);
router.put("/categorias/:id", c.atualizarCategoria);

router.get("/pedidos", c.listarPedidos);
router.get("/pedidos/:id", c.detalharPedido);
router.patch("/pedidos/:id/situacao", c.alterarSituacaoPedido);

module.exports = router;
