// src/components/KitchenOrderCard.jsx
export default function KitchenOrderCard({ table, onMarkReady }) {
  const order = table.currentOrder;
  if (!order) return null;

  const statusLabel =
    order.status === "pronto" ? "Pronto para servir" : "Em preparo";

  return (
    <div className="card kitchen-card">
      <div className="kitchen-card-header">
        <h3>Mesa {table.id}</h3>
        <span className={`pill pill-${order.status}`}>{statusLabel}</span>
      </div>

      <ul className="kitchen-items">
        {order.items.map((item, idx) => (
          <li key={idx}>
            <span>
              <strong>{item.quantity}x</strong> {item.name}
            </span>
            <span>R$ {item.price.toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <div className="kitchen-footer">
        {order.status === "em_preparo" && (
          <button onClick={onMarkReady}>Marcar como pronto</button>
        )}
      </div>
    </div>
  );
}
