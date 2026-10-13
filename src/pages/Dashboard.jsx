import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Navbar from '../components/Navbar.jsx'
import SummaryCard from '../components/SummaryCard.jsx'
import ExpenseChart from '../components/ExpenseChart.jsx'
import TransactionForm from '../components/TransactionForm.jsx'
import { api } from '../services/api.js'

const CATEGORY_ICONS = {
  Food: '🍔', Transport: '🚌', Education: '📚', Shopping: '🛍️',
  Bills: '📄', Entertainment: '🎮', Health: '💊', Other: '📦',
  Salary: '💼', Freelance: '💻', Business: '🏢', 'Other Income': '💵',
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })
}

const fmtLKR = new Intl.NumberFormat('en-LK', {
  style: 'currency', currency: 'LKR',
  minimumFractionDigits: 2, maximumFractionDigits: 2,
})

export default function Dashboard() {
  const { user } = useAuth()

  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, balance: 0, expenseBreakdown: [] })
  const [recentTx, setRecentTx] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [summaryData, txData] = await Promise.all([
        api.get(`/reports/summary?month=${selectedMonth}`),
        api.get(`/transactions?month=${selectedMonth}&limit=5`),
      ])
      setSummary(summaryData)
      setRecentTx(txData.transactions)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [selectedMonth])

  useEffect(() => { load() }, [load])

  // Generate month options (current + 11 past)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-LK', { month: 'long', year: 'numeric' })
    return { val, label }
  })

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
            <p>Here's your financial overview</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <select
              className="filter-select"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              id="filter-month-dashboard"
            >
              {monthOptions.map(m => (
                <option key={m.val} value={m.val}>{m.label}</option>
              ))}
            </select>
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
              id="btn-add-transaction-dashboard"
            >
              + Add Transaction
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', opacity: 0.4 }}>
            <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3, borderColor: 'rgba(99,102,241,0.2)', borderTopColor: 'var(--color-primary)', margin: '0 auto' }} />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="summary-grid">
              <SummaryCard
                type="balance"
                label="Net Balance"
                amount={summary.balance}
                icon="⚖️"
                sub={summary.balance >= 0 ? '✅ You\'re in the green' : '⚠️ Expenses exceed income'}
              />
              <SummaryCard
                type="income"
                label="Total Income"
                amount={summary.totalIncome}
                icon="📈"
                sub="Money coming in"
              />
              <SummaryCard
                type="expense"
                label="Total Expenses"
                amount={summary.totalExpenses}
                icon="📉"
                sub="Money going out"
              />
            </div>

            {/* Chart + Recent */}
            <div className="dashboard-grid">
              {/* Chart */}
              <div className="card">
                <div className="section-header">
                  <h2>Spending Breakdown</h2>
                </div>
                <ExpenseChart data={summary.expenseBreakdown} />
              </div>

              {/* Recent Transactions */}
              <div className="card">
                <div className="section-header">
                  <h2>Recent Transactions</h2>
                  <Link to="/transactions" className="btn btn-ghost btn-sm">
                    View all →
                  </Link>
                </div>

                {recentTx.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">💸</div>
                    <h3>No transactions</h3>
                    <p>Start by adding your first transaction.</p>
                  </div>
                ) : (
                  <div className="transaction-list">
                    {recentTx.map(tx => (
                      <div key={tx.id} className="transaction-item">
                        <div className={`tx-icon ${tx.type.toLowerCase()}`}>
                          {CATEGORY_ICONS[tx.category_name] || (tx.type === 'INCOME' ? '💰' : '💸')}
                        </div>
                        <div className="tx-info">
                          <div className="tx-desc">
                            {tx.description || tx.category_name}
                          </div>
                          <div className="tx-meta">
                            {tx.category_name} · {formatDate(tx.transaction_date)}
                          </div>
                        </div>
                        <div className={`tx-amount ${tx.type.toLowerCase()}`}>
                          {tx.type === 'INCOME' ? '+' : '-'} {fmtLKR.format(tx.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {showForm && (
        <TransactionForm
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); load() }}
        />
      )}
    </div>
  )
}
