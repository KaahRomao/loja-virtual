const jwt = require("jsonwebtoken");

function autenticarAdmin(req, res, next) {
  const [tipo, token] = (req.headers.authorization ?? "").split(" ");
  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({ erro: "Token não informado" });
  }
  try {
    const dados = jwt.verify(token, process.env.JWT_SECRET);
    if (dados.tipo !== "admin" || !Number.isSafeInteger(dados.id)) {
      return res
        .status(401)
        .json({ erro: "Acesso restrito a administradores" });
    }
    req.adminId = dados.id;
    next();
  } catch (erro) {
    return res.status(401).json({ erro: "Token inválido ou expirado" });
  }
}

module.exports = autenticarAdmin;
