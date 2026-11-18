function erroCep(codigo, mensagem) {
  const erro = new Error(mensagem);
  erro.codigo = codigo;
  return erro;
}

// valores em centavos; ajuste conforme o PDF/professor
const FRETE_SP = { valor_frete: 1500, prazo_entrega: 3 };
const FRETE_SUDESTE = { valor_frete: 2000, prazo_entrega: 5 };
const FRETE_DEMAIS = { valor_frete: 3000, prazo_entrega: 8 };

async function consultarCep(cep) {
  const texto = String(cep).trim();
  if (!/^\d{5}-?\d{3}$/.test(texto)) {
    throw erroCep("CEP_INVALIDO", "CEP inválido");
  }
  const limpo = texto.replace("-", "");

  let resposta;
  try {
    resposta = await fetch(`https://viacep.com.br/ws/${limpo}/json/`, {
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    throw erroCep("CEP_SERVICO_INDISPONIVEL", "Serviço de CEP indisponível");
  }

  if (!resposta.ok) {
    throw erroCep("CEP_SERVICO_INDISPONIVEL", "Serviço de CEP indisponível");
  }

  const dados = await resposta.json().catch(() => null);
  if (!dados) throw erroCep("CEP_SERVICO_INDISPONIVEL", "Serviço de CEP indisponível");

  if (dados.erro) {
    throw erroCep("CEP_NAO_ENCONTRADO", "CEP não encontrado");
  }
  if (
    typeof dados.cep !== "string" ||
    dados.cep.replace("-", "") !== limpo ||
    typeof dados.localidade !== "string" ||
    !dados.localidade ||
    typeof dados.uf !== "string" ||
    !/^[A-Z]{2}$/.test(dados.uf)
  ) {
    throw erroCep("CEP_SERVICO_INDISPONIVEL", "Serviço de CEP devolveu um endereço inválido");
  }

  return {
    cep: dados.cep,
    logradouro: typeof dados.logradouro === "string" ? dados.logradouro : "",
    bairro: typeof dados.bairro === "string" ? dados.bairro : "",
    cidade: dados.localidade,
    uf: dados.uf,
  };
}

function calcularFrete(uf) {
  if (uf === "SP") return FRETE_SP;
  if (["RJ", "MG", "ES"].includes(uf)) return FRETE_SUDESTE;
  return FRETE_DEMAIS;
}

module.exports = { consultarCep, calcularFrete };
