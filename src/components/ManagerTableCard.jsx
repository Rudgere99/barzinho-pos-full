// src/components/ManagerTableCard.jsx
import { useState } from "react";

export default function ManagerTableCard({
  table,
  onSendToPayment,
  onClose,
  onCancelItem,
}) {
  const order = table.currentOrder;
  const [paymentMethod, setPaymentMethod] = useState("dinheiro");

  const statusLabel = {
    livre: "LIVRE",
    aberta: "ABERTA",
    pagamento: "PAGAMENTO",
  }[table.status];

  // Mesa totalmente livre, sem pedido
  if (!order && table.status === "livre") {
    return (
      <div className="card table-card">
        <div className="table-card-header">
          <div className="table-card-title">
            <span className="table-number">Mesa {table.id}</span>
            <span className={`badge badge-${table.status}`}>{statusLabel}</span>
          </div>
        </div>
        <p className="role-empty">Nenhum pedido nesta mesa.</p>
      </div>
    );
  }

  return (
    <div className="card table-card">
      {/* Cabeçalho */}
      <div className="table-card-header">
        <div className="table-card-title">
          <span className="table-number">Mesa {table.id}</span>
          <span className={`badge badge-${table.status}`}>{statusLabel}</span>
        </div>

        <div className="table-card-total">
          <span>Total da mesa</span>
          <strong>R$ {order.total.toFixed(2)}</strong>
        </div>
      </div>

      {/* Itens do pedido */}
      <ul className="table-items">
        {order.items.map((item, idx) => (
          <li key={idx} className="table-item-row">
            <div className="table-item-main">
              <span className="table-item-qty">{item.quantity}x</span>
              <span className="table-item-name">{item.name}</span>
            </div>

            <div className="table-item-meta">
              <span className="table-item-price">
                R$ {(item.price * item.quantity).toFixed(2)}
              </span>
              <button
                type="button"
                className="table-item-cancel"
                onClick={() => onCancelItem(idx)}
              >
                Cancelar
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Rodapé: pagamento + ações */}
      <div className="table-card-footer">
        <div className="table-card-payment">
          <label>Forma de pagamento</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="dinheiro">Dinheiro</option>
            <option value="cartao">Cartão</option>
            <option value="pix">PIX</option>
          </select>
        </div>

        <div className="table-card-actions">
          {table.status !== "pagamento" && (
            <button
              type="button"
              className="btn-outline-info"
              onClick={onSendToPayment}
            >
              Enviar p/ pagamento
            </button>
          )}
          <button
            type="button"
            className="btn-primary"
            onClick={() => onClose(paymentMethod)}
          >
            Fechar mesa
          </button>
        </div>
      </div>
    </div>
  );
}
