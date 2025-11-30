import { useState, useMemo } from "react";
import { useBar } from "../context/BarContext.jsx";
import ManagerTableCard from "../components/ManagerTableCard.jsx";
import MenuEditor from "../components/MenuEditor.jsx";
import StatsSummary from "../components/StatsSummary.jsx";

export default function ManagerDashboard() {
  const {
    tables,
    menu,
    history,
    sendTableToPayment,
    closeTable,
    cancelItemFromTable,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    dailyStats,
    addTable,
    removeTable,
    // 🔹 novos dados do financeiro
    expenses,
    addExpense,
    getFinancialSummaryForRange,
  } = useBar();

  const today = new Date().toISOString().slice(0, 10);

  const [newTableId, setNewTableId] = useState("");
  const [activeTab, setActiveTab] = useState("mesas"); // mesas | cardapio | financeiro | historico
  const [filterDate, setFilterDate] = useState(""); // yyyy-mm-dd

  // 🔹 filtro de período para o financeiro
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  // 🔹 formulário de despesas
  const [expenseForm, setExpenseForm] = useState({
    description: "",
    category: "",
    value: "",
    date: today,
    paymentMethod: "dinheiro",
  });

  // 🔹 resumo financeiro para o período
  const rangeSummary = useMemo(
    () => getFinancialSummaryForRange(startDate, endDate),
    [startDate, endDate, getFinancialSummaryForRange]
  );

  const handleAddTable = (e) => {
    e.preventDefault();
    if (!newTableId) return;
    addTable(newTableId);
    setNewTableId("");
  };

  const handleRemoveTable = (id) => {
    const canRemove = tables.find(
      (t) => t.id === id && t.status === "livre" && !t.currentOrder
    );
    if (!canRemove) {
      alert("Só é possível excluir mesas livres e sem pedido.");
      return;
    }
    removeTable(id);
  };

  const openTables = tables.filter(
    (t) => t.status === "aberta" || t.status === "pagamento"
  );
  const openTotal = openTables.reduce(
    (acc, t) => acc + (t.currentOrder?.total || 0),
    0
  );

  // aplica filtro por data (fecha em yyyy-mm-dd)
  const filteredHistory = filterDate
    ? history.filter((h) => h.closedAt.startsWith(filterDate))
    : history;

  // 🔹 helpers do financeiro
  const formatCurrency = (v = 0) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleExpenseChange = (e) => {
    const { name, value } = e.target;
    setExpenseForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    if (!expenseForm.description || !expenseForm.value) return;

    const valueNumber = parseFloat(
      String(expenseForm.value).replace(".", "").replace(",", ".")
    );
    if (isNaN(valueNumber)) return;

    addExpense({
      ...expenseForm,
      value: valueNumber,
    });

    setExpenseForm((prev) => ({
      ...prev,
      description: "",
      value: "",
    }));
  };

  return (
    <div className="manager-page">
      <header className="role-header">
        <div>
          <h2 className="page-title">Gerência</h2>
          <p className="page-subtitle">
            Controle financeiro, mesas, histórico e cardápio do barzinho.
          </p>
        </div>
        <StatsSummary stats={dailyStats} />
      </header>

      {/* Abas (usa role-tabs/role-tab para bater com o CSS) */}
      <nav className="role-tabs">
        <button
          type="button"
          className={"role-tab" + (activeTab === "mesas" ? " active" : "")}
          onClick={() => setActiveTab("mesas")}
        >
          Mesas
        </button>
        <button
          type="button"
          className={"role-tab" + (activeTab === "cardapio" ? " active" : "")}
          onClick={() => setActiveTab("cardapio")}
        >
          Cardápio
        </button>
        <button
          type="button"
          className={
            "role-tab" + (activeTab === "financeiro" ? " active" : "")
          }
          onClick={() => setActiveTab("financeiro")}
        >
          Financeiro
        </button>
        <button
          type="button"
          className={"role-tab" + (activeTab === "historico" ? " active" : "")}
          onClick={() => setActiveTab("historico")}
        >
          Histórico &amp; pedidos
        </button>
      </nav>

      {/* ABA MESAS */}
      {activeTab === "mesas" && (
        <>
          <section className="role-section">
            <h3 className="role-section-title">Gestão de mesas</h3>

            <div className="tables-admin">
              {/* form esquerda */}
              <form className="tables-admin-form card" onSubmit={handleAddTable}>
                <label>Novo número de mesa</label>

                <div className="form-row tables-admin-row">
                  <input
                    className="input-text"
                    type="number"
                    min="1"
                    placeholder="Ex: 10"
                    value={newTableId}
                    onChange={(e) => setNewTableId(e.target.value)}
                  />
                  <button className="btn-primary" type="submit">
                    Adicionar mesa
                  </button>
                </div>

                <span className="hint">
                  Você pode cadastrar qualquer número de mesa (1, 2, 10, 21...).
                </span>
              </form>

              {/* lista direita */}
              <div className="card">
                {tables.length === 0 && (
                  <p className="role-empty">
                    Nenhuma mesa cadastrada. Crie as mesas que o bar utiliza.
                  </p>
                )}

                {tables.length > 0 && (
                  <div className="table-list">
                    {tables.map((t) => {
                      const canDelete =
                        t.status === "livre" && !t.currentOrder;

                      return (
                        <div key={t.id} className="table-list-row">
                          <div className="table-list-label">
                            <strong>Mesa {t.id}</strong>
                            <span className={`badge badge-${t.status}`}>
                              {t.status.toUpperCase()}
                            </span>
                          </div>

                          <button
                            type="button"
                            className="btn-delete-pill"
                            disabled={!canDelete}
                            onClick={() => handleRemoveTable(t.id)}
                          >
                            Excluir
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="role-section">
            <h3 className="role-section-title">Mesas em andamento</h3>
            <div className="role-grid">
              {tables.map((table) => (
                <ManagerTableCard
                  key={table.id}
                  table={table}
                  onSendToPayment={() => sendTableToPayment(table.id)}
                  onClose={(paymentMethod) =>
                    closeTable(table.id, paymentMethod)
                  }
                  onCancelItem={(idx) => cancelItemFromTable(table.id, idx)}
                />
              ))}
            </div>
          </section>
        </>
      )}

      {/* ABA CARDÁPIO */}
      {activeTab === "cardapio" && (
        <section className="role-section">
          <h3 className="role-section-title">Gerenciamento de cardápio</h3>
          <p className="role-section-description">
            Adicione, remova ou ajuste os itens disponíveis para o atendente
            lançar pedidos.
          </p>

          <MenuEditor
            menu={menu}
            onAdd={addMenuItem}
            onUpdate={updateMenuItem}
            onDelete={deleteMenuItem}
          />
        </section>
      )}

      {/* ABA FINANCEIRO */}
      {activeTab === "financeiro" && (
        <>
          {/* VISÃO FINANCEIRA DO DIA */}
          <section className="role-section">
            <h3 className="role-section-title">Visão financeira do dia</h3>

            <div className="card">
              <p style={{ marginTop: 0, fontSize: ".88rem", color: "#6b7280" }}>
                Consolidado considerando apenas mesas fechadas na data de hoje.
              </p>

              <div className="stats">
                <div>
                  <span>Faturamento do dia</span>
                  <strong>{formatCurrency(dailyStats.total)}</strong>
                </div>
                <div>
                  <span>Mesas fechadas hoje</span>
                  <strong>{dailyStats.count || 0}</strong>
                </div>
                <div>
                  <span>Ticket médio hoje</span>
                  <strong>{formatCurrency(dailyStats.avg)}</strong>
                </div>
                <div>
                  <span>Valor em aberto nas mesas</span>
                  <strong>{formatCurrency(dailyStats.openTablesTotal)}</strong>
                </div>
              </div>

              <hr />

              <div className="stats">
                <div>
                  <span>Despesas do dia</span>
                  <strong>{formatCurrency(dailyStats.expensesTotal)}</strong>
                </div>
                <div>
                  <span>Resultado do dia (lucro / prejuízo)</span>
                  <strong>{formatCurrency(dailyStats.netTotal)}</strong>
                </div>
              </div>

              {dailyStats.byPaymentMethod &&
                Object.keys(dailyStats.byPaymentMethod).length > 0 && (
                  <>
                    <hr />
                    <p
                      style={{
                        marginTop: 0,
                        fontSize: ".88rem",
                        color: "#6b7280",
                      }}
                    >
                      Faturamento por forma de pagamento:
                    </p>
                    <div className="stats">
                      {Object.entries(dailyStats.byPaymentMethod).map(
                        ([method, value]) => (
                          <div key={method}>
                            <span>{method}</span>
                            <strong>{formatCurrency(value)}</strong>
                          </div>
                        )
                      )}
                    </div>
                  </>
                )}
            </div>
          </section>

          {/* RESUMO POR PERÍODO */}
          <section className="role-section">
            <h3 className="role-section-title">Resumo por período</h3>

            <div className="card">
              <div className="stats">
                <div>
                  <span>Data inicial</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <span>Data final</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <hr />

              <div className="stats">
                <div>
                  <span>Faturamento no período</span>
                  <strong>{formatCurrency(rangeSummary.total)}</strong>
                </div>
                <div>
                  <span>Mesas fechadas</span>
                  <strong>{rangeSummary.count || 0}</strong>
                </div>
                <div>
                  <span>Ticket médio</span>
                  <strong>{formatCurrency(rangeSummary.avg)}</strong>
                </div>
                <div>
                  <span>Despesas no período</span>
                  <strong>
                    {formatCurrency(rangeSummary.expensesTotal)}
                  </strong>
                </div>
                <div>
                  <span>Resultado no período</span>
                  <strong>{formatCurrency(rangeSummary.netTotal)}</strong>
                </div>
              </div>
            </div>
          </section>

          {/* REGISTRO DE DESPESAS */}
          <section className="role-section">
            <h3 className="role-section-title">Registrar despesas</h3>

            <div className="card">
              <form
                onSubmit={handleExpenseSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: ".75rem",
                }}
              >
                <div className="stats">
                  <div>
                    <span>Descrição</span>
                    <input
                      type="text"
                      name="description"
                      value={expenseForm.description}
                      onChange={handleExpenseChange}
                      placeholder="Ex.: Compra de cerveja"
                    />
                  </div>
                  <div>
                    <span>Categoria</span>
                    <input
                      type="text"
                      name="category"
                      value={expenseForm.category}
                      onChange={handleExpenseChange}
                      placeholder="Bebida, Cozinha..."
                    />
                  </div>
                  <div>
                    <span>Valor</span>
                    <input
                      type="number"
                      step="0.01"
                      name="value"
                      value={expenseForm.value}
                      onChange={handleExpenseChange}
                    />
                  </div>
                  <div>
                    <span>Data</span>
                    <input
                      type="date"
                      name="date"
                      value={expenseForm.date}
                      onChange={handleExpenseChange}
                    />
                  </div>
                  <div>
                    <span>Forma de pagamento</span>
                    <select
                      name="paymentMethod"
                      value={expenseForm.paymentMethod}
                      onChange={handleExpenseChange}
                    >
                      <option value="dinheiro">Dinheiro</option>
                      <option value="pix">PIX</option>
                      <option value="cartao_credito">
                        Cartão crédito
                      </option>
                      <option value="cartao_debito">Cartão débito</option>
                      <option value="outros">Outros</option>
                    </select>
                  </div>
                </div>

                <button type="submit">Adicionar despesa</button>
              </form>

              {expenses.length > 0 && (
                <>
                  <hr />
                  <p
                    style={{
                      marginTop: 0,
                      fontSize: ".88rem",
                      color: "#6b7280",
                    }}
                  >
                    Despesas recentes
                  </p>
                  <ul style={{ paddingLeft: "1.25rem", margin: 0 }}>
                    {expenses
                      .slice()
                      .reverse()
                      .slice(0, 5)
                      .map((e) => (
                        <li key={e.id}>
                          {e.date} • {e.description} ({e.category}) —{" "}
                          {formatCurrency(e.value)}
                        </li>
                      ))}
                  </ul>
                </>
              )}
            </div>
          </section>

          {/* MESAS ABERTAS / EM PAGAMENTO */}
          <section className="role-section">
            <h3 className="role-section-title">
              Mesas abertas / em pagamento
            </h3>
            <div className="role-grid">
              {openTables.length === 0 && (
                <p className="role-empty">
                  Nenhuma mesa com pedido em aberto no momento.
                </p>
              )}

              {openTables.map((table) => (
                <ManagerTableCard
                  key={table.id}
                  table={table}
                  onSendToPayment={() => sendTableToPayment(table.id)}
                  onClose={(paymentMethod) =>
                    closeTable(table.id, paymentMethod)
                  }
                  onCancelItem={(idx) => cancelItemFromTable(table.id, idx)}
                />
              ))}
            </div>
          </section>
        </>
      )}

      {/* ABA HISTÓRICO & PEDIDOS */}
      {activeTab === "historico" && (
        <>
          <section className="role-section">
            <h3 className="role-section-title">Histórico de mesas fechadas</h3>

            <div className="history-filter">
              <label>Filtrar por data de fechamento</label>
              <input
                className="input-text"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>

            <div className="card">
              {filteredHistory.length === 0 && (
                <p className="role-empty">
                  Nenhuma mesa encontrada para esta data.
                </p>
              )}

              {filteredHistory.length > 0 && (
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Mesa</th>
                      <th>Aberta em</th>
                      <th>Fechada em</th>
                      <th>Total</th>
                      <th>Pagamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((h, idx) => (
                      <tr key={idx}>
                        <td>{h.tableId}</td>
                        <td>{new Date(h.openedAt).toLocaleString()}</td>
                        <td>{new Date(h.closedAt).toLocaleString()}</td>
                        <td>{formatCurrency(h.total)}</td>
                        <td>{h.paymentMethod}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          {/* COMANDAS DETALHADAS */}
          <section className="role-section">
            <h3 className="role-section-title">Comandas detalhadas</h3>
            <p className="role-section-description">
              Visualize cada comanda em formato compacto, com itens,
              quantidades e valores.
            </p>

            {filteredHistory.length === 0 && (
              <p className="role-empty">Ainda não há comandas para exibir.</p>
            )}

            {filteredHistory.length > 0 && (
              <div className="comandas-grid">
                {filteredHistory
                  .slice()
                  .reverse()
                  .map((h, idx) => {
                    const openedAt = new Date(h.openedAt);
                    const closedAt = new Date(h.closedAt);

                    return (
                      <article key={idx} className="comanda-card">
                        <header className="comanda-header">
                          <div>
                            <div className="comanda-title">
                              Mesa {h.tableId}
                            </div>
                            <div className="comanda-date">
                              {openedAt.toLocaleDateString()}
                            </div>
                          </div>

                          <div className="comanda-times">
                            <div>
                              Aberta:{" "}
                              <strong>
                                {openedAt.toLocaleTimeString()}
                              </strong>
                            </div>
                            <div>
                              Fechada:{" "}
                              <strong>
                                {closedAt.toLocaleTimeString()}
                              </strong>
                            </div>
                          </div>
                        </header>

                        <ul className="comanda-items">
                          {h.items.map((it, i) => (
                            <li key={i} className="comanda-item">
                              <div className="comanda-item-left">
                                <span className="comanda-qty">
                                  {it.quantity}x
                                </span>
                                <span>{it.name}</span>
                              </div>
                              <div className="comanda-item-right">
                                {formatCurrency(it.price * it.quantity)}
                              </div>
                            </li>
                          ))}
                        </ul>

                        <footer className="comanda-footer">
                          <div className="comanda-total">
                            <span>Total</span>
                            <strong>{formatCurrency(h.total)}</strong>
                          </div>
                          <div className="comanda-payment">
                            Pagamento
                            <span className="comanda-payment-chip">
                              {h.paymentMethod}
                            </span>
                          </div>
                        </footer>
                      </article>
                    );
                  })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
