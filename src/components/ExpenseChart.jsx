import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = [
  '#6366f1', '#06b6d4', '#10b981', '#f59e0b',
  '#f43f5e', '#8b5cf6', '#ec4899', '#14b8a6',
  '#84cc16', '#f97316',
]

const formatLKR = (value) =>
  new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

function CustomTooltip({ active, payload }) {
  if (active && payload?.length) {
    return (
      <div style={{
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
      }}>
        <p style={{ color: 'var(--color-text-strong)', fontWeight: 600, marginBottom: 4 }}>
          {payload[0].name}
        </p>
        <p style={{ color: payload[0].fill, fontWeight: 700 }}>
          {formatLKR(payload[0].value)}
        </p>
      </div>
    )
  }
  return null
}

export default function ExpenseChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📊</div>
        <h3>No expense data</h3>
        <p>Add some expenses to see your spending breakdown.</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="category"
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={100}
          paddingAngle={3}
          strokeWidth={0}
        >
          {data.map((entry, i) => (
            <Cell
              key={`cell-${i}`}
              fill={COLORS[i % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ color: 'var(--color-text)', fontSize: '0.8125rem' }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
