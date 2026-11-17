import { Link } from "react-router-dom";
import { useStore } from "../hooks/useStore";
import { logoImage } from "../assets";

const footerLink = "mb-[9px] block text-[14px] text-primary-foreground opacity-[.82] hover:opacity-100";
const footerTitle = "mb-[15px] font-display text-[17px] font-medium leading-[normal]";
const footerText = "mt-[17px] max-w-[260px] text-[13px] leading-[1.7] opacity-75";

export default function Footer() {
  const { categoryNames } = useStore();
  return (
    <footer className="bg-footer text-primary-foreground">
      <div className="container-shell grid grid-cols-[2.2fr_1fr_1fr_1.35fr] gap-10 pt-[55px] pb-[49px] mobile:grid-cols-[1fr_1fr] mobile:gap-[29px] mobile:py-[42px]">
        <div className="mobile:col-span-full">
          <img className="h-auto w-[130px] brightness-0 invert" src={logoImage} width="160" height="50" alt="VORA" />
          <p className={footerText}>
            Tudo que você precisa.
            <br />
            Do básico ao especial, com economia e carinho.
          </p>
        </div>
        <div>
          <h3 className={footerTitle}>Explore</h3>
          {Object.entries(categoryNames).map(([slug, name]) => (
            <Link key={slug} className={footerLink} to={`/categoria/${slug}`}>{name}</Link>
          ))}
        </div>
        <div>
          <h3 className={footerTitle}>Sua compra</h3>
          <Link className={footerLink} to="/carrinho">Meu carrinho</Link>
          <Link className={footerLink} to="/catalogo">Todos os produtos</Link>
          <Link className={footerLink} to="/entrar">Minha conta</Link>
        </div>
        <div>
          <h3 className={footerTitle}>VORA supermarket</h3>
          <p className={footerText}>Mais economia e qualidade para o dia a dia da sua família.</p>
          <Link className="mt-3.5 mb-[9px] block text-[12px] underline opacity-60 hover:opacity-100" to="/admin">
            Área do administrador
          </Link>
        </div>
      </div>
      <div className="container-shell flex justify-between border-t border-white/14 py-[17px] text-[11px] opacity-[.66] mobile:gap-4 tiny:flex-col">
        <span>© {new Date().getFullYear()} VORA supermarket. Tudo que você precisa.</span>
        <span>Feito para facilitar sua vida ♡</span>
      </div>
    </footer>
  );
}
