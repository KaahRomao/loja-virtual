import { useState } from "react";
import { Grid2x2, Pencil } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import AdminHeading from "../../components/AdminHeading";
import Button from "../../components/ui/Button";
import { adminCard, adminCardH2, adminCardTitle, formError, formInput } from "../../components/ui/styles";

export default function AdminCategories() {
  const { categories, rows, saveCategory } = useOutletContext();
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function salvar(e) {
    e.preventDefault();
    if (!name.trim()) return setError("Informe o nome da categoria.");
    setBusy(true);
    setError("");
    try {
      await saveCategory(editing, { nome_categoria: name.trim() });
      setEditing(null);
      setName("");
    } catch (erro) {
      setError(erro.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <AdminHeading eyebrow="GERENCIAMENTO" title="Categorias" text="Organize as seções do catálogo VORA." />
      <div className={adminCard}>
        <div className={adminCardTitle}><h2 className={adminCardH2}>Categorias cadastradas</h2></div>
        {categories.map((c) => (
          <div className="flex flex-wrap items-center gap-3 border-t border-border px-5 py-3" key={c.id}>
            <Grid2x2 size={20} className="text-primary" />
            <b>{c.nome_categoria}</b>
            <span className="grow text-sm text-muted-foreground">{rows.filter((r) => r.categoryId === c.id).length} produtos</span>
            <Button variant="outline" size="sm" onClick={() => { setEditing(c.id); setName(c.nome_categoria); }}>
              <Pencil size={16} /> Editar
            </Button>
          </div>
        ))}
        <form className="grid gap-2 px-5 py-4" onSubmit={salvar}>
          <label htmlFor="nome-categoria"><b>{editing ? "Editar categoria" : "Nova categoria"}</b></label>
          <div className="flex flex-wrap gap-2">
            <input id="nome-categoria" className={formInput} value={name} onChange={(e) => setName(e.target.value)} />
            <Button type="submit" disabled={busy}>{busy ? "Salvando…" : "Salvar"}</Button>
            {editing && <Button variant="outline" onClick={() => { setEditing(null); setName(""); }}>Cancelar</Button>}
          </div>
          {error && <p className={formError} role="alert">{error}</p>}
        </form>
      </div>
    </>
  );
}
