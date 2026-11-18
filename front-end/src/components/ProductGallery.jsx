import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { productImages } from "../data/productImages";
import ProductPhoto from "./ProductPhoto";
import Button from "./ui/Button";
import { cx } from "./ui/styles";

export default function ProductGallery({ product }) {
  const photos = productImages(product);
  const [active, setActive] = useState(0);
  const track = useRef(null);
  const dialog = useRef(null);

  function select(index) {
    const strip = track.current;
    strip.scrollTo({ left: index * strip.clientWidth, behavior: "instant" });
    setActive(index);
  }

  return (
    <div className="grid min-w-0 grid-cols-[64px_minmax(0,1fr)] items-start gap-3 mobile:flex mobile:flex-col">
      {photos.length > 1 && (
        <div aria-label="Fotos do produto" className="flex flex-col gap-2 mobile:order-2 mobile:flex-row">
          {photos.map((photo, index) => (
            <button
              key={photo.url}
              type="button"
              aria-label={"Mostrar foto " + (index + 1) + " de " + photos.length}
              aria-pressed={active === index}
              onClick={() => select(index)}
              className={cx("size-16 overflow-hidden rounded-control border bg-cream mobile:size-12", active === index && "border-primary ring-1 ring-primary")}
            >
              <ProductPhoto product={product} photo={photo} />
            </button>
          ))}
        </div>
      )}

      <div className={cx("relative min-w-0 overflow-hidden rounded-card border bg-cream mobile:w-full", photos.length < 2 && "col-span-full")}>
        {photos.length > 0 ? (
          <>
            <div
              ref={track}
              className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
              onScroll={(event) => {
                const strip = event.currentTarget;
                if (strip.clientWidth) {
                  setActive(Math.max(0, Math.min(photos.length - 1, Math.round(strip.scrollLeft / strip.clientWidth))));
                }
              }}
            >
              {photos.map((photo, index) => (
                <div key={photo.url} className="aspect-[4/3] w-full shrink-0 snap-start mobile:aspect-[5/4]">
                  <ProductPhoto product={product} photo={photo} eager={index === 0} />
                </div>
              ))}
            </div>
            <Button variant="outline" size="icon" aria-label="Ampliar foto do produto" className="absolute top-3 right-3 rounded-full bg-card text-deep" onClick={() => dialog.current.showModal()}>
              <Maximize2 size={18} />
            </Button>
            {photos.length > 1 && (
              <span aria-live="polite" className="pointer-events-none absolute right-3 bottom-3 rounded-full bg-card px-2.5 py-1 text-xs font-black text-deep">
                {active + 1} / {photos.length}
              </span>
            )}
            <dialog
              ref={dialog}
              aria-label={"Fotos ampliadas de " + product.name}
              className="fixed inset-0 m-auto w-[min(94vw,680px)] overflow-hidden rounded-card bg-card p-3 shadow-xl backdrop:bg-black/70"
              onClick={(event) => { if (event.target === event.currentTarget) dialog.current.close(); }}
            >
              <div className="relative">
                <div className="h-[min(72vh,620px)]">
                  <ProductPhoto product={product} photo={photos[active]} eager />
                </div>
                <Button variant="outline" size="icon" aria-label="Fechar foto ampliada" className="absolute top-2 right-2 rounded-full bg-card" onClick={() => dialog.current.close()}>
                  <X size={19} />
                </Button>
                {photos.length > 1 && (
                  <div className="mt-2 flex items-center justify-center gap-3">
                    <Button variant="outline" size="icon" aria-label="Foto anterior" disabled={active === 0} onClick={() => select(active - 1)}><ChevronLeft size={19} /></Button>
                    <span aria-live="polite" className="text-sm font-bold">{active + 1} / {photos.length}</span>
                    <Button variant="outline" size="icon" aria-label="Próxima foto" disabled={active === photos.length - 1} onClick={() => select(active + 1)}><ChevronRight size={19} /></Button>
                  </div>
                )}
              </div>
            </dialog>
          </>
        ) : (
          <div className="aspect-[4/3]"><ProductPhoto product={product} /></div>
        )}
      </div>
      {photos.some((photo) => photo.illustrative) && <p className="col-span-full text-xs text-muted-foreground mobile:order-3">Fotos ilustrativas.</p>}
    </div>
  );
}
