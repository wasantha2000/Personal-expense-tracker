import { useState } from 'react'
import './App.css'

function App() {
const [expenses, setExpenses] = useState([])

const totalExpenses = expenses.reduce(
(total, expense) => total + Number(expense.amount),
0
)

const [title, setTitle] = useState('')
const [amount, setAmount] = useState('')
const [category, setCategory] = useState('Food')

function addExpense(event) {
event.preventDefault()

```
if (!title.trim() || !amount || Number(amount) <= 0) {
  alert('Please enter a valid expense.')
  return
}

const newExpense = {
  id: Date.now(),
  title: title.trim(),
  amount: Number(amount),
  category,
}

setExpenses((previousExpenses) => [...previousExpenses, newExpense])
setTitle('')
setAmount('')
```

}

return ( <div className="app"> <aside className="sidebar"> <h2>Expense Tracker</h2> <p className="sidebar-label">MENU</p> <div className="nav-item active">Dashboard</div> <div className="nav-item">Transactions</div> <div className="nav-item">Categories</div> </aside>

```
  <main className="main-content">
    <header className="page-header">
      <div>
        <h1>Dashboard</h1>
        <p>Welcome back! Here is your financial overview.</p>
      </div>
      <span className="user-avatar">U</span>
    </header>

    <section className="summary-grid">
      <div className="summary-card balance-card">
        <p>Total Balance</p>
        <h2>Rs. 0.00</h2>
        <span>Your current balance</span>
      </div>

      <div className="summary-card">
        <p>Total Income</p>
        <h2>Rs. 0.00</h2>
        <span className="positive">Income tracking coming soon</span>
      </div>

      <div className="summary-card">
        <p>Total Expenses</p>
        <h2>Rs. {totalExpenses.toLocaleString('en-LK', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}</h2>
        <span>Based on expenses you add</span>
      </div>
    </section>

    <section className="content-grid">
      <div className="panel">
        <h2>Add New Expense</h2>
        <p className="panel-description">Record your daily spending.</p>

        <form onSubmit={addExpense}>
          <label htmlFor="title">Expense name</label>
          <input
            id="title"
            type="text"
            placeholder="e.g. Lunch"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <label htmlFor="amount">Amount (LKR)</label>
          <input
            id="amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="e.g. 850"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />

          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option>Food</option>
            <option>Transport</option>
            <option>Education</option>
            <option>Shopping</option>
            <option>Bills</option>
            <option>Other</option>
          </select>

          <button type="submit">+ Add Expense</button>
        </form>
      </div>

      <div className="panel">
        <h2>Recent Transactions</h2>
        <p className="panel-description">Your latest expenses.</p>

        {expenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">₹</div>
            <h3>No transactions yet</h3>
            <p>Add your first expense using the form.</p>
          </div>
        ) : (
          <div className="transaction-list">
            {expenses.map((expense) => (
              <div className="transaction" key={expense.id}>
                <div className="transaction-icon">
                  {expense.category.charAt(0)}
                </div>
                <div className="transaction-info">
                  <strong>{expense.title}</strong>
                  <span>{expense.category}</span>
                </div>
                <strong className="expense-amount">
                  - Rs. {expense.amount.toLocaleString('en-LK', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  </main>
</div>


)
}

export default App