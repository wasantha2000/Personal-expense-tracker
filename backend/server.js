const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
res.json({
message: 'Expense Tracker API is running!',
})
})

app.get('/api/health', (req, res) => {
res.json({
status: 'OK',
message: 'Backend is working correctly',
})
})

app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`)
})