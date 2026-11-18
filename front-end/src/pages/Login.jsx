import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useStore } from "../hooks/useStore";
import { loginDestination } from "../data/checkout";
import { logoImage } from "../assets";
import Button from "../components/ui/Button";
import { crumbLink, formCard, formError, formInput, formLabel } from "../components/ui/styles";

export default function Login() {
  const { account, login } = useStore();
  const { state } = useLocation();
  const returnTo = loginDestination(state);
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
      const conta = await login(email, password);
      navigate(returnTo ?? (conta.role === "admin" ? "/admin" : "/conta"), { replace: true });
    } catch (erro) {
      setError(erro.message);
    } finally {
      setBusy(false);
    }
  };

  if (account) return <Navigate to={returnTo ?? (account.role === "admin" ? "/admin" : "/conta")} replace />;

  return (
    <section className="container-shell grid place-items-center pt-[50px] pb-[90px]">
      <form
        className={formCard + " w-[min(440px,100%)]"}
        noValidate
        onSubmit={submit}
      >
        <img src={logoImage} alt="VORA" className="brand-logo mb-1" width="148" height="48" />
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
