
export default function OrderCart({ items, onChangeQuantity, onSubmit }) {
  const total = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="card">
      <h3>Resumo do Pedido</h3>
      {items.length === 0 && <p>Nenhum item no pedido.</p>}
      {items.length > 0 && (
        <>
          <ul className="cart-list">
            {items.map((item, index) => (
              <li key={index}>
                <div>
                  <strong>{item.name}</strong>
                  <span>R$ {item.price.toFixed(2)}</span>
                </div>
                <div className="cart-qty">
                  <button onClick={() => onChangeQuantity(index, -1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => onChangeQuantity(index, 1)}>+</button>
                </div>
              </li>
            ))}
          </ul>
          <div className="cart-footer">
            <span>Total: R$ {total.toFixed(2)}</span>
            <button onClick={onSubmit}>Enviar para Cozinha</button>
          </div>
        </>
      )}
    </div>
  );
}
