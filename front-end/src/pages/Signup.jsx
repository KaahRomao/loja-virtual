import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useStore } from "../hooks/useStore";
import { request } from "../services/api";
import Button from "../components/ui/Button";
import { crumbLink, eyebrow, formInput, formLabel } from "../components/ui/styles";

export default function Signup() {
  const { login } = useStore();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.name.trim().length < 3) return setError("Informe seu nome completo.");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError("Digite um e-mail válido.");
    if (form.password.length < 6) return setError("A senha precisa ter pelo menos 6 caracteres.");
    if (form.password !== form.confirm) return setError("As senhas não são iguais.");
    setError("");
    setBusy(true);
    try {
      await request("/clientes", {
        method: "POST", body: { nome_cliente: form.name, email: form.email, senha: form.password, telefone: form.phone.trim() || undefined },
      });
      try {
        await login("cliente", form.email, form.password);
        navigate(state?.returnTo ?? "/", { replace: true });
      } catch {
        navigate("/entrar", { state, replace: true });
      }
    } catch (erro) {
      setError(erro.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="container-shell grid place-items-center pt-[50px] pb-[90px]">
      <form
        className="grid w-[min(440px,100%)] gap-3.5 rounded-[22px] border border-border bg-card p-[30px] shadow-card"
        noValidate
        onSubmit={submit}
      >
        <span className={eyebrow}>É RAPIDINHO</span>
        <h1 className="font-display text-[28px] font-bold leading-[normal] text-deep">Criar sua conta</h1>
        <label className={formLabel}>Nome completo<input className={formInput} type="text" value={form.name} onChange={set("name")} /></label>
        <label className={formLabel}>E-mail<input className={formInput} type="email" value={form.email} onChange={set("email")} /></label>
        <label className={formLabel}>Celular (opcional)<input className={formInput} type="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} /></label>
        <div className="grid grid-cols-[1fr_1fr] gap-3 mobile:grid-cols-[1fr]">
          <label className={formLabel}>Senha<input className={formInput} type="password" value={form.password} onChange={set("password")} /></label>
          <label className={formLabel}>Repetir senha<input className={formInput} type="password" value={form.confirm} onChange={set("confirm")} /></label>
        </div>
        {error && <p className="mt-1.5 text-[13px] font-bold text-destructive">{error}</p>}
        <Button type="submit" size="lg" disabled={busy}>{busy ? "Cadastrando…" : "Criar conta"}</Button>
        <p className="text-center text-[14px]">
          Já tem conta? <Link className={crumbLink} to="/entrar" state={state}>Entrar</Link>
        </p>
      </form>
    </section>
  );
}
