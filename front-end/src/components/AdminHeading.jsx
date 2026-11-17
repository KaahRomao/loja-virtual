import { eyebrow, sectionTitle } from "./ui/styles";

// Título no topo de cada página do painel
export default function AdminHeading({ eyebrow: label, title, text, children }) {
  return (
    <div className="mt-[42px] mb-[22px] flex flex-wrap items-end justify-between gap-3.5 mobile:mt-[30px]">
      <div>
        <span className={eyebrow}>{label}</span>
        <h1 className={sectionTitle}>{title}</h1>
        <p className="mt-[7px] text-[14px] text-muted-foreground">{text}</p>
      </div>
      {children}
    </div>
  );
}
