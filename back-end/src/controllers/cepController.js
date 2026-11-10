const cepService = require("../services/cepService");

async function consultar(req, res) {
  try {
    const endereco = await cepService.consultarCep(req.params.cep);
    const frete = cepService.calcularFrete(endereco.uf);

    return res.status(200).json({ ...endereco, ...frete });
  } catch (erro) {
    if (erro.codigo === "CEP_INVALIDO") {
      return res.status(400).json({ erro: erro.message });
    }
    if (erro.codigo === "CEP_NAO_ENCONTRADO") {
      return res.status(404).json({ erro: erro.message });
    }
    if (erro.codigo === "CEP_SERVICO_INDISPONIVEL") {
      return res.status(502).json({ erro: erro.message });
    }
    console.error(erro);
    return res.status(500).json({ erro: "Erro interno do servidor" });
  }
}

module.exports = { consultar };
