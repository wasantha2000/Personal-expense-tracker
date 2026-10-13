import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <a href="/" className="navbar-brand" onClick={e => { e.preventDefault(); navigate('/') }}>
          <span className="brand-icon">💰</span>
          ExpenseTracker
        </a>

        {/* Nav links */}
        <div className={`navbar-nav${menuOpen ? ' open' : ''}`}>
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            📊 Dashboard
          </NavLink>
          <NavLink
            to="/transactions"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            📋 Transactions
          </NavLink>
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          {user && (
            <div className="user-info">
              <div className="user-avatar">{initials}</div>
              <span className="user-name">{user.name}</span>
            </div>
          )}
          <button className="btn btn-secondary btn-sm" onClick={handleLogout} id="btn-logout">
            Logout
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          id="btn-mobile-menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  )
}
