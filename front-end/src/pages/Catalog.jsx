import { useState } from "react";
import { SlidersHorizontal, Search } from "lucide-react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import ProductGrid from "../components/ProductGrid";
import { discountPercent } from "../data/products";
import { useStore } from "../hooks/useStore";
import { cx, formInput, pillLink, sectionTitle } from "../components/ui/styles";

const normalize = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function Catalog({ category }) {
  const { categoryNames, products, categorySlugs } = useStore();
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const offers = params.get("ofertas") === "true";
  const q = params.get("q") || "";
  const [sort, setSort] = useState("featured");
  const [maxPrice, setMaxPrice] = useState("");

  let list = products.filter(
    (p) =>
      (!category || p.category === category) &&
      (!offers || (discountPercent(p) > 0 && p.stock > 0)) &&
      (maxPrice === "" || p.price <= Number(maxPrice)) &&
      (!q || normalize(p.name).includes(normalize(q))),
  );
  if (sort === "lowest") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "highest") list = [...list].sort((a, b) => b.price - a.price);
  if (sort === "discount") list = [...list].sort((a, b) => discountPercent(b) - discountPercent(a));

  const title = q
    ? `Resultados para “${q}”`
    : offers
      ? "Ofertas da semana"
      : category
        ? categoryNames[category]
        : "Tudo para sua lista";
  const allActive = pathname === "/catalogo" && !offers;
  const filters = [
    {
      to: "/catalogo",
      label: "Todos os produtos",
      count: products.length,
      active: allActive,
    },
    ...categorySlugs.map((slug) => ({
      to: `/categoria/${slug}`,
      label: categoryNames[slug],
      count: products.filter((p) => p.category === slug).length,
      active: category === slug,
    })),
    {
      to: "/catalogo?ofertas=true",
      label: "Ofertas",
      count: products.filter((p) => discountPercent(p) > 0 && p.stock > 0).length,
      active: offers,
    },
  ];

  return (
    <section className="container-shell min-h-[620px] pb-[90px]">
      <div className="flex items-center gap-[9px] pt-6 text-[12px] text-muted-foreground">
        <Link className="hover:underline" to="/">
          Início
        </Link>
        <span>
          <span>/</span>{" "}
          {category ? categoryNames[category] : "Todos os produtos"}
        </span>
      </div>

      <div className="mt-[42px] mb-[35px] mobile:my-[30px]">
        <div>
          <h1 className={sectionTitle}>{title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-[222px_minmax(0,1fr)] gap-8 mobile:block">
        <aside className="self-start border-t-2 border-primary pt-5 mobile:mb-[17px] mobile:border-t-0 mobile:p-0">
          <h2 className="mb-[17px] flex items-center gap-[9px] font-display text-[18px] font-medium leading-[normal] mobile:hidden">
            <SlidersHorizontal size={18} /> Categorias
          </h2>
          <div className="grid gap-[5px] mobile:flex mobile:gap-1.5 mobile:overflow-x-auto mobile:pb-[5px]">
            {filters.map((f) => (
              <Link
                key={f.to}
                className={cx(
                  "flex items-center justify-between rounded-[10px] px-3 py-2 text-[14px] font-bold hover:bg-accent mobile:flex-none mobile:gap-2",
                  f.active ? "bg-accent text-primary" : "text-foreground",
                )}
                to={f.to}
                aria-current={f.active ? "page" : undefined}
              >
                {f.label}{" "}
                <span className="text-[11px] text-muted-foreground">
                  {f.count}
                </span>
              </Link>
            ))}
          </div>
          <label className="mt-4 grid max-w-48 gap-1.5 text-sm font-extrabold text-deep mobile:mt-2">
            Preço até (R$)
            <input className={formInput} type="number" inputMode="decimal" min="0" step="0.01" placeholder="Sem limite" value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)} />
          </label>
        </aside>

        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b pb-3 text-[13px]">
            <span>
              <b>{list.length}</b> {list.length === 1 ? "produto" : "produtos"}
            </span>
            <label className="flex items-center gap-2.5 text-muted-foreground">
              Ordenar por{" "}
              <select
                className="rounded-control border bg-card px-2.5 py-[9px] text-foreground"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="featured">Destaques</option>
                <option value="lowest">Menor preço</option>
                <option value="highest">Maior preço</option>
                <option value="discount">Maior desconto</option>
              </select>
            </label>
          </div>

          {list.length ? (
            <ProductGrid items={list} catalog />
          ) : (
            <div className="px-[15px] py-[70px] text-center text-muted-foreground">
              <Search size={36} className="mx-auto text-primary" />
              <h2 className="mt-[15px] font-display text-[24px] font-medium leading-[normal] text-deep">
                {offers && !q && !maxPrice ? "Nenhuma oferta ativa no momento." : "Não achamos isso por aqui."}
              </h2>
              <p className="mt-2 mb-6">
                Confira se o nome está certinho ou experimente uma destas
                categorias:
              </p>
              <div className="mb-3.5 flex flex-wrap justify-center gap-2">
                {categorySlugs.map((slug) => (
                  <Link
                    key={slug}
                    className={pillLink("outline", "md")}
                    to={`/categoria/${slug}`}
                  >
                    {categoryNames[slug]}
                  </Link>
                ))}
              </div>
              <Link className={pillLink("primary", "md")} to="/catalogo">
                Ver todos os produtos
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
