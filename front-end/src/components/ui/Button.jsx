import { cx } from "./styles";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  ghost: "bg-transparent text-foreground hover:text-primary",
  outline: "border border-border bg-background text-foreground shadow-xs hover:bg-accent hover:text-accent-foreground",
};

const sizes = {
  md: "h-9 rounded-md px-4 text-[.875rem]",
  sm: "h-8 rounded-md px-3 text-[.75rem]",
  lg: "h-10 rounded-md px-8 text-[.875rem]",
  icon: "size-9 rounded-md text-[.875rem]",
  iconSm: "size-7 rounded-md text-[.875rem]",
  step: "h-8 w-[27px] rounded-md text-[.875rem]", // botões - e + do seletor de quantidade
  search: "h-[46px] w-[50px] rounded-[0_5px_5px_0] text-[.875rem] mobile:h-[42px]", // lupa da busca
};

export default function Button({ variant = "primary", size = "md", weight = "font-medium", className, type = "button", ...props }) {
  return <button type={type} className={cx(base, variants[variant], sizes[size], weight, className)} {...props} />;
}
