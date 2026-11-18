import { cx } from "./styles";

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-control transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const variants = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  ghost: "bg-transparent text-foreground hover:text-primary",
  outline: "border border-border bg-background text-foreground shadow-xs hover:bg-accent hover:text-accent-foreground",
};

const sizes = {
  md: "min-h-10 px-4 text-sm",
  sm: "min-h-9 px-3 text-xs",
  lg: "min-h-11 px-5 text-sm",
  icon: "size-11",
  iconSm: "size-9",
  step: "size-9 text-sm",
  search: "h-full w-12 rounded-l-none text-sm",
};

export default function Button({ variant = "primary", size = "md", weight = "font-extrabold", className, type = "button", ...props }) {
  return <button type={type} className={cx(base, variants[variant], sizes[size], weight, className)} {...props} />;
}
