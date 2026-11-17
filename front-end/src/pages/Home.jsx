import { Sparkles, ArrowRight, Tag, ShieldCheck, ShoppingBasket, Carrot, Cookie, SprayCan } from "lucide-react";
import { Link } from "react-router-dom";
import ProductGrid from "../components/ProductGrid";
import SectionHeading from "../components/SectionHeading";
import { products, categoryInfo } from "../data/products";
import { useStore } from "../hooks/useStore";
import { heroImage } from "../assets";
import { cx, pillLink, textArrow } from "../components/ui/styles";

const byId = (ids) => ids.map((id) => products.find((p) => p.id === id));
const categoryIcons = { comida: Carrot, snacks: Cookie, limpeza: SprayCan };
const tileColors = ["bg-pale", "bg-cream", "bg-secondary"];

const benefits = [
  { icon: Tag, title: "Preço que ajuda", text: "Economia em cada compra" },
  { icon: ShieldCheck, title: "Qualidade de verdade", text: "Escolhas para sua família" },
  { icon: ShoppingBasket, title: "Tudo em um lugar", text: "Do básico ao especial" },
];

export default function Home() {
  const { categoryNames } = useStore();
  const offers = byId([1, 2, 4, 16]);
  const favorites = byId([3, 6, 13, 25]);

  return (
    <>
      {/* Banner principal */}
      <section
        className="relative flex h-[clamp(390px,34vw,490px)] items-center bg-cover bg-center mobile:h-[470px] mobile:bg-[position:62%_center] mobile:before:absolute mobile:before:inset-0 mobile:before:bg-[linear-gradient(90deg,var(--color-pale)_0%,oklch(94.9%_.065_174/.88)_45%,transparent_100%)] mobile:before:content-['']"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="container-shell mobile:relative">
          <div className="max-w-[580px] mobile:max-w-[380px]">
            <span className="inline-flex items-center gap-[7px] rounded-[40px] bg-card px-[13px] py-[9px] text-[11px] font-black tracking-[.07em] text-primary">
              <Sparkles size={15} /> O MERCADO DA SUA FAMÍLIA
            </span>
            <h1 className="mt-[21px] mb-[17px] font-display text-[clamp(39px,4.3vw,64px)] font-semibold leading-[1.06] text-deep mobile:text-[clamp(36px,8vw,49px)]">
              Tudo que você precisa.
              <br />
              <em className="text-primary not-italic">Do jeitinho que cabe no bolso.</em>
            </h1>
            <p className="mb-[25px] max-w-[430px] text-[17px] leading-[1.5] text-foreground mobile:max-w-[320px] mobile:text-[15px]">
              Produtos para o seu dia a dia, com qualidade de verdade e preço que faz bem.
            </p>
            <Link className={cx(pillLink("primary", "lg"), "mt-[26px]")} to="/catalogo">
              Comprar agora <ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Vantagens */}
      <section
        className="container-shell grid min-h-[106px] grid-cols-[repeat(3,1fr)] items-center border-b border-border mobile:min-h-0 mobile:grid-cols-[1fr_1fr] mobile:gap-3 mobile:py-[17px]"
        aria-label="Vantagens VORA"
      >
        {benefits.map(({ icon: Icon, title, text }, i) => (
          <div
            key={title}
            className={cx(
              "flex items-center justify-center gap-3.5 mobile:justify-start mobile:gap-[9px]",
              i > 0 && "border-l border-border mobile:border-l-0",
              i === benefits.length - 1 && "mobile:hidden",
            )}
          >
            <span className="grid size-[42px] place-items-center rounded-[50%] bg-pale text-primary mobile:size-[35px] mobile:flex-none">
              <Icon className="w-5 mobile:w-4" />
            </span>
            <span>
              <b className="block font-display text-[16px] font-medium mobile:text-[13px]">{title}</b>
              <small className="mt-0.5 block text-[12px] text-muted-foreground mobile:text-[10px] tiny:hidden">{text}</small>
            </span>
          </div>
        ))}
      </section>

      {/* Ofertas */}
      <section className="container-shell pt-[70px] pb-[78px] mobile:pt-11 mobile:pb-[50px]" id="ofertas">
        <SectionHeading
          label="SELEÇÃO VORA"
          title={<>Ofertas pra aproveitar <span className="text-amber">✦</span></>}
          text="Economize no que não pode faltar em casa."
        >
          <Link className={textArrow} to="/catalogo?ofertas=true">
            Ver ofertas da semana <ArrowRight className="w-[18px]" />
          </Link>
        </SectionHeading>
        <ProductGrid items={offers} />
      </section>

      {/* Categorias */}
      <section className="bg-surface pt-[65px] pb-[72px] mobile:py-11">
        <div className="container-shell">
          <SectionHeading
            label="ENCONTRE RAPIDINHO"
            title="O que vai pra sua lista hoje?"
            text="Escolha uma categoria e encontre tudo mais fácil."
          />
          <div className="grid grid-cols-[repeat(3,1fr)] gap-[18px] mobile:grid-cols-[1fr] mobile:gap-2.5">
            {Object.keys(categoryInfo).map((slug, i) => {
              const Icon = categoryIcons[slug];
              return (
                <Link
                  key={slug}
                  className={cx("min-h-[143px] min-w-0 px-6 py-5 text-left mobile:min-h-[104px] tiny:p-3.5", tileColors[i])}
                  to={`/categoria/${slug}`}
                >
                  <span className="grid place-items-center text-[45px]"><Icon /></span>
                  <span>
                    <b className="block font-display text-[23px] font-[550] leading-[normal] text-deep">{categoryNames[slug]}</b>
                    <small className="mt-[5px] block text-[12px] whitespace-normal text-soft-ink">{categoryInfo[slug].tagline}</small>
                  </span>
                  <ArrowRight className="ml-auto w-[18px] text-primary" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Favoritos */}
      <section className="container-shell pt-[70px] pb-[78px] mobile:pt-11 mobile:pb-[50px]">
        <SectionHeading label="PRA FACILITAR SEU DIA" title="Favoritos da família" text="O básico de sempre, pertinho de você.">
          <Link className={textArrow} to="/catalogo">
            Ver catálogo completo <ArrowRight className="w-[18px]" />
          </Link>
        </SectionHeading>
        <ProductGrid items={favorites} />
      </section>

      {/* Faixa final */}
      <section className="bg-deep text-primary-foreground">
        <div className="container-shell flex items-center justify-between gap-[25px] py-[52px] mobile:flex-col mobile:items-start mobile:py-10">
          <div>
            <span className="text-[11px] font-black tracking-[.13em] text-amber">VORA SUPERMARKET</span>
            <h2 className="mt-1.5 font-display text-[34px] font-[550] leading-[normal] mobile:text-[29px]">Sua lista fica mais leve por aqui.</h2>
            <p className="mt-[5px] text-[14px] opacity-90">Mais praticidade para comprar tudo que sua casa precisa.</p>
          </div>
          <Link className={pillLink("light", "md")} to="/catalogo">
            Explorar produtos <ArrowRight />
          </Link>
        </div>
      </section>
    </>
  );
}
