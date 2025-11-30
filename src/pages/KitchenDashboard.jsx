// src/pages/KitchenDashboard.jsx
import { useMemo } from "react";
import { useBar } from "../context/BarContext";

export default function KitchenDashboard() {
  const { tables, markOrderReady, markOrderPickedUp } = useBar();

  const ordersInKitchen = useMemo(() => {
    return tables
      .filter((t) => t.currentOrder)
      .map((t) => ({
        tableId: t.id,
        ...t.currentOrder,
      }))
      .filter((o) => o.status === "em_preparo" || o.status === "pronto")
      .sort((a, b) => (a.openedAt > b.openedAt ? 1 : -1));
  }, [tables]);

  return (
    <div className="kitchen-page">
      <h2 className="page-title">Cozinha</h2>
      <p className="page-subtitle">Pedidos em preparo e prontos para saída.</p>

      <div className="role-grid">
        {ordersInKitchen.map((order) => {
          const total = order.items.reduce(
            (acc, it) => acc + it.price * it.quantity,
            0
          );

          return (
            <div key={`${order.tableId}-${order.openedAt}`} className="card table-card">
              <div className="table-card-header">
                <div className="table-card-title">
                  <span className="table-number">Mesa {order.tableId}</span>
                  <span className={`badge badge-${order.status === "pronto" ? "pagamento" : "aberta"}`}>
                    {order.status === "pronto" ? "PRONTO" : "EM PREPARO"}
                  </span>
                </div>

                <div className="table-card-total">
                  <span>Total</span>
                  <strong>R$ {total.toFixed(2)}</strong>
                </div>
              </div>

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
                    </div>
                  </li>
                ))}
              </ul>

              {order.status === "em_preparo" && (
                <div className="table-card-footer" style={{ justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => markOrderReady(order.tableId)}
                  >
                    Marcar como pronto
                  </button>
                </div>
              )}

              {order.status === "pronto" && (
                <div
                  className="table-card-footer"
                  style={{ justifyContent: "space-between" }}
                >
                  <p style={{ fontSize: ".85rem", color: "var(--text-muted)", margin: 0 }}>
                    Aguardando retirada pelo atendente.
                  </p>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => markOrderPickedUp(order.tableId)}
                  >
                    Retirado
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {!ordersInKitchen.length && (
          <div className="card" style={{ textAlign: "center", color: "var(--text-muted)" }}>
            Nenhum pedido na cozinha agora.
          </div>
        )}
      </div>
    </div>
  );
}