// src/pages/ManagerTablesSection.jsx
import { useState } from "react";
import { useBar } from "../context/BarContext";

function statusLabel(status) {
  if (status === "livre") return "LIVRE";
  if (status === "aberta") return "ABERTA";
  if (status === "pagamento") return "PAGAMENTO";
  return status;
}

export default function ManagerTablesSection() {
  const {
    tables,
    addTable,
    removeTable,
    cancelItemFromTable,
    sendTableToPayment,
    closeTable,
  } = useBar();

  const [newTable, setNewTable] = useState("");
  const [paymentByTable, setPaymentByTable] = useState({});

  const handleAddTable = () => {
    if (!newTable.trim()) return;
    addTable(newTable.trim());
    setNewTable("");
  };

  const handlePaymentChange = (tableId, method) => {
    setPaymentByTable((prev) => ({ ...prev, [tableId]: method }));
  };

  return (
    <>
      {/* GESTÃO DE MESAS */}
      <section className="role-section">
        <h3 className="role-section-title">Gestão de mesas</h3>

        <div className="role-grid">
          {/* Criar mesa */}
          <div className="card">
            <div className="role-section-description">
              Novo número de mesa
            </div>

            <div className="form-row">
              <input
                className="input-text"
                placeholder="Ex: 10"
                value={newTable}
                onChange={(e) => setNewTable(e.target.value)}
              />

              <button className="btn-primary" onClick={handleAddTable}>
                Adicionar mesa
              </button>
            </div>

            <p className="role-section-description">
              Você pode cadastrar qualquer número de mesa (1, 2, 10, 21…).
            </p>
          </div>

          {/* Lista de mesas */}
          <div className="card">
            <div className="table-list">
              {tables.length === 0 && (
                <span className="role-empty">
                  Nenhuma mesa cadastrada. Crie as mesas que o bar utiliza.
                </span>
              )}

              {tables.map((table) => (
                <div key={table.id} className="table-list-row">
                  <div className="table-list-label">
                    <span>Mesa {table.id}</span>
                    <span className={`badge badge-${table.status}`}>
                      {statusLabel(table.status)}
                    </span>
                  </div>

                  <button
                    className="btn-delete-pill"
                    onClick={() => removeTable(table.id)}
                  >
                    Excluir
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MESAS EM ANDAMENTO */}
      <section className="role-section">
        <h3 className="role-section-title">Mesas em andamento</h3>

        <div className="role-grid">
          {tables.map((table) => {
            const order = table.currentOrder;
            const paymentMethod = paymentByTable[table.id] ?? "dinheiro";

            if (!order && table.status === "livre") {
              return (
                <div key={table.id} className="card table-card">
                  <div className="table-card-header">
                    <div className="table-card-title">
                      <span className="table-number">Mesa {table.id}</span>
                      <span className={`badge badge-${table.status}`}>
                        {statusLabel(table.status)}
                      </span>
                    </div>
                  </div>

                  <p className="role-empty">Nenhum pedido nesta mesa.</p>
                </div>
              );
            }

            return (
              <div key={table.id} className="card table-card">
                {/* Cabeçalho */}
                <div className="table-card-header">
                  <div className="table-card-title">
                    <span className="table-number">Mesa {table.id}</span>
                    <span className={`badge badge-${table.status}`}>
                      {statusLabel(table.status)}
                    </span>
                  </div>

                  <div className="table-card-total">
                    <span>Total da mesa</span>
                    <strong>R$ {order.total.toFixed(2)}</strong>
                  </div>
                </div>

                {/* Itens */}
                <ul>
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      <div className="table-item-left">
                        <span className="table-item-qty">{item.quantity}x</span>
                        <span className="table-item-name">{item.name}</span>
                      </div>

                      <div className="table-item-right">
                        <span className="table-item-price">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </span>

                        <button
                          onClick={() =>
                            cancelItemFromTable(table.id, idx)
                          }
                        >
                          Cancelar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Rodapé */}
                <div className="table-card-footer">
                  <div className="table-card-payment">
                    <label>Forma de pagamento</label>

                    <select
                      value={paymentMethod}
                      onChange={(e) =>
                        handlePaymentChange(table.id, e.target.value)
                      }
                    >
                      <option value="dinheiro">Dinheiro</option>
                      <option value="cartao">Cartão</option>
                      <option value="pix">PIX</option>
                    </select>
                  </div>

                  <div className="table-card-actions">
                    {table.status !== "pagamento" && (
                      <button
                        className="btn-outline-info"
                        onClick={() => sendTableToPayment(table.id)}
                      >
                        Enviar p/ pagamento
                      </button>
                    )}

                    <button
                      className="btn-primary"
                      onClick={() => closeTable(table.id, paymentMethod)}
                    >
                      Fechar mesa
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
