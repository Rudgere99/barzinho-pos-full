export default function MenuItemCard({ item, onAdd }) {
  return (
    <div className="menu-item-card row">
      {/* Thumb da imagem */}
      <div className="menu-item-thumb">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="menu-item-thumb-img"
          />
        ) : (
          <div className="menu-item-thumb-placeholder">
            <span>Sem foto</span>
          </div>
        )}
      </div>

      {/* Conteúdo em linha */}
      <div className="menu-item-row-content">
        <div className="menu-item-row-main">
          <span className="chip">{item.category}</span>
          <h4>{item.name}</h4>
          {item.description && (
            <p className="menu-item-description">{item.description}</p>
          )}
        </div>
        <div className="menu-item-row-actions">
          <span className="price">R$ {item.price.toFixed(2)}</span>
          <button onClick={() => onAdd(item)}>Adicionar</button>
        </div>
      </div>
    </div>
  );
}
