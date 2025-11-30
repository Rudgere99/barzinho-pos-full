import { useState, useMemo } from "react";
import { useBar } from "../context/BarContext.jsx";

function FinanceSection() {
  const {
    dailyStats,
    getFinancialSummaryForRange,
    expenses,
    addExpense,
    tables,
  } = useBar();

  const today = new Date().toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [form, setForm] = useState({
    description: "",
    category: "",
    value: "",
    date: today,
    paymentMethod: "dinheiro",
  });

  const rangeSummary = useMemo(
    () => getFinancialSummaryForRange(startDate, endDate),
    [startDate, endDate, getFinancialSummaryForRange]
  );

  const formatCurrency = (v) =>
    (v || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description || !form.value) return;

    const valueNumber = parseFloat(
      String(form.value).replace(".", "").replace(",", ".")
    );

    if (isNaN(valueNumber)) return;

    addExpense({
      ...form,
      value: valueNumber,
    });

    setForm((prev) => ({
      ...prev,
      description: "",
      value: "",
    }));
  };

  const openTables = tables.filter(
    (t) => t.status === "aberta" || t.status === "pagamento"
  );

  return (
    <div>
      {/* VISÃO FINANCEIRA DO DIA (MANTENDO SEU CARD) */}
      <section className="manager-section">
        <h3 className="section-title">Visão financeira do dia</h3>
        <p className="section-subtitle">
          Consolidado considerando apenas mesas fechadas na data de hoje.
        </p>

        <div className="manager-card">
          <p>
            <strong>Faturamento do dia</strong>{" "}
            {formatCurrency(dailyStats.total)}
          </p>
          <p>
            <strong>Mesas fechadas hoje</strong> {dailyStats.count || 0}
          </p>
          <p>
            <strong>Ticket médio hoje</strong>{" "}
            {formatCurrency(dailyStats.avg)}
          </p>
          <p>
            <strong>Valor em aberto nas mesas</strong>{" "}
            {formatCurrency(dailyStats.openTablesTotal)}
          </p>

          <hr />

          <p>
            <strong>Despesas do dia</strong>{" "}
            {formatCurrency(dailyStats.expensesTotal)}
          </p>
          <p>
            <strong>Resultado do dia (lucro / prejuízo)</strong>{" "}
            {formatCurrency(dailyStats.netTotal)}
          </p>

          {dailyStats.byPaymentMethod &&
            Object.keys(dailyStats.byPaymentMethod).length > 0 && (
              <>
                <hr />
                <p>
                  <strong>Faturamento por forma de pagamento</strong>
                </p>
                <ul className="inline-list">
                  {Object.entries(dailyStats.byPaymentMethod).map(
                    ([method, value]) => (
                      <li key={method}>
                        {method}: {formatCurrency(value)}
                      </li>
                    )
                  )}
                </ul>
              </>
            )}
        </div>
      </section>

      {/* RESUMO POR PERÍODO (FILTRO POR DATA) */}
      <section className="manager-section">
        <h3 className="section-title">Resumo por período</h3>

        <div className="filters-row">
          <div className="filters-group">
            <label>
              Data inicial
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>

            <label>
              Data final
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="manager-card">
          <p>
            <strong>Período:</strong> {startDate} até {endDate}
          </p>
          <p>
            <strong>Faturamento no período:</strong>{" "}
            {formatCurrency(rangeSummary.total)}
          </p>
          <p>
            <strong>Mesas fechadas:</strong> {rangeSummary.count || 0}
          </p>
          <p>
            <strong>Ticket médio:</strong>{" "}
            {formatCurrency(rangeSummary.avg)}
          </p>
          <p>
            <strong>Despesas no período:</strong>{" "}
            {formatCurrency(rangeSummary.expensesTotal)}
          </p>
          <p>
            <strong>Resultado no período:</strong>{" "}
            {formatCurrency(rangeSummary.netTotal)}
          </p>
        </div>
      </section>

      {/* CADASTRO RÁPIDO DE DESPESAS */}
      <section className="manager-section">
        <h3 className="section-title">Registrar despesas</h3>
        <p className="section-subtitle">
          Controle gastos como compra de bebidas, ingredientes, gás, etc.
        </p>

        <div className="manager-card">
          <form className="inline-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>
                Descrição
                <input
                  type="text"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Ex.: Compra de cerveja"
                />
              </label>

              <label>
                Categoria
                <input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Bebida, Cozinha, Fixo..."
                />
              </label>

              <label>
                Valor
                <input
                  type="number"
                  step="0.01"
                  name="value"
                  value={form.value}
                  onChange={handleChange}
                  placeholder="0,00"
                />
              </label>

              <label>
                Data
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                />
              </label>

              <label>
                Forma de pagamento
                <select
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={handleChange}
                >
                  <option value="dinheiro">Dinheiro</option>
                  <option value="pix">PIX</option>
                  <option value="cartao_credito">Cartão crédito</option>
                  <option value="cartao_debito">Cartão débito</option>
                  <option value="outros">Outros</option>
                </select>
              </label>
            </div>

            <button type="submit">Registrar despesa</button>
          </form>

          {expenses.length > 0 && (
            <>
              <hr />
              <p>
                <strong>Despesas recentes</strong>
              </p>
              <ul className="simple-list">
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

      {/* MESAS ABERTAS / EM PAGAMENTO (MANTENDO SUA IDEIA) */}
      <section className="manager-section">
        <h3 className="section-title">Mesas abertas / em pagamento</h3>

        <div className="manager-card">
          {openTables.length === 0 ? (
            <p>Nenhuma mesa com pedido em aberto no momento.</p>
          ) : (
            <ul className="simple-list">
              {openTables.map((t) => (
                <li key={t.id}>
                  Mesa {t.id} — status: {t.status} — total:{" "}
                  {formatCurrency(t.currentOrder?.total || 0)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

export default FinanceSection;
