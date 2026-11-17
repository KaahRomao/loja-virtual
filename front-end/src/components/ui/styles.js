// Pedaços de classes Tailwind que se repetem pela loja.
// (Em vez de copiar a mesma string em 10 arquivos, ela mora aqui.)

// junta classes ignorando valores vazios: cx("a", cond && "b") -> "a b"
export const cx = (...classes) => classes.filter(Boolean).join(" ");

// "SELEÇÃO VORA", "CATÁLOGO VORA"... o textinho acima dos títulos
export const eyebrow = "text-[11px] font-black tracking-[.13em] text-primary";

// Links que parecem botões (pílula arredondada, fonte Fredoka)
const pill =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border font-display font-semibold leading-[normal] transition-[background] duration-200";
const pillSize = {
  md: "px-5 py-[10px] text-[15px]",
  lg: "px-[26px] py-[14px] text-[17px]",
};
const pillTone = {
  primary: "border-transparent bg-primary text-primary-foreground hover:bg-deep",
  light: "border-transparent bg-background text-primary",
  outline: "border-border bg-card text-foreground hover:bg-accent",
};
export const pillLink = (tone = "primary", size = "md") => cx(pill, pillSize[size], pillTone[tone]);

// Links de texto
export const crumbLink = "font-bold text-primary hover:underline";
export const textArrow = "inline-flex items-center gap-1.5 font-extrabold text-primary";

// Formulários
export const formLabel = "grid gap-1.5 text-[14px] font-bold";
export const formInput =
  "w-full rounded-[12px] border border-border bg-background px-3.5 py-[11px] aria-invalid:border-destructive";
export const formError = "mt-1.5 text-[13px] font-bold text-destructive";
export const formCard = "grid gap-3.5 rounded-[18px] border border-border bg-card p-5";
export const noteBox = "border border-border bg-surface p-3 text-[12px] leading-[1.5]";

// Cartões brancos do checkout
export const panel = "rounded-[18px] border border-border bg-card p-5";

// ---- Painel administrativo ----
export const adminCard = "overflow-hidden rounded-[7px] border border-border bg-card";
export const adminCardTitle = "flex items-center justify-between px-[23px] py-5";
export const adminCardH2 = "font-display text-[21px] font-medium leading-[normal]";
export const adminTableHead = "bg-surface text-[11px] font-black uppercase text-muted-foreground";
export const adminStat = "flex items-center gap-3 rounded-[6px] border border-border bg-card p-4";
export const adminFilterField =
  "rounded-[4px] border border-border bg-card px-2.5 py-[9px] text-[13px] text-foreground";

// "Etiquetas" coloridas (estoque e situação do pedido)
export const statusPill = "justify-self-start rounded-[20px] px-2.5 py-1 text-[11px] font-extrabold";
export const stockTone = {
  disponivel: "bg-pale text-deep",
  baixo: "bg-amber/25 text-foreground",
  esgotado: "bg-destructive/15 text-destructive",
};
export const orderTone = {
  recebido: "bg-accent text-deep",
  separando: "bg-[oklch(95%_.08_85)] text-[oklch(45%_.12_70)]",
  entrega: "bg-primary text-primary-foreground",
  entregue: "bg-muted text-muted-foreground",
};

// Títulos de seção (Fredoka)
export const sectionTitle =
  "mt-[7px] font-display text-[clamp(29px,3vw,39px)] font-[550] leading-[1.17] text-deep mobile:text-[29px]";
