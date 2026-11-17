import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../hooks/useStore";
import Button from "../components/ui/Button";
import { crumbLink, eyebrow, formInput, formLabel, noteBox } from "../components/ui/styles";

export default function Login() {
  const { setUser } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Digite um e-mail válido.");
    if (password.length < 4) return setError("Digite sua senha.");
    // Aqui você chama o seu back-end.
    setUser({ name: email.split("@")[0], email });
    navigate("/");
  };

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
        <Button type="submit" size="lg">Entrar</Button>
        <p className="text-center text-[14px]">
          Ainda não tem conta? <Link className={crumbLink} to="/cadastro">Cadastre-se</Link>
        </p>
        <p className={noteBox}>Demonstração: nenhuma conta real é criada ou acessada.</p>
      </form>
    </section>
  );
}
