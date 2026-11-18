import { useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { camposDePreco } from "../../data/products";
import AdminHeading from "../../components/AdminHeading";
import ProductPhoto from "../../components/ProductPhoto";
import Button from "../../components/ui/Button";
import { cx, formCard, formError, formInput, formLabel, pillLink } from "../../components/ui/styles";

// id = "novo" cadastra um produto; qualquer outro número edita o produto existente
export default function AdminProductEdit({ id }) {
  const { rows, categories, saveProduct } = useOutletContext();
  const navigate = useNavigate();
  const isNew = id === "novo";
  const row = isNew ? null : rows.find((r) => r.id === Number(id));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: row?.name || "",
    unit: row?.unit || "",
    category: String(row?.categoryId ?? categories[0]?.id ?? ""),
    imageUrl: row?.imageUrl || "",
    price: row ? row.price.toFixed(2) : "",
    oldPrice: row?.oldPrice ? row.oldPrice.toFixed(2) : "",
    stock: row ? String(row.stock) : "",
    description: row?.description || "",
    active: row ? row.active : true,
  });

  if (!isNew && !row) {
    return <AdminHeading eyebrow="PRODUTO" title="Produto não encontrado" text="Volte para a lista de produtos." />;
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim()) return setError("Informe o nome e a descrição.");
    if (!form.category) return setError("Selecione uma categoria.");
    setError("");
    setBusy(true);
    try {
      await saveProduct(row?.id, {
        ...camposDePreco(form.price.trim(), form.oldPrice.trim(), form.stock.trim()),
        nome_produto: form.name.trim(),
        unidade: form.unit.trim(),
        id_categoria: Number(form.category),
        img_url: form.imageUrl.trim(),
        descricao: form.description.trim(),
        situacao: form.active ? "Ativo" : "Inativo",
      });
      navigate("/admin/produtos");
    } catch (erro) {
      setError(erro.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AdminHeading
        eyebrow={isNew ? "NOVO" : `#${String(row.id).padStart(3, "0")}`}
        title={isNew ? "Novo produto" : "Editar produto"}
        text={isNew ? "Cadastre um item no catálogo." : row.name}
      />
      <form className={cx(formCard, "max-w-[720px]")} noValidate onSubmit={submit}>
        {row && (
          <div className="size-[110px] overflow-hidden rounded-[14px]">
            <ProductPhoto product={row} />
          </div>
        )}
        <label className={formLabel}>Nome do produto<input className={formInput} maxLength={48} value={form.name} onChange={set("name")} /></label>
        <div className="grid grid-cols-[1fr_1fr] gap-3 mobile:grid-cols-[1fr]">
          <label className={formLabel}>Embalagem<input className={formInput} placeholder="Pacote 1 kg" value={form.unit} onChange={set("unit")} /></label>
          <label className={formLabel}>
            Categoria
            <select className={formInput} value={form.category} onChange={set("category")}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.nome_categoria}</option>)}
            </select>
          </label>
        </div>
        <div className="grid grid-cols-[repeat(3,1fr)] gap-3 mobile:grid-cols-[1fr]">
          <label className={formLabel}>Preço atual (R$)<input className={formInput} inputMode="decimal" value={form.price} onChange={set("price")} /></label>
          <label className={formLabel}>Preço "de" (R$)<input className={formInput} inputMode="decimal" placeholder="Sem oferta" value={form.oldPrice} onChange={set("oldPrice")} /></label>
          <label className={formLabel}>Estoque (un.)<input className={formInput} inputMode="numeric" value={form.stock} onChange={set("stock")} /></label>
        </div>
        <label className={formLabel}>Imagem (URL opcional)<input className={formInput} value={form.imageUrl} onChange={set("imageUrl")} /></label>
        <label className={formLabel}>Descrição<textarea className={formInput} rows={3} value={form.description} onChange={set("description")} /></label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.active} onChange={set("active")} /> Mostrar na loja</label>
        {error && <p className={formError}>{error}</p>}
        <div className="mt-1.5 flex flex-wrap justify-between gap-2.5">
          <Link className={pillLink("outline", "md")} to="/admin/produtos">Cancelar</Link>
          <Button type="submit" size="lg" disabled={busy}>{busy ? "Salvando…" : isNew ? "Cadastrar produto" : "Salvar alterações"}</Button>
        </div>
      </form>
    </>
  );
}
