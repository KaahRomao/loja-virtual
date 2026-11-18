import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useStore } from "../hooks/useStore";
import { checkoutDestination } from "../data/checkout";
import { readSession } from "../services/api";
import Button from "../components/ui/Button";
import { crumbLink, formCard, formError, formInput, formLabel, pillLink } from "../components/ui/styles";

export default function Login() {
  const { user, login, logout } = useStore();
  const { state } = useLocation();
  const returnTo = checkoutDestination(state);
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
      navigate(returnTo ?? "/", { replace: true });
    } catch (erro) {
      setError(erro.message);
    } finally {
      setBusy(false);
    }
  };

  if (user) {
    if (returnTo) return <Navigate to={returnTo} replace />;
    const ultimo = readSession(`pedido_${user.id}`);
    return (
      <section className="container-shell grid justify-items-start gap-4 py-16">
        <h1 className="font-display text-3xl font-bold text-deep">Minha conta</h1>
        <p>{user.name}</p>
        {ultimo && <Link className={pillLink("outline", "md")} to={`/pedido/${ultimo}`}>Acompanhar último pedido</Link>}
        <Button variant="outline" onClick={() => logout("cliente")}>Sair</Button>
      </section>
    );
  }

  return (
    <section className="container-shell grid place-items-center pt-[50px] pb-[90px]">
      <form
        className={formCard + " w-[min(440px,100%)]"}
        noValidate
        onSubmit={submit}
      >
        <h1 className="font-display text-[28px] font-bold leading-[normal] text-deep">Entrar na sua conta</h1>
        {returnTo && <p className="text-sm text-muted-foreground">Entre para continuar de onde parou.</p>}
        <label className={formLabel}>
          E-mail
          <input className={formInput} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className={formLabel}>
          Senha
          <input className={formInput} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p role="alert" className={formError}>{error}</p>}
        <Button type="submit" size="lg" disabled={busy}>{busy ? "Entrando…" : "Entrar"}</Button>
        <p className="text-center text-[14px]">
          Ainda não tem conta? <Link className={crumbLink} to="/cadastro" state={state}>Cadastre-se</Link>
        </p>
      </form>
    </section>
  );
}
