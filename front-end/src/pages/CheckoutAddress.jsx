import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../hooks/useStore";
import { formatZip, validateZip } from "../data/products";
import { CheckoutSteps, OrderSummary, EmptyCart } from "../components/CheckoutParts";
import { consultarCep, dadosDoCep } from "../services/api";
import Button from "../components/ui/Button";
import { formCard, formError, formInput, formLabel, pillLink } from "../components/ui/styles";

export default function CheckoutAddress() {
  const { cartItems, address, setAddress, user } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...address, name: address.name || user?.name || "", zip: formatZip(address.zip) });
  const [errors, setErrors] = useState({});

  const [buscando, setBuscando] = useState(false);
  const requisicao = useRef(0);

  const buscar = async (cep, numero) => {
    setBuscando(true);
    try {
      const cotacao = await consultarCep(cep);
      if (numero !== requisicao.current) return;
      setForm((f) => ({ ...f, ...dadosDoCep(cotacao), zip: formatZip(cep) }));
      setErrors((e) => ({ ...e, zip: null }));
    } catch (erro) {
      if (numero === requisicao.current) setErrors((e) => ({ ...e, zip: erro.message }));
    } finally {
      if (numero === requisicao.current) setBuscando(false);
    }
  };

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));
  const mudarCep = (e) => {
    const cep = formatZip(e.target.value);
    const numero = ++requisicao.current;
    setForm((f) => ({ ...f, zip: cep, street: "", neighborhood: "", city: "", uf: "", freight: null }));
    setErrors((erros) => ({ ...erros, zip: null }));
    if (!validateZip(cep)) buscar(cep, numero);
    else setBuscando(false);
  };

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (form.name.trim().length < 3) err.name = "Informe seu nome completo.";
    const zipErr = validateZip(form.zip);
    if (zipErr || form.freight === null) err.zip = zipErr || errors.zip || "Consulte o CEP antes de continuar.";
    if (!form.number.trim()) err.number = "Informe o número.";
    if (form.street.trim().length < 3) err.street = "Informe a rua ou avenida.";
    setErrors(err);
    if (Object.keys(err).length) return;
    setAddress({ ...form, zip: form.zip.replace(/\D/g, "") });
    navigate("/checkout/pagamento");
  };

  // Um campo de texto com a mensagem de erro logo abaixo
  const field = (k, label, props = {}) => (
    <label className={formLabel}>
      {label}
      <input className={formInput} aria-invalid={!!errors[k]} value={form[k]} onChange={set(k)} {...props} />
      {errors[k] && <span className={formError}>{errors[k]}</span>}
    </label>
  );

  return (
    <section className="container-shell min-h-[620px] pt-[30px] pb-[90px]">
      <CheckoutSteps step={1} />
      <h1 className="mt-[18px] mb-[22px] font-display text-[34px] font-bold leading-[normal] text-deep">Onde vamos entregar?</h1>
      {cartItems.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)_340px] items-start gap-7 tablet:grid-cols-[1fr]">
          <form className={formCard} noValidate onSubmit={submit}>
            {field("name", "Nome completo", { autoComplete: "name" })}
            <div className="grid grid-cols-[1fr_1fr] gap-3 mobile:grid-cols-[1fr]">
              {field("zip", "CEP", { inputMode: "numeric", placeholder: "00000-000", maxLength: 9, onChange: mudarCep })}
              {field("number", "Número")}
            </div>
            {buscando && <p role="status">Consultando CEP…</p>}
            {!buscando && !validateZip(form.zip) && form.freight === null && (
              <Button variant="outline" onClick={() => buscar(form.zip, ++requisicao.current)}>Consultar CEP</Button>
            )}
            {field("street", "Rua / Avenida", { autoComplete: "street-address" })}
            {field("neighborhood", "Bairro")}
            <div className="grid grid-cols-[1fr_100px] gap-3">
              {field("city", "Cidade", { readOnly: true })}
              {field("uf", "UF", { readOnly: true })}
            </div>
            <label className={formLabel}>
              Complemento (opcional)
              <input className={formInput} placeholder="Apto, bloco, referência" value={form.complement} onChange={set("complement")} />
            </label>
            <div className="mt-1.5 flex flex-wrap justify-between gap-2.5">
              <Link className={pillLink("outline", "md")} to="/carrinho"><ArrowLeft size={16} /> Voltar</Link>
              <Button type="submit" size="lg" disabled={buscando}>
                Ir para pagamento <ArrowRight size={16} />
              </Button>
            </div>
          </form>
          <OrderSummary quote={form} />
        </div>
      )}
    </section>
  );
}
