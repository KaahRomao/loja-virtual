const authService = require("../services/authService");

async function login(req, res) {
  try {
    const { email, senha } = req.body ?? {};

    if (
      typeof email !== "string" ||
      typeof senha !== "string" ||
      !email.trim() ||
      !senha
    ) {
      return res.status(400).json({ erro: "email e senha são obrigatórios" });
    }

    const resultado = await authService.login({ email: email.trim(), senha });

    res.status(200).json(resultado);
  } catch (erro) {
    if (erro.codigo === "CREDENCIAIS_INVALIDAS") {
      return res.status(401).json({ erro: erro.message });
    }
    console.error(erro);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
}

module.exports = { login };
