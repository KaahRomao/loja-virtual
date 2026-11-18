import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useStore } from "../hooks/useStore";
import { readSession } from "../services/api";
import Button from "../components/ui/Button";
import { crumbLink, eyebrow, formInput, formLabel, pillLink } from "../components/ui/styles";

export default function Login() {
  const { user, login, logout } = useStore();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Digite um e-mail válido.");
    if (password.length < 4) return setError("Digite sua senha.");
    setError("");
    setBusy(true);
    try {
      await login("cliente", email, password);
      navigate(state?.returnTo ?? "/", { replace: true });
    } catch (erro) {
      setError(erro.message);
    } finally {
      setBusy(false);
    }
  };

  if (user) {
    const ultimo = readSession(`pedido_${user.id}`);
    return (
      <section className="container-shell grid justify-items-start gap-4 py-16">
        <h1 className="font-display text-3xl font-bold text-deep">Minha conta</h1>
        <p>{user.name}</p>
        {ultimo && <Link className={pillLink("outline", "md")} to={`/pedido/${ultimo}`}>Acompanhar último pedido</Link>}
        {state?.returnTo && <Link className={pillLink("primary", "md")} to={state.returnTo}>Continuar</Link>}
        <Button variant="outline" onClick={() => logout("cliente")}>Sair</Button>
      </section>
    );
  }

  return (
    <section className="container-shell grid place-items-center pt-[50px] pb-[90px]">
      <form
        className="grid w-[min(440px,100%)] gap-3.5 rounded-[22px] border border-border bg-card p-[30px] shadow-card"
        noValidate
        onSubmit={submit}
      >
        <span className={eyebrow}>BEM-VINDO DE VOLTA</span>
        <h1 className="font-display text-[28px] font-bold leading-[normal] text-deep">Entrar na sua conta</h1>
        <label className={formLabel}>
          E-mail
          <input className={formInput} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className={formLabel}>
          Senha
          <input className={formInput} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="mt-1.5 text-[13px] font-bold text-destructive">{error}</p>}
        <Button type="submit" size="lg" disabled={busy}>{busy ? "Entrando…" : "Entrar"}</Button>
        <p className="text-center text-[14px]">
          Ainda não tem conta? <Link className={crumbLink} to="/cadastro" state={state}>Cadastre-se</Link>
        </p>
      </form>
    </section>
  );
}
