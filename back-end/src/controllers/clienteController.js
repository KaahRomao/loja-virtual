const clienteService = require("../services/clienteService");

async function cadastrar(req, res) {
  try {
    const { nome_cliente, email, senha } = req.body ?? {};

    const campos = [nome_cliente, email, senha];
    if (campos.some((c) => typeof c !== "string" || !c.trim())) {
      return res
        .status(400)
        .json({ erro: "nome_cliente, email e senha são obrigatórios" });
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      return res.status(400).json({ erro: "Email inválido" });
    }

    if (senha.length < 6) {
      return res
        .status(400)
        .json({ erro: "A senha deve ter pelo menos 6 caracteres" });
    }

    const cliente = await clienteService.cadastrar({
      nome_cliente: nome_cliente.trim(),
      email: email.trim(),
      senha,
    });

    res.status(201).json(cliente);
  } catch (erro) {
    if (
      erro.codigo === "EMAIL_JA_CADASTRADO" ||
      erro.code === "SQLITE_CONSTRAINT_UNIQUE"
    ) {
      return res.status(409).json({ erro: "Email já cadastrado" });
    }
    console.error(erro);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
}

module.exports = { cadastrar };
