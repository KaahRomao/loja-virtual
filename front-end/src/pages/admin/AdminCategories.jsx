import { useState } from "react";
import { Carrot, Cookie, SprayCan, Pencil } from "lucide-react";
import { useStore } from "../../hooks/useStore";
import AdminHeading from "../../components/AdminHeading";
import Button from "../../components/ui/Button";
import { adminCard, adminCardH2, adminCardTitle, adminTableHead, cx } from "../../components/ui/styles";

const icons = { comida: Carrot, snacks: Cookie, limpeza: SprayCan };
const cols = "grid grid-cols-[1fr_170px_110px] items-center gap-5 px-[23px] py-[13px] mobile:grid-cols-[1fr_96px]";

export default function AdminCategories() {
  const { categoryNames, setCategoryNames, rows } = useStore();
  const [editing, setEditing] = useState(null);
  const [value, setValue] = useState("");

  const save = (slug) => {
    if (value.trim()) setCategoryNames((c) => ({ ...c, [slug]: value.trim() }));
    setEditing(null);
  };

  return (
    <>
      <AdminHeading eyebrow="GERENCIAMENTO" title="Categorias" text="Organize as seções do catálogo VORA." />
      <div className={adminCard}>
        <div className={adminCardTitle}>
          <h2 className={adminCardH2}>Categorias cadastradas</h2>
          <span className="text-[12px] text-muted-foreground mobile:hidden">Alterações visíveis somente nesta visita</span>
        </div>
        <div className={cx(cols, adminTableHead, "mobile:[&>:nth-child(2)]:hidden")}>
          <span>Categoria</span><span>Produtos</span><span>Ações</span>
        </div>
        {Object.entries(categoryNames).map(([slug, name]) => {
          const Icon = icons[slug];
          return (
            <div className={cx(cols, "min-h-[77px] border-t border-border")} key={slug}>
              <div className="flex items-center gap-3">
                <span className="grid size-[42px] place-items-center rounded-[5px] bg-pale text-[24px]"><Icon /></span>
                {editing === slug ? (
                  <input autoFocus value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && save(slug)} />
                ) : (
                  <span>
                    <b className="block">{name}</b>
                    <small className="block text-[12px] text-muted-foreground">/{slug}</small>
                  </span>
                )}
              </div>
              <span className="text-[12px] text-muted-foreground mobile:hidden">{rows.filter((r) => r.category === slug).length} produtos</span>
              {editing === slug ? (
                <Button size="sm" onClick={() => save(slug)}>Salvar</Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => { setEditing(slug); setValue(name); }}>
                  <Pencil size={16} /> Editar
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
