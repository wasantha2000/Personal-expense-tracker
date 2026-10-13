import { useState, useEffect } from 'react'
import { api } from '../services/api.js'

const CATEGORY_ICONS = {
  Food: '🍔', Transport: '🚌', Education: '📚', Shopping: '🛍️',
  Bills: '📄', Entertainment: '🎮', Health: '💊', Other: '📦',
  Salary: '💼', Freelance: '💻', Business: '🏢', 'Other Income': '💵',
}

export default function TransactionForm({ onSuccess, onClose, editData }) {
  const isEdit = !!editData

  const [type, setType] = useState(editData?.type || 'EXPENSE')
  const [categoryId, setCategoryId] = useState(editData?.category_id || '')
  const [amount, setAmount] = useState(editData?.amount || '')
  const [description, setDescription] = useState(editData?.description || '')
  const [transactionDate, setTransactionDate] = useState(
    editData?.transaction_date
      ? editData.transaction_date.split('T')[0]
      : new Date().toISOString().split('T')[0]
  )
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Load categories filtered by type
  useEffect(() => {
    api.get(`/categories?type=${type}`)
      .then(data => {
        setCategories(data.categories)
        // Reset category if switching type and current category not valid
        if (!editData || editData.type !== type) {
          setCategoryId(data.categories[0]?.id || '')
        }
      })
      .catch(() => setCategories([]))
  }, [type])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!categoryId) return setError('Please select a category')
    if (!amount || Number(amount) <= 0) return setError('Amount must be greater than 0')
    if (!transactionDate) return setError('Please select a date')

    setLoading(true)
    try {
      const body = {
        categoryId: Number(categoryId),
        type,
        amount: parseFloat(amount),
        description: description.trim() || undefined,
        transactionDate,
      }

      if (isEdit) {
        await api.put(`/transactions/${editData.id}`, body)
      } else {
        await api.post('/transactions', body)
      }

      onSuccess?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter(c => c.type === type)

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose?.()}>
      <div className="modal slide-up" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2>{isEdit ? '✏️ Edit Transaction' : '+ Add Transaction'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close" id="btn-close-modal">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} id="transaction-form">
          {/* Type toggle */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Transaction Type</label>
            <div className="type-toggle">
              <button
                type="button"
                className={type === 'EXPENSE' ? 'active-expense' : ''}
                onClick={() => setType('EXPENSE')}
                id="btn-type-expense"
              >
                💸 Expense
              </button>
              <button
                type="button"
                className={type === 'INCOME' ? 'active-income' : ''}
                onClick={() => setType('INCOME')}
                id="btn-type-income"
              >
                💰 Income
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Category */}
            <div className="form-group">
              <label className="form-label" htmlFor="tx-category">Category</label>
              <select
                id="tx-category"
                className="form-select"
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                required
              >
                {filteredCategories.length === 0 && (
                  <option value="">No categories available</option>
                )}
                {filteredCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {CATEGORY_ICONS[cat.name] || '📌'} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount + Date */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="tx-amount">Amount (LKR)</label>
                <input
                  id="tx-amount"
                  className="form-input"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="e.g. 1500"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="tx-date">Date</label>
                <input
                  id="tx-date"
                  className="form-input"
                  type="date"
                  value={transactionDate}
                  onChange={e => setTransactionDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="tx-desc">Description <span style={{ color: 'var(--color-text-muted)' }}>(optional)</span></label>
              <input
                id="tx-desc"
                className="form-input"
                type="text"
                placeholder="e.g. Lunch at restaurant"
                value={description}
                onChange={e => setDescription(e.target.value)}
                maxLength={200}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="alert alert-error">
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ flex: 2 }}
                id="btn-submit-transaction"
              >
                {loading ? <span className="spinner" /> : (isEdit ? 'Update' : 'Add Transaction')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
