export default function SummaryCard({ type, amount, label, icon, sub }) {
  const fmt = new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <div className={`summary-card ${type} slide-up`}>
      <div className="card-icon">{icon}</div>
      <p className="card-label">{label}</p>
      <p className="card-amount">{fmt.format(amount ?? 0)}</p>
      {sub && <p className="card-sub">{sub}</p>}
    </div>
  )
}
