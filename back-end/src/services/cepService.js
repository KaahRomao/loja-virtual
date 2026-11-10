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
  const limpo = String(cep).replace(/\D/g, "");

  if (limpo.length !== 8) {
    throw erroCep("CEP_INVALIDO", "CEP inválido");
  }

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

  const dados = await resposta.json();

  if (dados.erro) {
    throw erroCep("CEP_NAO_ENCONTRADO", "CEP não encontrado");
  }

  return {
    cep: dados.cep,
    logradouro: dados.logradouro,
    bairro: dados.bairro,
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
