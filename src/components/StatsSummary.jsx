
export default function StatsSummary({ stats }) {
  return (
    <div className="card stats">
      <div>
        <span>Faturamento do dia</span>
        <strong>R$ {stats.total.toFixed(2)}</strong>
      </div>
      <div>
        <span>Mesas fechadas hoje</span>
        <strong>{stats.count}</strong>
      </div>
      <div>
        <span>Ticket médio</span>
        <strong>R$ {stats.avg.toFixed(2)}</strong>
      </div>
    </div>
  );
}
