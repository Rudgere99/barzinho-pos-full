
import { useBar } from "../context/BarContext.jsx";

export default function TableSelector({ selectedTableId, onSelect }) {
  const { tables } = useBar();

  return (
    <div className="tables-grid">
      {tables.map((table) => (
        <button
          key={table.id}
          className={`table-button ${
            selectedTableId === table.id ? "selected" : ""
          } ${table.status}`}
          onClick={() => onSelect(table.id)}
        >
          Mesa {table.id}
          <span className="table-status">{table.status}</span>
        </button>
      ))}
    </div>
  );
}
