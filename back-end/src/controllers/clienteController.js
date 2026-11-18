const clienteService = require("../services/clienteService");

async function cadastrar(req, res, next) {
  try {
    const { nome_cliente, email, senha, telefone } = req.body ?? {};

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
    if (Buffer.byteLength(senha, "utf8") > 72) {
      return res.status(400).json({ erro: "A senha deve ocupar no máximo 72 bytes" });
    }

    if (telefone != null && telefone !== "" &&
        (typeof telefone !== "string" || !/^[+() .0-9-]{8,24}$/.test(telefone.trim()))) {
      return res.status(400).json({ erro: "Telefone inválido" });
    }

    const cliente = await clienteService.cadastrar({
      telefone: typeof telefone === "string" ? telefone.trim() : null,
      nome_cliente: nome_cliente.trim(),
      email: email.trim(),
      senha,
    });

    res.status(201).json(cliente);
  } catch (erro) {
    if (
      erro.codigo === "EMAIL_JA_CADASTRADO" ||
      erro.errcode === 2067 ||
      erro.code === "SQLITE_CONSTRAINT_UNIQUE"
    ) {
      return res.status(409).json({ erro: "Email já cadastrado" });
    }
    return next(erro);
  }
}

module.exports = { cadastrar };
