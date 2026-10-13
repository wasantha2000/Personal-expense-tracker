const express = require('express')
const cors = require('cors')
require('dotenv').config()

const pool = require('./src/config/db')
const categoryRoutes = require('./src/config/routes/categoryRoutes')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
app.use('/api/categories', categoryRoutes)

// Home route
app.get('/', (req, res) => {
  res.json({
    message: 'Expense Tracker API is running!',
  })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend is working correctly',
  })
})

// Test Neon database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()')

    res.json({
      status: 'success',
      message: 'Neon database connected successfully!',
      databaseTime: result.rows[0].now,
    })
  } catch (error) {
    console.error('Database connection error:', error.message)

    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
    })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})