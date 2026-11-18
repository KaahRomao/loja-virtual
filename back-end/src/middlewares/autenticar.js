const jwt = require("jsonwebtoken");

function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization ?? "";
  const [tipo, token] = cabecalho.split(" ");

  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({ erro: "Token não informado" });
  }

  try {
    const dados = jwt.verify(token, process.env.JWT_SECRET);

    // Verificação para garantir que um admin não use rotas de cliente
    if (dados.tipo === "admin") {
      return res.status(401).json({ erro: "Token inválido ou expirado" });
    }

    req.clienteId = dados.id;
    next();
  } catch (erro) {
    return res.status(401).json({ erro: "Token inválido ou expirado" });
  }
}

module.exports = autenticar;
