import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { discountPercent, formatPrice } from "../data/products";
import { heroImage } from "../assets";
import ProductPhoto from "./ProductPhoto";
import { pillLink } from "./ui/styles";

export default function PromotionCarousel({ offers }) {
  const slides = offers.slice(0, 4);
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [mouseInside, setMouseInside] = useState(false);
  const [focusInside, setFocusInside] = useState(false);
  const running = count > 1 && !paused && !mouseInside && !focusInside;
  const active = count ? index % count : 0;
  const product = slides[active];
  const discount = product ? discountPercent(product) : 0;

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % count), 6500);
    return () => window.clearInterval(timer);
  }, [count, running]);

  function move(delta) {
    setIndex((active + delta + count) % count);
  }

  return (
    <section
      aria-label="Promoções da Vora"
      aria-roledescription={count > 1 ? "carrossel" : undefined}
      className="bg-cream py-4 mobile:py-3"
      onMouseEnter={() => setMouseInside(true)}
      onMouseLeave={() => setMouseInside(false)}
      onFocusCapture={() => setFocusInside(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocusInside(false);
      }}
    >
      <div className="container-shell overflow-hidden rounded-[20px] border bg-pale">
        <div
          aria-live={running ? "off" : "polite"}
          className="grid min-h-[340px] grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-stretch mobile:min-h-0 mobile:grid-cols-1"
        >
          <div className="flex min-w-0 flex-col justify-center px-[clamp(20px,4vw,52px)] py-8 mobile:py-6">
            {product ? (
              <>
                <span className="inline-flex items-center gap-1.5 text-xs font-black tracking-wide text-primary uppercase">
                  <Tag size={16} aria-hidden="true" /> Ofertas da Vora
                </span>
                <h1 className="mt-2 max-w-xl font-display text-[clamp(30px,4.35vw,55px)] font-semibold leading-[1.06] text-deep">{product.name}</h1>
                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <strong className="font-display text-4xl leading-none font-semibold text-deep mobile:text-3xl">{formatPrice(product.price)}</strong>
                  <del className="text-sm text-muted-foreground">{formatPrice(product.oldPrice)}</del>
                  <span className="rounded-full bg-destructive px-2.5 py-1 text-xs font-extrabold text-white">
                    {discount < 1 ? "<1% de desconto" : "−" + Math.floor(discount) + "%"}
                  </span>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link className={pillLink("primary")} to={"/produto/" + product.id}>Ver produto <ArrowRight size={17} /></Link>
                  <Link className={pillLink("outline")} to="/catalogo?ofertas=true">Todas as ofertas</Link>
                </div>
              </>
            ) : (
              <>
                <h1 className="font-display text-[clamp(34px,5vw,59px)] font-semibold leading-none text-deep">Seu mercado online</h1>
                <p className="mt-3 max-w-xs text-sm text-deep">Escolha os produtos e calcule a entrega pelo CEP.</p>
                <div className="mt-5"><Link className={pillLink("primary")} to="/catalogo">Ver catálogo <ArrowRight size={17} /></Link></div>
              </>
            )}
          </div>
          {product ? (
            <div className="min-h-0 bg-cream mobile:order-first mobile:h-[205px]">
              <ProductPhoto product={product} eager />
            </div>
          ) : (
            <img src={heroImage} alt="" className="size-full object-cover object-right mobile:order-first mobile:h-[205px]" fetchPriority="high" />
          )}
        </div>
        {count > 1 && (
          <div className="flex items-center justify-between gap-2 border-t bg-card px-4 py-1.5" aria-label="Controles das promoções">
            <div className="flex items-center">
              <button type="button" className="grid size-10 place-items-center rounded-control text-primary hover:bg-accent" aria-label="Promoção anterior" onClick={() => move(-1)}><ArrowLeft size={18} /></button>
              <span className="px-2 text-xs font-bold text-muted-foreground">{active + 1} de {count}</span>
              <button type="button" className="grid size-10 place-items-center rounded-control text-primary hover:bg-accent" aria-label="Próxima promoção" onClick={() => move(1)}><ArrowRight size={18} /></button>
            </div>
            <button type="button" className="grid size-10 place-items-center rounded-control text-primary hover:bg-accent"
              aria-label={paused ? "Retomar rotação das promoções" : "Pausar rotação das promoções"} onClick={() => setPaused(!paused)}>
              {paused ? <Play size={17} /> : <Pause size={17} />}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
