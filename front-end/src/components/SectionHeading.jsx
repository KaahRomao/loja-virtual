import { eyebrow, sectionTitle, cx } from "./ui/styles";

// Cabeçalho de cada seção da Home: "SELEÇÃO VORA" + título + frase + link à direita
export default function SectionHeading({ label, title, text, className = "mb-[29px]", children }) {
  return (
    <div className={cx("flex items-end justify-between gap-[25px] mobile:items-start mobile:gap-[15px]", className)}>
      <div>
        <span className={eyebrow}>{label}</span>
        <h2 className={sectionTitle}>{title}</h2>
        {text && <p className="mt-[7px] text-[14px] text-muted-foreground">{text}</p>}
      </div>
      {children}
    </div>
  );
}
