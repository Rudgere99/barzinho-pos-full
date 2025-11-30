// src/pages/AttendantDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { useBar } from "../context/BarContext";

const PENDING_KEY = "barzinho_pending_by_table";

export default function AttendantDashboard() {
  const { menu, tables, addItemsToTable } = useBar();

  const [selectedTableId, setSelectedTableId] = useState(
    tables[0]?.id ?? ""
  );
  const [activeCat, setActiveCat] = useState("TODOS");

  // === pendências (comanda) por mesa ===
  const [pendingByTable, setPendingByTable] = useState(() => {
    try {
      const raw = localStorage.getItem(PENDING_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    // garante mesa válida quando mesas mudarem
    if (!tables.length) return;
    if (!tables.some((t) => t.id === Number(selectedTableId))) {
      setSelectedTableId(tables[0].id);
    }
  }, [tables, selectedTableId]);

  useEffect(() => {
    try {
      localStorage.setItem(PENDING_KEY, JSON.stringify(pendingByTable));
    } catch {}
  }, [pendingByTable]);

  const pendingItems = pendingByTable[selectedTableId] || [];

  const readyTables = useMemo(
    () =>
      tables.filter((t) => t.currentOrder?.status === "pronto"),
    [tables]
  );

  const categories = useMemo(() => {
    const cats = new Set(menu.map((m) => (m.category || "").toUpperCase()));
    return ["TODOS", ...Array.from(cats)];
  }, [menu]);

  const filteredMenu = useMemo(() => {
    if (activeCat === "TODOS") return menu;
    return menu.filter(
      (m) => (m.category || "").toUpperCase() === activeCat
    );
  }, [menu, activeCat]);

  function addToPending(item, qty) {
    const q = Math.max(1, Number(qty || 1));
    setPendingByTable((prev) => {
      const list = prev[selectedTableId] ? [...prev[selectedTableId]] : [];
      const idx = list.findIndex((i) => i.id === item.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], quantity: list[idx].quantity + q };
      } else {
        list.push({ ...item, quantity: q });
      }
      return { ...prev, [selectedTableId]: list };
    });
  }

  function removePendingItem(index) {
    setPendingByTable((prev) => {
      const list = prev[selectedTableId] ? [...prev[selectedTableId]] : [];
      list.splice(index, 1);
      return { ...prev, [selectedTableId]: list };
    });
  }

  function sendPendingToKitchen() {
    if (!pendingItems.length) return;
    addItemsToTable(Number(selectedTableId), pendingItems);
    setPendingByTable((prev) => ({ ...prev, [selectedTableId]: [] }));
  }

  const pendingTotal = pendingItems.reduce(
    (acc, it) => acc + it.price * it.quantity,
    0
  );

return (
  <div className="attendant-page">
    <header className="attendant-hero">
      <div className="attendant-hero-cover" />

      <div className="attendant-hero-content">
        <div className="attendant-logo-wrapper">
          <img
            src="/Capa.png"
            alt="Barão SLOD"
            className="attendant-logo"
          />
        </div>
      </div>
    </header>

    <h2 className="page-title">Cardápio</h2>
    <p className="page-subtitle">
      Selecione a mesa, monte a comanda e envie para a cozinha.
    </p>



      {/* Notificação simples de pedidos prontos */}
      {readyTables.length > 0 && (
        <div
          className="card"
          style={{
            marginBottom: "1rem",
            borderLeft: "4px solid #16a34a",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div>
            <strong>Pedidos prontos:</strong>{" "}
            {readyTables.map((t) => `Mesa ${t.id}`).join(", ")}
          </div>
          <span style={{ fontSize: ".85rem", color: "var(--text-muted)" }}>
            Retire na cozinha
          </span>
        </div>
      )}

      {/* Topo: mesa à direita */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "0.8rem",
        }}
      >
        <div style={{ fontSize: ".9rem", color: "var(--text-muted)" }}>
          Mesa atual
        </div>
        <select
          className="select-basic"
          style={{ maxWidth: 260, marginLeft: "auto" }}
          value={selectedTableId}
          onChange={(e) => setSelectedTableId(e.target.value)}
        >
          {tables.map((t) => (
            <option key={t.id} value={t.id}>
              Mesa {t.id}
            </option>
          ))}
        </select>
      </div>

      {/* Abas */}
      <div className="role-tabs" style={{ marginTop: 0 }}>
        {categories.map((cat) => (
          <div
            key={cat}
            className={`role-tab ${activeCat === cat ? "active" : ""}`}
            onClick={() => setActiveCat(cat)}
          >
            {cat}
          </div>
        ))}
      </div>

      {/* Layout 2 colunas: cardápio + comanda */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          gap: "14px",
        }}
      >
        {/* Lista do cardápio */}
        <div style={{ display: "grid", gap: "12px" }}>
          {filteredMenu.map((item) => (
            <div key={item.id} className="menu-item-row">
              <div className="menu-item-left">
                <div className="menu-thumb">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} />
                  ) : (
                    <span className="menu-thumb-empty">sem foto</span>
                  )}
                </div>

                <div className="menu-info">
                  <div className="menu-info-top">
                    <div className="menu-name">{item.name}</div>
                    <span className="menu-category">
                      {(item.category || "").toUpperCase()}
                    </span>
                  </div>
                  {item.description && (
                    <p className="menu-desc">{item.description}</p>
                  )}
                </div>
              </div>

              <div className="menu-item-right">
                <strong className="menu-price">
                  R$ {Number(item.price).toFixed(2)}
                </strong>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "6px",
                    alignItems: "center",
                  }}
                >
                  <input
                    className="input-text"
                    style={{ width: 80 }}
                    type="number"
                    min="1"
                    defaultValue={1}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const qty = e.currentTarget.value;
                        addToPending(item, qty);
                        e.currentTarget.value = 1;
                      }
                    }}
                  />
                  <button
                    className="btn-primary"
                    onClick={(e) => {
                      const qtyInput =
                        e.currentTarget.parentElement.querySelector("input");
                      addToPending(item, qtyInput?.value);
                      if (qtyInput) qtyInput.value = 1;
                    }}
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!filteredMenu.length && (
            <div className="card" style={{ color: "var(--text-muted)" }}>
              Nenhum item nessa categoria.
            </div>
          )}
        </div>

        {/* Comanda / pendências */}
        <div className="card" style={{ height: "fit-content" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: ".5rem",
            }}
          >
            <strong>Mesa {selectedTableId}</strong>
            <span style={{ fontSize: ".85rem", color: "var(--text-muted)" }}>
              Comanda
            </span>
          </div>

          {pendingItems.length === 0 ? (
            <p style={{ fontSize: ".9rem", color: "var(--text-muted)" }}>
              Nenhum item adicionado.
            </p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {pendingItems.map((it, idx) => (
                <li
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: ".35rem 0",
                    borderBottom: "1px solid var(--surface-2)",
                    fontSize: ".9rem",
                  }}
                >
                  <div style={{ display: "flex", gap: ".4rem" }}>
                    <span className="table-item-qty">{it.quantity}x</span>
                    <span>{it.name}</span>
                  </div>

                  <div style={{ display: "flex", gap: ".4rem", alignItems: "center" }}>
                    <strong>
                      R$ {(it.price * it.quantity).toFixed(2)}
                    </strong>
                    <button
                      className="btn-danger-outline"
                      onClick={() => removePendingItem(idx)}
                    >
                      Remover
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div
            style={{
              marginTop: ".6rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: ".95rem",
            }}
          >
            <span>Total</span>
            <strong>R$ {pendingTotal.toFixed(2)}</strong>
          </div>

          <button
            className="btn-primary"
            style={{ width: "100%", marginTop: ".7rem" }}
            onClick={sendPendingToKitchen}
            disabled={!pendingItems.length}
          >
            Enviar para cozinha
          </button>
        </div>
      </div>

      {/* responsivo: 1 coluna */}
      <style>{`
        @media (max-width: 900px){
          .attendant-page > div[style*="grid-template-columns"]{
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}