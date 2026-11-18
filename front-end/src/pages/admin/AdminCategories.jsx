import { useState } from "react";
import { Grid2x2, Pencil, Trash2 } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import AdminHeading from "../../components/AdminHeading";
import Button from "../../components/ui/Button";
import { adminCard, adminCardH2, adminCardTitle, formError, formInput } from "../../components/ui/styles";

export default function AdminCategories() {
  const { categories, rows, saveCategory, deleteCategory } = useOutletContext();
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [archived, setArchived] = useState(false);
  const visibleCategories = categories.filter((c) => archived ? c.status === 0 : c.status === 1);

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

  async function mudarVisibilidade(categoria) {
    const excluir = categoria.status === 1;
    if (excluir && !window.confirm(`Excluir "${categoria.nome_categoria}" da loja?`)) return;
    setBusy(true);
    setError("");
    try {
      if (excluir) await deleteCategory(categoria.id);
      else await saveCategory(categoria.id, { status: 1 });
      if (editing === categoria.id) {
        setEditing(null);
        setName("");
      }
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
        <div className={adminCardTitle}>
          <h2 className={adminCardH2}>{archived ? "Categorias excluídas" : "Categorias cadastradas"}</h2>
          <Button variant="outline" size="sm" onClick={() => { setArchived(!archived); setError(""); }}>
            {archived ? "Ver ativas" : "Ver excluídas"}
          </Button>
        </div>
        {visibleCategories.map((c) => (
          <div className="flex flex-wrap items-center gap-3 border-t border-border px-5 py-3" key={c.id}>
            <Grid2x2 size={20} className="text-primary" />
            <b>{c.nome_categoria}</b>
            <span className="grow text-sm text-muted-foreground">{rows.filter((r) => r.active && r.categoryId === c.id).length} ativos</span>
            <Button variant="outline" size="sm" disabled={busy} onClick={() => { setEditing(c.id); setName(c.nome_categoria); }}>
              <Pencil size={16} /> Editar
            </Button>
            <Button variant="outline" className={c.status === 1 ? "text-destructive" : ""} size="sm"
              disabled={busy} onClick={() => mudarVisibilidade(c)}>
              {c.status === 1 ? <><Trash2 size={16} /> Excluir</> : "Restaurar"}
            </Button>
          </div>
        ))}
        {!visibleCategories.length && <p className="px-5 py-4 text-muted-foreground">Nenhuma categoria {archived ? "excluída" : "ativa"}.</p>}
        {error && <p className={`${formError} mx-5 mt-4`} role="alert">{error}</p>}
        <form className="grid gap-2 px-5 py-4" onSubmit={salvar}>
          <label htmlFor="nome-categoria"><b>{editing ? "Editar categoria" : "Nova categoria"}</b></label>
          <div className="flex flex-wrap gap-2">
            <input id="nome-categoria" className={formInput} value={name} onChange={(e) => setName(e.target.value)} />
            <Button type="submit" disabled={busy}>{busy ? "Salvando…" : "Salvar"}</Button>
            {editing && <Button variant="outline" onClick={() => { setEditing(null); setName(""); }}>Cancelar</Button>}
          </div>
        </form>
      </div>
    </>
  );
}
