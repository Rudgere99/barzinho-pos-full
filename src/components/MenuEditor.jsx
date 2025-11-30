
// src/components/MenuEditor.jsx
import { useEffect, useMemo, useState } from "react";
import "../cardapio.css";

/**
 * MenuEditor
 * - suporta imagem LOCAL (file input) -> salva como base64 no item.imageUrl
 * - categorias expandidas
 * - lista do "Cardápio atual" no mesmo formato do atendente
 */
const CATEGORIES = ["Bebida", "Comida", "Sobremesa", "Drinks", "Outros"];

export default function MenuEditor({ menu, onAdd, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    category: "Bebida",
    price: "",
    description: "",
    imageUrl: "",          // base64 (data URL)
  });

  // popula form quando clica em editar
  useEffect(() => {
    if (!editingId) return;
    const item = menu.find(m => m.id === editingId);
    if (!item) return;
    setForm({
      name: item.name || "",
      category: item.category || "Bebida",
      price: item.price ?? "",
      description: item.description || "",
      imageUrl: item.imageUrl || "",
    });
  }, [editingId, menu]);

  const handleChange = (key, value) =>
    setForm(prev => ({ ...prev, [key]: value }));

  // imagem local -> converte pra base64
  const handleFile = (file) => {
    if (!file) return handleChange("imageUrl", "");
    const reader = new FileReader();
    reader.onload = () => handleChange("imageUrl", reader.result);
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: "",
      category: "Bebida",
      price: "",
      description: "",
      imageUrl: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return;

    const payload = {
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      description: form.description.trim(),
      imageUrl: form.imageUrl || "",
    };

    if (editingId) {
      onUpdate(editingId, payload);
    } else {
      onAdd(payload);
    }
    resetForm();
  };

  const sortedMenu = useMemo(() => {
    const arr = [...menu];
    arr.sort((a,b) => {
      if (a.category === b.category) return a.name.localeCompare(b.name);
      return a.category.localeCompare(b.category);
    });
    return arr;
  }, [menu]);

  return (
    <div className="menu-editor">
      {/* FORM */}
      <form className="menu-form" onSubmit={handleSubmit}>
        <h4>{editingId ? "Editar item" : "Novo item de cardápio"}</h4>

        <label>Nome</label>
        <input
          type="text"
          placeholder="Ex: Chop"
          value={form.name}
          onChange={(e)=>handleChange("name", e.target.value)}
        />

        <div className="menu-form-row">
          <div>
            <label>Categoria</label>
            <select
              value={form.category}
              onChange={(e)=>handleChange("category", e.target.value)}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label>Preço</label>
            <input
              type="number"
              step="0.01"
              placeholder="Ex: 19.90"
              value={form.price}
              onChange={(e)=>handleChange("price", e.target.value)}
            />
          </div>
        </div>

        <label>Imagem (local)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e)=>handleFile(e.target.files?.[0])}
        />

        {form.imageUrl && (
          <div className="menu-preview">
            <img src={form.imageUrl} alt="preview" />
          </div>
        )}

        <label>Descrição</label>
        <textarea
          placeholder="Descrição do item"
          value={form.description}
          onChange={(e)=>handleChange("description", e.target.value)}
        />

        <div style={{display:"flex", gap:8}}>
          <button className="btn-add" type="submit">
            {editingId ? "Salvar" : "Adicionar"}
          </button>

          {editingId && (
            <button
              type="button"
              className="menu-btn"
              onClick={resetForm}
            >
              Cancelar edição
            </button>
          )}
        </div>
      </form>

      {/* LISTA ATUAL */}
      <div>
        <h4 style={{margin:"0 0 10px"}}>Cardápio atual</h4>

        {sortedMenu.length === 0 && (
          <div className="menu-empty">Nenhum item no cardápio.</div>
        )}

        {sortedMenu.length > 0 && (
          <ul className="menu-items">
            {sortedMenu.map((item)=>(
              <li key={item.id} className="menu-item-row">
                <div className="menu-item-left">
                  <div className="menu-thumb">
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.name} />
                      : <span className="menu-thumb-empty">Sem foto</span>}
                  </div>

                  <div className="menu-info">
                    <div className="menu-meta">
                      <span className="menu-name">{item.name}</span>
                      <span className="menu-category">{item.category}</span>
                    </div>
                    {item.description && (
                      <p className="menu-desc">{item.description}</p>
                    )}
                  </div>
                </div>

                <div className="menu-item-right">
                  <span className="menu-price">
                    R$ {Number(item.price || 0).toFixed(2)}
                  </span>

                  <div className="menu-actions">
                    <button
                      type="button"
                      className="menu-btn"
                      onClick={()=>setEditingId(item.id)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="menu-btn menu-btn-danger"
                      onClick={()=>onDelete(item.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
