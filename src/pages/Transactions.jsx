import { useState, useEffect, useCallback } from 'react'
import Navbar from '../components/Navbar.jsx'
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

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [month, setMonth] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [type, setType] = useState('')

  // Modal state
  const [showForm, setShowForm] = useState(false)
  const [editData, setEditData] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Load categories once
  useEffect(() => {
    api.get('/categories')
      .then(d => setCategories(d.categories))
      .catch(() => {})
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (month) params.set('month', month)
      if (categoryId) params.set('categoryId', categoryId)
      if (type) params.set('type', type)
      params.set('limit', '100')

      const data = await api.get(`/transactions?${params}`)
      setTransactions(data.transactions)
      setTotal(data.total)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [month, categoryId, type])

  useEffect(() => { load() }, [load])

  async function handleDelete(id) {
    setDeleting(true)
    try {
      await api.delete(`/transactions/${id}`)
      setDeleteId(null)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  function openEdit(tx) {
    setEditData({
      id: tx.id,
      category_id: tx.category_id,
      type: tx.type,
      amount: tx.amount,
      description: tx.description || '',
      transaction_date: tx.transaction_date,
    })
    setShowForm(true)
  }

  // Month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-LK', { month: 'long', year: 'numeric' })
    return { val, label }
  })

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>Transactions</h1>
            <p>{total} record{total !== 1 ? 's' : ''} found</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => { setEditData(null); setShowForm(true) }}
            id="btn-add-transaction"
          >
            + Add Transaction
          </button>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <select
            className="filter-select"
            value={month}
            onChange={e => setMonth(e.target.value)}
            id="filter-month"
          >
            <option value="">All months</option>
            {monthOptions.map(m => (
              <option key={m.val} value={m.val}>{m.label}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={type}
            onChange={e => setType(e.target.value)}
            id="filter-type"
          >
            <option value="">All types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>

          <select
            className="filter-select"
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            id="filter-category"
          >
            <option value="">All categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
            ))}
          </select>

          {(month || type || categoryId) && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { setMonth(''); setType(''); setCategoryId('') }}
              id="btn-clear-filters"
            >
              ✕ Clear filters
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Transaction list */}
        <div className="card">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', opacity: 0.4 }}>
              <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3, borderColor: 'rgba(99,102,241,0.2)', borderTopColor: 'var(--color-primary)', margin: '0 auto' }} />
            </div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No transactions found</h3>
              <p>Try changing your filters or add a new transaction.</p>
            </div>
          ) : (
            <div className="transaction-list">
              {transactions.map(tx => (
                <div key={tx.id} className="transaction-item">
                  <div className={`tx-icon ${tx.type.toLowerCase()}`}>
                    {CATEGORY_ICONS[tx.category_name] || (tx.type === 'INCOME' ? '💰' : '💸')}
                  </div>
                  <div className="tx-info">
                    <div className="tx-desc">
                      {tx.description || tx.category_name}
                    </div>
                    <div className="tx-meta">
                      <span className={`badge badge-${tx.type.toLowerCase()}`}>
                        {tx.type}
                      </span>
                      &nbsp;·&nbsp;{tx.category_name}
                      &nbsp;·&nbsp;{formatDate(tx.transaction_date)}
                    </div>
                  </div>
                  <div className={`tx-amount ${tx.type.toLowerCase()}`}>
                    {tx.type === 'INCOME' ? '+' : '−'} {fmtLKR.format(tx.amount)}
                  </div>
                  <div className="tx-actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => openEdit(tx)}
                      title="Edit"
                      id={`btn-edit-${tx.id}`}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setDeleteId(tx.id)}
                      title="Delete"
                      id={`btn-delete-${tx.id}`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add / Edit modal */}
      {showForm && (
        <TransactionForm
          editData={editData}
          onClose={() => { setShowForm(false); setEditData(null) }}
          onSuccess={() => { setShowForm(false); setEditData(null); load() }}
        />
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteId(null)}>
          <div className="modal slide-up" style={{ maxWidth: 380 }}>
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🗑️</div>
              <h2 style={{ marginBottom: 8 }}>Delete Transaction?</h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>
                This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setDeleteId(null)}
                  style={{ flex: 1 }}
                  id="btn-cancel-delete"
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(deleteId)}
                  disabled={deleting}
                  style={{ flex: 1 }}
                  id="btn-confirm-delete"
                >
                  {deleting ? <span className="spinner" /> : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
