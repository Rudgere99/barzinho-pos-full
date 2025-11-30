import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

const BarContext = createContext(null);

const STORAGE_KEYS = {
  MENU: "barzinho_menu",
  TABLES: "barzinho_tables",
  HISTORY: "barzinho_orders_history",
  EXPENSES: "barzinho_expenses", // 💰 gastos do bar
};

// Cardápio padrão (só usado se ainda não existir nada salvo)
const DEFAULT_MENU = [
  {
    id: "1",
    name: "Cerveja 600ml",
    category: "Bebida",
    price: 12.9,
    description: "Cerveja Pilsen bem gelada.",
    imageUrl: "",
  },
  {
    id: "2",
    name: "Porção de Batata Frita",
    category: "Comida",
    price: 29.9,
    description: "800g de batata frita crocante.",
    imageUrl: "",
  },
];

// Mesas começam vazias, a gerência cria
const DEFAULT_TABLES = [];

// Helper seguro pra ler do localStorage na inicialização
const isBrowser = typeof window !== "undefined";

function loadFromStorage(key, fallback) {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Erro ao carregar", key, e);
    return fallback;
  }
}

function calcTotal(items = []) {
  return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
}

// Normaliza qualquer coisa pra "YYYY-MM-DD"
function toDateKey(input) {
  if (!input) {
    return new Date().toISOString().slice(0, 10);
  }
  if (input instanceof Date) {
    return input.toISOString().slice(0, 10);
  }
  // se já vier "YYYY-MM-DD", garante só os 10 primeiros
  if (typeof input === "string") {
    if (/^\d{4}-\d{2}-\d{2}/.test(input)) return input.slice(0, 10);
    const d = new Date(input);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

export function BarProvider({ children }) {
  // 🔹 Carrega uma vez do localStorage na criação do estado
  const [menu, setMenu] = useState(() =>
    loadFromStorage(STORAGE_KEYS.MENU, DEFAULT_MENU)
  );
  const [tables, setTables] = useState(() =>
    loadFromStorage(STORAGE_KEYS.TABLES, DEFAULT_TABLES)
  );
  const [history, setHistory] = useState(() =>
    loadFromStorage(STORAGE_KEYS.HISTORY, [])
  );
  const [expenses, setExpenses] = useState(() =>
    loadFromStorage(STORAGE_KEYS.EXPENSES, [])
  );

  // 🔹 Sempre que mudar, salva no localStorage
  useEffect(() => {
    if (!isBrowser) return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menu));
    } catch (e) {
      console.error("Erro ao salvar menu:", e);
    }
  }, [menu]);

  useEffect(() => {
    if (!isBrowser) return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
    } catch (e) {
      console.error("Erro ao salvar mesas:", e);
    }
  }, [tables]);

  useEffect(() => {
    if (!isBrowser) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.HISTORY,
        JSON.stringify(history)
      );
    } catch (e) {
      console.error("Erro ao salvar histórico:", e);
    }
  }, [history]);

  useEffect(() => {
    if (!isBrowser) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.EXPENSES,
        JSON.stringify(expenses)
      );
    } catch (e) {
      console.error("Erro ao salvar despesas:", e);
    }
  }, [expenses]);

  // ========= GESTÃO DE MESAS =========

  const addTable = (tableId) => {
    const id = Number(tableId);
    if (!id || isNaN(id)) return;

    setTables((prev) => {
      // não duplica
      if (prev.some((t) => t.id === id)) return prev;

      const newTable = {
        id,
        status: "livre", // livre | aberta | pagamento
        currentOrder: null,
      };

      const updated = [...prev, newTable];
      updated.sort((a, b) => a.id - b.id);
      return updated;
    });
  };

  const removeTable = (tableId) => {
    const id = Number(tableId);
    setTables((prev) => {
      const target = prev.find((t) => t.id === id);
      if (!target) return prev;
      // só exclui mesa livre e sem pedido
      if (target.status !== "livre" || target.currentOrder) return prev;
      return prev.filter((t) => t.id !== id);
    });
  };

  const updateTable = (tableId, updater) => {
    const id = Number(tableId);
    setTables((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updater(t) } : t))
    );
  };

  // ========= PEDIDOS (ATENDENTE / COZINHA / GERÊNCIA) =========

  const addItemsToTable = (tableId, items) => {
    const id = Number(tableId);
    updateTable(id, (t) => {
      const existingOrder =
        t.currentOrder ||
        {
          items: [],
          status: "em_preparo", // em_preparo | pronto | entregue
          openedAt: new Date().toISOString(),
          orderId: `${id}-${new Date().toISOString()}`,
        };

      const orderId =
        existingOrder.orderId || `${id}-${existingOrder.openedAt}`;

      const updatedItems = [...existingOrder.items, ...items];
      const total = calcTotal(updatedItems);

      return {
        status: "aberta",
        currentOrder: {
          ...existingOrder,
          orderId,
          items: updatedItems,
          total,
        },
      };
    });
  };

  const markOrderReady = (tableId) => {
    const id = Number(tableId);
    updateTable(id, (t) => {
      if (!t.currentOrder) return {};
      return {
        currentOrder: {
          ...t.currentOrder,
          status: "pronto",
          readyAt: new Date().toISOString(),
        },
      };
    });
  };

  const markOrderPickedUp = (tableId) => {
    const id = Number(tableId);
    updateTable(id, (t) => {
      if (!t.currentOrder) return {};
      return {
        currentOrder: {
          ...t.currentOrder,
          status: "entregue",
          pickedUpAt: new Date().toISOString(),
        },
      };
    });
  };

  const sendTableToPayment = (tableId) => {
    const id = Number(tableId);
    setTables((prevTables) =>
      prevTables.map((t) =>
        t.id === id && t.currentOrder ? { ...t, status: "pagamento" } : t
      )
    );
  };

  const cancelItemFromTable = (tableId, itemIndex) => {
    const id = Number(tableId);
    updateTable(id, (t) => {
      if (!t.currentOrder) return {};
      const newItems = t.currentOrder.items.filter((_, i) => i !== itemIndex);
      const total = calcTotal(newItems);
      return {
        currentOrder: { ...t.currentOrder, items: newItems, total },
        status: newItems.length === 0 ? "livre" : t.status,
      };
    });
  };

  /**
   * Fecha mesa e manda para histórico.
   */
  const closeTable = (tableId, paymentMethod = "dinheiro") => {
    const id = Number(tableId);
    if (!id || isNaN(id)) return;

    setTables((prevTables) => {
      const target = prevTables.find((t) => t.id === id);
      if (!target || !target.currentOrder) return prevTables;

      const orderId =
        target.currentOrder.orderId || `${id}-${target.currentOrder.openedAt}`;

      const closedOrder = {
        orderId,
        tableId: target.id,
        total: target.currentOrder.total,
        items: target.currentOrder.items,
        openedAt: target.currentOrder.openedAt,
        closedAt: new Date().toISOString(),
        paymentMethod,
      };

      // atualiza histórico com snapshot atual
      setHistory((prevHistory) => {
        if (prevHistory.some((h) => h.orderId === closedOrder.orderId)) {
          return prevHistory;
        }
        return [...prevHistory, closedOrder];
      });

      // limpa mesa
      return prevTables.map((t) =>
        t.id === id ? { ...t, status: "livre", currentOrder: null } : t
      );
    });
  };

  // ========= CARDÁPIO =========

  const addMenuItem = (item) => {
    setMenu((prev) => [...prev, { ...item, id: Date.now().toString() }]);
  };

  const updateMenuItem = (id, data) => {
    setMenu((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
  };

  const deleteMenuItem = (id) => {
    setMenu((prev) => prev.filter((m) => m.id !== id));
  };

  // ========= DESPESAS (GASTOS DO BAR) =========
  // Ex: compra de bebida, ingredientes, gás, etc.

  const addExpense = (expense) => {
    // expense: { description, category, value, date, paymentMethod? }
    const now = new Date().toISOString();
    setExpenses((prev) => [
      ...prev,
      {
        id: now,
        description: expense.description || "",
        category: expense.category || "Geral",
        value: Number(expense.value) || 0,
        date: toDateKey(expense.date || now),
        paymentMethod: expense.paymentMethod || "dinheiro",
        createdAt: now,
      },
    ]);
  };

  const updateExpense = (id, data) => {
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              ...data,
              value:
                data.value !== undefined ? Number(data.value) || 0 : e.value,
              date: data.date ? toDateKey(data.date) : e.date,
            }
          : e
      )
    );
  };

  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // ========= FUNÇÕES FINANCEIRAS POR DATA / PERÍODO =========

  const getFinancialSummaryForDate = useCallback(
    (date) => {
      const dayKey = toDateKey(date);

      const dayOrders = history.filter((h) =>
        (h.closedAt || "").startsWith(dayKey)
      );
      const revenue = dayOrders.reduce((acc, o) => acc + o.total, 0);
      const count = dayOrders.length;
      const avg = count ? revenue / count : 0;

      const dayExpenses = expenses.filter((e) => e.date === dayKey);
      const expensesTotal = dayExpenses.reduce((acc, e) => acc + e.value, 0);

      const netTotal = revenue - expensesTotal;

      // valor em aberto nas mesas (abertas ou em pagamento)
      const openTablesTotal = tables.reduce((acc, t) => {
        if (!t.currentOrder) return acc;
        if (t.status === "livre") return acc;
        return acc + (t.currentOrder.total || 0);
      }, 0);

      // total por forma de pagamento
      const byPaymentMethod = dayOrders.reduce((acc, o) => {
        const key = o.paymentMethod || "outros";
        acc[key] = (acc[key] || 0) + o.total;
        return acc;
      }, {});

      return {
        date: dayKey,
        total: revenue, // faturamento (mantido p/ compatibilidade)
        count, // qtd mesas fechadas
        avg, // ticket médio

        expensesTotal, // total de gastos do dia
        netTotal, // lucro/prejuízo (receita - despesas)
        openTablesTotal, // mesas em aberto/pagamento
        byPaymentMethod, // detalhamento por forma de pagamento
      };
    },
    [history, expenses, tables]
  );

  const getFinancialSummaryForRange = useCallback(
    (startDate, endDate) => {
      const startKey = toDateKey(startDate);
      const endKey = toDateKey(endDate);

      const inRange = (isoDate) => {
        if (!isoDate) return false;
        const d = isoDate.slice(0, 10);
        return d >= startKey && d <= endKey;
      };

      const orders = history.filter((h) => inRange(h.closedAt));
      const revenue = orders.reduce((acc, o) => acc + o.total, 0);
      const count = orders.length;
      const avg = count ? revenue / count : 0;

      const expensesRange = expenses.filter(
        (e) => e.date >= startKey && e.date <= endKey
      );
      const expensesTotal = expensesRange.reduce((acc, e) => acc + e.value, 0);
      const netTotal = revenue - expensesTotal;

      const byPaymentMethod = orders.reduce((acc, o) => {
        const key = o.paymentMethod || "outros";
        acc[key] = (acc[key] || 0) + o.total;
        return acc;
      }, {});

      return {
        startDate: startKey,
        endDate: endKey,
        total: revenue,
        count,
        avg,
        expensesTotal,
        netTotal,
        byPaymentMethod,
      };
    },
    [history, expenses]
  );

  // série diária para gráfico / tabela por dia
  const getDailySeries = useCallback(
    (startDate, endDate) => {
      const startKey = toDateKey(startDate);
      const endKey = toDateKey(endDate);

      const result = [];
      let current = new Date(startKey + "T00:00:00");

      while (toDateKey(current) <= endKey) {
        const key = toDateKey(current);
        result.push(getFinancialSummaryForDate(key));
        current.setDate(current.getDate() + 1);
      }

      return result;
    },
    [getFinancialSummaryForDate]
  );

  // ========= ESTATÍSTICAS DIÁRIAS (USADAS NA TELA ATUAL) =========
  // Mantém as mesmas chaves: total, count, avg
  const dailyStats = useMemo(() => {
    return getFinancialSummaryForDate(new Date());
  }, [getFinancialSummaryForDate]);

  return (
    <BarContext.Provider
      value={{
        menu,
        tables,
        history,
        expenses,

        // mesas / pedidos
        addTable,
        removeTable,
        addItemsToTable,
        markOrderReady,
        markOrderPickedUp,
        sendTableToPayment,
        closeTable,
        cancelItemFromTable,

        // cardápio
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,

        // despesas
        addExpense,
        updateExpense,
        deleteExpense,

        // financeiro
        dailyStats,
        getFinancialSummaryForDate,
        getFinancialSummaryForRange,
        getDailySeries,
      }}
    >
      {children}
    </BarContext.Provider>
  );
}

export function useBar() {
  return useContext(BarContext);
}
