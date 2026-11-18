const authService = require("../services/authService");

async function login(req, res, next) {
  try {
    const { email, senha } = req.body ?? {};

    if (
      typeof email !== "string" ||
      typeof senha !== "string" ||
      !email.trim() ||
      !senha ||
      Buffer.byteLength(senha, "utf8") > 72
    ) {
      return res.status(400).json({ erro: "Informe o e-mail e uma senha válida" });
    }

    const resultado = await authService.login({ email: email.trim(), senha });

    res.status(200).json(resultado);
  } catch (erro) {
    if (erro.codigo === "CREDENCIAIS_INVALIDAS") {
      return res.status(401).json({ erro: erro.message });
    }
    return next(erro);
  }
}

module.exports = { login };
